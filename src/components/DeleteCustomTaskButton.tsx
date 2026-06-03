"use client";

import { useTransition } from "react";
import { deleteCustomTask } from "@/app/actions/tasks";

export function DeleteCustomTaskButton({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm(`ลบงาน "${title}" ออกจากตาราง?`)) return;
    startTransition(async () => {
      await deleteCustomTask(id);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      title="ลบงานนี้"
      className="text-sm px-2.5 py-1 rounded-full text-[var(--color-muted)] hover:bg-red-50 hover:text-red-700 transition disabled:opacity-40"
    >
      🗑️
    </button>
  );
}
