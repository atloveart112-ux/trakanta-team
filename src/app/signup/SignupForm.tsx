"use client";

import { useActionState } from "react";
import { signup, type AuthState } from "@/app/auth/actions";
import { ErrorBox, Field, SuccessBox } from "@/components/AuthShell";

const initial: AuthState = { error: null };

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signup, initial);

  if (state.success) {
    return <SuccessBox message={state.success} />;
  }

  return (
    <form action={formAction}>
      {state.error && <ErrorBox message={state.error} />}

      <Field
        label="ชื่อแสดง"
        name="display_name"
        placeholder="เช่น Art, Pop, ต่าย, แจ็ค"
        autoComplete="nickname"
      />

      <Field
        label="อีเมล"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
      />

      <Field
        label="รหัสผ่าน"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="อย่างน้อย 8 ตัวอักษร"
      />

      <Field
        label="ยืนยันรหัสผ่าน"
        name="confirm_password"
        type="password"
        autoComplete="new-password"
        placeholder="พิมพ์รหัสผ่านอีกครั้ง"
      />

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-[var(--color-primary)] text-white font-semibold py-3 rounded-xl hover:bg-[#C95E45] transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? "กำลังสมัคร..." : "สมัครสมาชิก"}
      </button>
    </form>
  );
}
