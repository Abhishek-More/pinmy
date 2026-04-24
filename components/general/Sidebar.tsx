import { LogOutIcon } from "lucide-react";

export const Sidebar = () => {
  return (
    <div className="flex h-screen w-20 flex-col items-center justify-between border-r-2 border-black bg-white py-4">
      <div></div>
      <div>
        <div className="flex items-center gap-2 px-4 py-2">
          <LogOutIcon className="w-8 text-black" />
        </div>
      </div>
    </div>
  );
};
