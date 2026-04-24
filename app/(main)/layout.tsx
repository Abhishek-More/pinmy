import { Sidebar } from "@/components/general/Sidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
