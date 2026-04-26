import { Skeleton } from "@/components/ui/skeleton";

export const PinSkeleton = () => {
  return (
    <div className="relative flex w-full flex-col border-[3px] border-black bg-white p-5 pt-5">
      <Skeleton className="absolute -top-3 left-4 h-6 w-14 border-2 border-black" />
      <Skeleton className="absolute top-3 right-4 h-4 w-6" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
};
