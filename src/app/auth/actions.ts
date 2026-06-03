"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export type AuthState = { error: string | null; success?: string | null };

export async function login(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "กรุณากรอกอีเมลและรหัสผ่าน" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.message.toLowerCase().includes("invalid")) {
      return { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" };
    }
    if (error.message.toLowerCase().includes("not confirmed")) {
      return {
        error: "ยังไม่ได้ยืนยันอีเมล — กรุณาเปิดอีเมลแล้วคลิกลิงก์ยืนยัน",
      };
    }
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const displayName = String(formData.get("display_name") || "").trim();
  const confirmPw = String(formData.get("confirm_password") || "");

  if (!email || !password || !displayName) {
    return { error: "กรุณากรอกทุกช่อง" };
  }
  if (password.length < 8) {
    return { error: "รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร" };
  }
  if (password !== confirmPw) {
    return { error: "รหัสผ่านทั้ง 2 ช่องไม่ตรงกัน" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } },
  });

  if (error) {
    if (error.message.toLowerCase().includes("registered")) {
      return { error: "อีเมลนี้สมัครไว้แล้ว ลองเข้าสู่ระบบแทน" };
    }
    return { error: error.message };
  }

  // If email confirmation required, no session yet
  if (!data.session) {
    return {
      error: null,
      success:
        "สมัครเรียบร้อย ✓ — เปิดอีเมล " + email + " แล้วกดยืนยันก่อนเข้าสู่ระบบ",
    };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
