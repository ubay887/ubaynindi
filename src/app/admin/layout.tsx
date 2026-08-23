import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin · Generator Undangan",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-[#eef0eb] text-ink antialiased">{children}</div>
  );
}
