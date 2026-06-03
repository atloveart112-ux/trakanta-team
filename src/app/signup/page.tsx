import Link from "next/link";
import { AuthShell } from "@/components/AuthShell";
import { SignupForm } from "./SignupForm";

export default function SignupPage() {
  return (
    <AuthShell
      title="สมัครสมาชิก"
      subtitle="สำหรับทีม ตระการตาผ้าไทย"
      footer={
        <>
          มีบัญชีอยู่แล้ว?{" "}
          <Link
            href="/login"
            className="text-[var(--color-primary)] font-semibold hover:underline"
          >
            เข้าสู่ระบบ
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthShell>
  );
}
