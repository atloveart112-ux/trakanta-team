"use client";

import { useActionState } from "react";
import { login, type AuthState } from "@/app/auth/actions";
import { ErrorBox, Field } from "@/components/AuthShell";

const initial: AuthState = { error: null };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initial);

  return (
    <form action={formAction}>
      {state.error && <ErrorBox message={state.error} />}

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
        autoComplete="current-password"
        placeholder="••••••••"
      />

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-[var(--color-primary)] text-white font-semibold py-3 rounded-xl hover:bg-[#C95E45] transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
      </button>
    </form>
  );
}
