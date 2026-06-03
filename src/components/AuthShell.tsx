import type { ReactNode } from "react";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-rose)] grid place-items-center text-white font-bold text-3xl font-display shadow-lg shadow-[var(--color-primary)]/30 mb-3">
            ต
          </div>
          <h1 className="text-2xl font-display font-bold text-[var(--color-ink)]">
            ตระการตาผ้าไทย
          </h1>
          <p className="text-sm text-[var(--color-muted)] mt-1">
            ตารางคอนเทนต์ทีม
          </p>
        </div>

        <div className="bg-white rounded-3xl p-7 shadow-[var(--shadow-soft)] border border-[var(--color-border)]">
          <h2 className="font-display text-xl text-[var(--color-ink)] mb-1">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-[var(--color-muted)] mb-5">{subtitle}</p>
          )}
          {children}
        </div>

        {footer && (
          <p className="text-center text-sm text-[var(--color-ink-soft)] mt-5">
            {footer}
          </p>
        )}
      </div>
    </main>
  );
}

export function Field({
  label,
  name,
  type = "text",
  placeholder,
  autoComplete,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  defaultValue?: string;
}) {
  return (
    <label className="block mb-4">
      <span className="text-sm font-medium text-[var(--color-ink-soft)] mb-1.5 block">
        {label}
      </span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        required
        className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-3 focus:ring-[var(--color-primary-soft)] transition"
      />
    </label>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm">
      {message}
    </div>
  );
}

export function SuccessBox({ message }: { message: string }) {
  return (
    <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-4 text-sm">
      {message}
    </div>
  );
}
