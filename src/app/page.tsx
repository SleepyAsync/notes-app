export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4">
      <div className="w-full max-w-xl rounded-3xl border border-slate-800/80 bg-slate-950/80 p-8 text-center shadow-2xl shadow-slate-950/60">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
          NOTES DASHBOARD
        </p>
        <h1 className="mb-3 text-3xl font-semibold tracking-tight text-slate-50">
          Markdown notes + NextAuth + PlanetScale
        </h1>
        <p className="mb-6 text-sm text-slate-400">
          Ứng dụng ghi chú markdown, đăng nhập bằng GitHub, lưu dữ liệu với
          Prisma + PlanetScale và UI Tailwind hiện đại.
        </p>
        <a
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-500/40 transition hover:bg-emerald-400"
        >
          Vào dashboard
        </a>
      </div>
    </div>
  );
}
