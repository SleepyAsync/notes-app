"use client";

import { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { MarkdownEditor } from "@/components/MarkdownEditor";

type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("<p>Bắt đầu viết ghi chú markdown...</p>");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      void fetchNotes();
    }
  }, [status]);

  async function fetchNotes() {
    const res = await fetch("/api/notes");
    if (!res.ok) return;
    const data: Note[] = await res.json();
    setNotes(data);
    if (data.length && !activeNoteId) {
      const first = data[0];
      setActiveNoteId(first.id);
      setTitle(first.title);
      setContent(first.content);
    }
  }

  async function handleSave() {
    if (!title.trim()) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activeNoteId,
          title,
          content,
        }),
      });
      if (!res.ok) return;
      const saved: Note = await res.json();
      setActiveNoteId(saved.id);
      setNotes((prev) => {
        const other = prev.filter((n) => n.id !== saved.id);
        return [saved, ...other];
      });
    } finally {
      setIsSaving(false);
    }
  }

  function handleNewNote() {
    setActiveNoteId(null);
    setTitle("Ghi chú mới");
    setContent("<p></p>");
  }

  async function handleDelete() {
    if (!activeNoteId) return;
    setIsDeleting(true);
    try {
      await fetch(`/api/notes?id=${activeNoteId}`, {
        method: "DELETE",
      });
      setNotes((prev) => prev.filter((n) => n.id !== activeNoteId));
      setActiveNoteId(null);
      setTitle("");
      setContent("<p></p>");
    } finally {
      setIsDeleting(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-200">
        <p className="text-sm text-slate-400">Đang tải phiên đăng nhập...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/40">
          <h1 className="mb-2 text-center text-2xl font-semibold tracking-tight">
            Notes Dashboard
          </h1>
          <p className="mb-6 text-center text-sm text-slate-400">
            Đăng nhập với GitHub để bắt đầu viết và quản lý ghi chú markdown.
          </p>
          <button
            onClick={() => signIn("github")}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-slate-900 shadow-lg shadow-slate-900/50 transition hover:bg-slate-100"
          >
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
              GH
            </span>
            Đăng nhập với GitHub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <aside className="hidden w-72 border-r border-slate-800/80 bg-slate-950/60 px-4 py-5 md:flex md:flex-col">
        <div className="mb-6 flex items-center justify-between gap-2">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
              NOTES
            </p>
            <p className="text-sm font-medium text-slate-200">
              {session.user?.name ?? "Người dùng"}
            </p>
          </div>
          <button
            onClick={() => signOut()}
            className="rounded-full border border-slate-700/70 px-3 py-1 text-xs text-slate-300 transition hover:border-slate-500 hover:text-white"
          >
            Đăng xuất
          </button>
        </div>
        <button
          onClick={handleNewNote}
          className="mb-4 flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-emerald-950 shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400"
        >
          + Ghi chú mới
        </button>
        <div className="flex-1 space-y-1 overflow-y-auto pr-1 text-xs">
          {notes.length === 0 && (
            <p className="mt-8 text-center text-slate-500">
              Chưa có ghi chú nào.
              <br />
              Hãy tạo ghi chú đầu tiên của bạn!
            </p>
          )}
          {notes.map((note) => (
            <button
              key={note.id}
              onClick={() => {
                setActiveNoteId(note.id);
                setTitle(note.title);
                setContent(note.content);
              }}
              className={`block w-full rounded-lg border px-3 py-2 text-left transition ${
                activeNoteId === note.id
                  ? "border-emerald-500/80 bg-emerald-500/5 text-emerald-100"
                  : "border-slate-800/80 bg-slate-900/60 text-slate-200 hover:border-slate-600 hover:bg-slate-900"
              }`}
            >
              <p className="line-clamp-1 text-xs font-medium">{note.title}</p>
              <p className="mt-1 line-clamp-1 text-[11px] text-slate-500">
                {new Date(note.updatedAt).toLocaleString()}
              </p>
            </button>
          ))}
        </div>
      </aside>

      <main className="flex-1 px-4 py-4 md:px-8 md:py-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-lg font-semibold tracking-tight md:text-xl">
              Markdown Notes
            </h1>
            <p className="text-xs text-slate-400">
              Ghi chú, soạn thảo và lưu trữ nội dung của bạn trong Supabase.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="hidden text-slate-500 md:inline">
              {session.user?.email}
            </span>
            <button
              onClick={() => signOut()}
              className="rounded-full border border-slate-700/80 px-3 py-1 text-[11px] transition hover:border-slate-500 hover:text-white"
            >
              Đăng xuất
            </button>
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4 shadow-2xl shadow-slate-950/60 md:p-5">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tiêu đề ghi chú..."
            className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <MarkdownEditor value={content} onChange={setContent} />
          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={isSaving || !title.trim()}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-emerald-950 shadow-lg shadow-emerald-500/40 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Đang lưu..." : "Lưu ghi chú"}
              </button>
              {activeNoteId && (
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-1 rounded-full border border-red-500/70 px-3 py-1.5 text-[11px] font-medium text-red-300 transition hover:border-red-400 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isDeleting ? "Đang xoá..." : "Xoá"}
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              Dữ liệu được lưu bằng PostgreSQL trên Supabase qua Prisma.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}


