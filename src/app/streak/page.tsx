import { CelebrateDialog } from "@/components/CelebrateDialog";
import { StreakForm } from "@/components/StreakForm";
import StreakList from "@/components/StreakList";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex flex-col lg:w-1/2">
        <div className="flex flex-col items-center justify-center gap-2 lg:flex-row lg:justify-between">
          <h1 className="flex text-2xl font-bold">StreakList</h1>
          <StreakForm />
        </div>
        <Suspense fallback={<Skeleton />}>
          <StreakList />
          <CelebrateDialog />
        </Suspense>
      </div>
    </div>
  );
}
