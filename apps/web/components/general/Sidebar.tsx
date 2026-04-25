import { LogOutIcon } from "lucide-react";

export const Sidebar = () => {
  return (
    <div className="flex h-screen w-20 flex-col items-center justify-between border-r-2 border-black bg-white">
      <div></div>
      <div className="w-full">
        <div className="flex w-full items-center gap-2 bg-black p-2">
          <LogOutIcon className="w-8 text-white" />
        </div>
      </div>
    </div>
  );
};
