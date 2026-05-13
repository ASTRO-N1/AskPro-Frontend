import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AskPro — Sign in",
  description: "Sign in to your AskPro IoT Dashboard account",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* ── Brand panel (left, hidden on mobile) ── */}
      <aside
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 relative overflow-hidden"
        style={{ background: "var(--primary)" }}
      >
        {/* Decorative circles */}
        <div
          className="absolute -top-24 -left-24 h-72 w-72 rounded-full opacity-20"
          style={{ background: "var(--accent)" }}
        />
        <div
          className="absolute bottom-0 right-0 h-96 w-96 rounded-full opacity-10"
          style={{ background: "var(--accent)" }}
        />

        {/* Content */}
        <div className="relative z-10 max-w-sm text-center space-y-6">
          <div
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl shadow-2xl"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            {/* Inline SVG logo */}
            <svg
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-11 w-11"
            >
              <circle cx="24" cy="24" r="20" fill="white" fillOpacity="0.15" />
              <path
                d="M16 32V22a8 8 0 0 1 16 0v10"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="24" cy="34" r="3" fill="white" />
            </svg>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-white">AskPro</h2>
            <p className="mt-2 text-lg" style={{ color: "rgba(255,255,255,0.75)" }}>
              IoT Device Management Platform
            </p>
          </div>

          <ul className="space-y-3 text-left">
            {[
              "Real-time device monitoring",
              "Batch transaction management",
              "Role-based access control",
              "Instant alerting via email & SMS",
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-white/80">
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                  style={{ background: "var(--accent)", color: "var(--accent-foreground)" }}
                >
                  ✓
                </span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* ── Form panel (right) ── */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12 bg-background">
        {children}
      </main>
    </div>
  );
}
