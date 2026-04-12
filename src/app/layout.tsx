import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "mtnlabs.ai — Plan your next mountain adventure",
  description: "AI-powered route planning for Norwegian mountains. Discover trails, plan ski tours, and explore the Norwegian wilderness.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
