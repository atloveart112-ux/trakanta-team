"use server";

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from env

/**
 * Prompt caching: BRAND_SYSTEM_PROMPT + TOOLS are module-scoped (stable bytes
 * across calls) so the Anthropic cache hits on the 2nd+ call within 5 minutes.
 * Today's date is a SEPARATE, uncached system block — putting it inside the
 * brand prompt would invalidate the cache daily.
 */
const BRAND_SYSTEM_PROMPT = `You are a content planning assistant for "ตระการตาผ้าไทย" (Trakanta Pha Thai), a Thai handwoven clothing brand serving women aged 35-65 with premium custom-tailored garments.

The content team has 4 members:
- Art (art) — photographer and image creator; can also write cover-text concepts
- Pop (pop) — graphic designer; creates cover images with text overlay
- ต่าย (tai) — copywriter; writes Thai captions
- แจ็ค (jack) — video editor; edits Reels and short clips

Recurring weekly schedule already exists:
- Mon/Wed/Fri 08:00 — รีวิวภาพนิ่ง (FB, IG)
- Tue/Thu 12:00 — Reels รีวิว (FB, IG, TikTok, YouTube)
- Tue/Thu 19:00 — คลิปสปอยสินค้า (FB, IG, TikTok, YouTube)
- Wed/Sun 19:00 — คอนเทนต์กลุ่มปิด (กลุ่มปิด FB)
- Sat 12:00 — รีวิวลูกค้า / engagement (FB)
- Sun 08:00 — Reels จับนุ่งผ้าถุง (FB, IG, TikTok, YouTube)

Your job: read meeting notes (in Thai, English, or mixed) and propose new ad-hoc content tasks by calling add_task. Be conservative:

- Only call add_task for NEW tasks clearly stated. Do NOT duplicate the recurring schedule above unless the meeting explicitly says to add an EXTRA one on top.
- If a date is vague ("next week", "soon"), infer the most likely concrete date from context. If you cannot determine a date confidently, do not propose the task.
- Default time to 12:00 if unspecified.
- Default crew_members by content type: photo work → ["art", "pop", "tai"]; video work → ["jack", "art", "pop", "tai"]. Override when the meeting names specific people.
- crew_members values must be exactly: art, pop, tai, jack.
- platforms: pass through what the meeting said as a comma-separated string (e.g. "FB, IG, TikTok"). Default "FB, IG" if unspecified.
- After all add_task calls, write a brief Thai summary of what you proposed. If the notes contain no actionable new tasks, do not call any tool — instead respond in Thai explaining what's unclear or that nothing actionable was found.`;

const TOOLS = [
  {
    name: "add_task",
    description:
      "Propose adding a new content task to the team's schedule. Call once per task. The user will review all proposed tasks before they're committed to the database.",
    input_schema: {
      type: "object" as const,
      properties: {
        date: {
          type: "string",
          description: "ISO date in YYYY-MM-DD format. Must be today or a future date.",
        },
        time: {
          type: "string",
          description: "24-hour time in HH:MM format. Default 12:00 if unspecified.",
        },
        title: {
          type: "string",
          description: "Short Thai title, e.g. 'Reels VIP รุ่น Limited' or 'ภาพนิ่งผ้าแพรวา'.",
        },
        platforms: {
          type: "string",
          description: "Comma-separated platform list, e.g. 'FB, IG'. Default 'FB, IG'.",
        },
        crew_members: {
          type: "array",
          items: { type: "string", enum: ["art", "pop", "tai", "jack"] },
          description: "Crew assigned. Photo → [art, pop, tai]; video → [jack, art, pop, tai].",
          minItems: 1,
        },
      },
      required: ["date", "time", "title", "platforms", "crew_members"],
    },
    cache_control: { type: "ephemeral" as const },
  },
];

export type ProposedTask = {
  date: string;
  time: string;
  title: string;
  platforms: string;
  crew_members: ("art" | "pop" | "tai" | "jack")[];
};

export type ParseResult = {
  actions: ProposedTask[];
  text: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    cacheReadTokens: number;
    cacheCreationTokens: number;
  };
  error?: string;
};

export async function parseMeetingNotes(notes: string): Promise<ParseResult> {
  if (!notes?.trim()) {
    return {
      actions: [],
      text: "",
      usage: { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheCreationTokens: 0 },
      error: "กรุณาใส่สรุปประชุม",
    };
  }

  try {
    const today = new Date().toISOString().slice(0, 10);

    const response = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 4096,
      system: [
        {
          type: "text",
          text: BRAND_SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
        {
          type: "text",
          text: `Today's date (Asia/Bangkok): ${today}`,
        },
      ],
      tools: TOOLS,
      messages: [{ role: "user", content: notes }],
    });

    const actions: ProposedTask[] = [];
    const textParts: string[] = [];

    for (const block of response.content) {
      if (block.type === "tool_use" && block.name === "add_task") {
        const input = block.input as Partial<ProposedTask>;
        if (
          typeof input.date === "string" &&
          typeof input.time === "string" &&
          typeof input.title === "string" &&
          typeof input.platforms === "string" &&
          Array.isArray(input.crew_members) &&
          input.crew_members.length > 0 &&
          input.crew_members.every(
            (c): c is ProposedTask["crew_members"][number] =>
              c === "art" || c === "pop" || c === "tai" || c === "jack",
          )
        ) {
          actions.push({
            date: input.date,
            time: input.time,
            title: input.title,
            platforms: input.platforms,
            crew_members: input.crew_members,
          });
        }
      } else if (block.type === "text") {
        textParts.push(block.text);
      }
    }

    return {
      actions,
      text: textParts.join("\n").trim(),
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        cacheReadTokens: response.usage.cache_read_input_tokens ?? 0,
        cacheCreationTokens: response.usage.cache_creation_input_tokens ?? 0,
      },
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      actions: [],
      text: "",
      usage: { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheCreationTokens: 0 },
      error: msg,
    };
  }
}

/**
 * Apply proposed tasks: insert each into custom_tasks via the same code path
 * as the manual Add Task button.
 */
export async function applyProposedTasks(
  tasks: ProposedTask[],
): Promise<{ inserted: number; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { inserted: 0, error: "not authenticated" };

  if (tasks.length === 0) return { inserted: 0 };

  const rows = tasks.map((t) => ({
    date: t.date,
    time: t.time,
    title: t.title,
    platforms: t.platforms,
    custom_crew: t.crew_members,
    crew_type: null,
    created_by: user.id,
  }));

  const { error } = await supabase.from("custom_tasks").insert(rows);
  if (error) return { inserted: 0, error: error.message };

  for (const t of tasks) {
    await supabase.from("activity_log").insert({
      actor_id: user.id,
      action: "task_add",
      date: t.date,
      metadata: {
        time: t.time,
        title: t.title,
        platforms: t.platforms,
        crew: t.crew_members,
        source: "ai_agent",
      },
    });
  }

  revalidatePath("/");
  return { inserted: tasks.length };
}
