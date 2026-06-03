"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type ActionResult = { error?: string };

async function actor() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("not authenticated");
  return { supabase, userId: user.id };
}

/* ============================================================
 * task_progress — checkbox per crew member
 * ============================================================ */
export async function toggleCheck(
  date: string,
  slotKey: string,
  crewKey: string,
): Promise<ActionResult> {
  const { supabase, userId } = await actor();

  const { data: existing } = await supabase
    .from("task_progress")
    .select("id")
    .eq("date", date)
    .eq("slot_key", slotKey)
    .eq("crew_key", crewKey)
    .maybeSingle();

  if (existing) {
    await supabase.from("task_progress").delete().eq("id", existing.id);
    await supabase.from("activity_log").insert({
      actor_id: userId,
      action: "uncheck",
      date,
      slot_key: slotKey,
      crew_key: crewKey,
    });
  } else {
    await supabase.from("task_progress").insert({
      date,
      slot_key: slotKey,
      crew_key: crewKey,
      done_by: userId,
    });
    await supabase.from("activity_log").insert({
      actor_id: userId,
      action: "check",
      date,
      slot_key: slotKey,
      crew_key: crewKey,
    });
  }

  revalidatePath("/");
  return {};
}

/* ============================================================
 * captions — long-form text attached to crew slot
 * ============================================================ */
export async function saveCaption(
  date: string,
  slotKey: string,
  crewKey: string,
  content: string,
): Promise<ActionResult> {
  const { supabase, userId } = await actor();
  const trimmed = content.trim();

  if (!trimmed) {
    await supabase
      .from("captions")
      .delete()
      .eq("date", date)
      .eq("slot_key", slotKey)
      .eq("crew_key", crewKey);
    await supabase.from("activity_log").insert({
      actor_id: userId,
      action: "caption_clear",
      date,
      slot_key: slotKey,
      crew_key: crewKey,
    });
  } else {
    await supabase.from("captions").upsert(
      {
        date,
        slot_key: slotKey,
        crew_key: crewKey,
        content: trimmed,
        updated_by: userId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "date,slot_key,crew_key" },
    );
    await supabase.from("activity_log").insert({
      actor_id: userId,
      action: "caption_update",
      date,
      slot_key: slotKey,
      crew_key: crewKey,
      metadata: { length: trimmed.length },
    });
  }

  // Caption changes don't need full revalidate — clients hold the textarea
  return {};
}

/* ============================================================
 * images — file upload to Supabase Storage + metadata row
 * ============================================================ */
export async function uploadImage(formData: FormData): Promise<ActionResult> {
  const { supabase, userId } = await actor();

  const file = formData.get("file");
  const date = String(formData.get("date") || "");
  const slotKey = String(formData.get("slot_key") || "");
  const crewKey = String(formData.get("crew_key") || "");

  if (!(file instanceof File)) return { error: "no file" };
  if (!date || !slotKey || !crewKey) return { error: "missing fields" };
  if (!file.type.startsWith("image/")) return { error: "ไฟล์ต้องเป็นรูปภาพ" };
  if (file.size > 25 * 1024 * 1024)
    return { error: "ไฟล์ใหญ่เกิน 25MB" };

  // Remove existing file (if any) so storage doesn't accumulate
  const { data: existing } = await supabase
    .from("images")
    .select("storage_path")
    .eq("date", date)
    .eq("slot_key", slotKey)
    .eq("crew_key", crewKey)
    .maybeSingle();
  if (existing) {
    await supabase.storage
      .from("content-images")
      .remove([existing.storage_path]);
  }

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().slice(0, 5);
  const safeSlot = slotKey.replace(/[|:/]/g, "_");
  const path = `${date}/${safeSlot}/${crewKey}-${Date.now()}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from("content-images")
    .upload(path, file, { contentType: file.type, upsert: true });
  if (upErr) return { error: upErr.message };

  await supabase.from("images").upsert(
    {
      date,
      slot_key: slotKey,
      crew_key: crewKey,
      storage_path: path,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
      uploaded_by: userId,
      uploaded_at: new Date().toISOString(),
    },
    { onConflict: "date,slot_key,crew_key" },
  );

  await supabase.from("activity_log").insert({
    actor_id: userId,
    action: "image_upload",
    date,
    slot_key: slotKey,
    crew_key: crewKey,
    metadata: { name: file.name, size: file.size },
  });

  revalidatePath("/");
  return {};
}

export async function deleteImage(
  date: string,
  slotKey: string,
  crewKey: string,
): Promise<ActionResult> {
  const { supabase, userId } = await actor();

  const { data: existing } = await supabase
    .from("images")
    .select("id,storage_path")
    .eq("date", date)
    .eq("slot_key", slotKey)
    .eq("crew_key", crewKey)
    .maybeSingle();

  if (existing) {
    await supabase.storage
      .from("content-images")
      .remove([existing.storage_path]);
    await supabase.from("images").delete().eq("id", existing.id);
    await supabase.from("activity_log").insert({
      actor_id: userId,
      action: "image_delete",
      date,
      slot_key: slotKey,
      crew_key: crewKey,
    });
  }

  revalidatePath("/");
  return {};
}

/* ============================================================
 * custom_tasks — ad-hoc tasks per specific date
 * ============================================================ */
export async function addCustomTask(formData: FormData): Promise<ActionResult> {
  const { supabase, userId } = await actor();

  const date = String(formData.get("date") || "");
  const time = String(formData.get("time") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const platforms = String(formData.get("platforms") || "").trim() || "—";
  const crewType = String(formData.get("crew_type") || "");

  if (!date) return { error: "ไม่พบวันที่" };
  if (!time) return { error: "กรุณาใส่เวลา" };
  if (!title) return { error: "กรุณาใส่ชื่องาน" };
  if (crewType !== "photo" && crewType !== "video")
    return { error: "ทีมงานไม่ถูกต้อง" };

  const { error } = await supabase.from("custom_tasks").insert({
    date,
    time,
    title,
    platforms,
    crew_type: crewType,
    created_by: userId,
  });
  if (error) return { error: error.message };

  await supabase.from("activity_log").insert({
    actor_id: userId,
    action: "task_add",
    date,
    metadata: { time, title, platforms, crew_type: crewType },
  });

  revalidatePath("/");
  return {};
}

export async function deleteCustomTask(id: string): Promise<ActionResult> {
  const { supabase, userId } = await actor();

  const { data: existing } = await supabase
    .from("custom_tasks")
    .select("date,title,time")
    .eq("id", id)
    .maybeSingle();

  if (!existing) return { error: "ไม่พบงานนี้" };

  await supabase.from("custom_tasks").delete().eq("id", id);
  await supabase.from("activity_log").insert({
    actor_id: userId,
    action: "task_delete",
    date: existing.date,
    metadata: { title: existing.title, time: existing.time },
  });

  revalidatePath("/");
  return {};
}

/* ============================================================
 * important_flags
 * ============================================================ */
export async function toggleImportant(
  date: string,
  slotKey: string,
  crewKey: string,
): Promise<ActionResult> {
  const { supabase, userId } = await actor();

  const { data: existing } = await supabase
    .from("important_flags")
    .select("id")
    .eq("date", date)
    .eq("slot_key", slotKey)
    .eq("crew_key", crewKey)
    .maybeSingle();

  if (existing) {
    await supabase.from("important_flags").delete().eq("id", existing.id);
    await supabase.from("activity_log").insert({
      actor_id: userId,
      action: "important_off",
      date,
      slot_key: slotKey,
      crew_key: crewKey,
    });
  } else {
    await supabase.from("important_flags").insert({
      date,
      slot_key: slotKey,
      crew_key: crewKey,
      flagged_by: userId,
    });
    await supabase.from("activity_log").insert({
      actor_id: userId,
      action: "important_on",
      date,
      slot_key: slotKey,
      crew_key: crewKey,
    });
  }

  revalidatePath("/");
  return {};
}
