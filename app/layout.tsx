// This file is required by Next.js but should not render anything
// when using the app router with locale-based routing.
// The actual layout is handled by app/[locale]/layout.tsx

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
