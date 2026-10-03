import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — Canvas India Catalog",
  description: "Internal admin panel for Canvas India product catalog submissions.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
