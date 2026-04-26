import { WeeklyPins } from "../stats/WeeklyPins";

export const RightSidebar = () => {
  return (
    <div className="col-span-3 hidden h-full w-full flex-col px-8 pt-16 pr-8 xl:flex">
      <WeeklyPins />
    </div>
  );
};
