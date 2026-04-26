import { Sidebar } from "@/components/general/Sidebar";
import { EditPinModal } from "@/components/pins/modals/EditPinModal";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full">
      <main className="flex-1">{children}</main>
      <EditPinModal />
    </div>
  );
}
