import { StreakForm } from "@/components/StreakForm";
import StreakList from "@/components/StreakList";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center">
      {/* <StreakForm />; */}
      <div className="flex flex-col lg:w-1/2">
        <div className="flex flex-col items-center justify-center gap-2 lg:flex-row lg:justify-between">
          <h1 className="flex text-2xl font-bold">StreakList</h1>
          <StreakForm />
        </div>

        <StreakList />
      </div>
    </div>
  );
}
