import Link from "next/link";
import { AuthShell } from "@/components/AuthShell";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <AuthShell
      title="เข้าสู่ระบบ"
      subtitle="ยินดีต้อนรับกลับมาค่ะ"
      footer={
        <>
          ยังไม่มีบัญชี?{" "}
          <Link
            href="/signup"
            className="text-[var(--color-primary)] font-semibold hover:underline"
          >
            สมัครเลย
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
