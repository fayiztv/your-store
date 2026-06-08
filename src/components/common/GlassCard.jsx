export default function GlassCard({ children, className = '' }) {
  return (
    <div
      className={`rounded-2xl border border-white/20 bg-white/85 shadow-[0_8px_32px_rgba(0,0,0,0.1)] backdrop-blur-xl dark:bg-white/5 ${className}`}
    >
      {children}
    </div>
  );
}
