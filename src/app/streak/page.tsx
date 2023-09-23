import { StreakForm } from "@/components/StreakForm";
import StreakList from "@/components/StreakList";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Suspense } from "react";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex flex-col gap-2 lg:w-1/2">
        <div className="mb-2 flex flex-col items-center justify-center gap-2 lg:mb-8 lg:flex-row lg:justify-between">
          <Link href={"/"} className="flex text-2xl font-bold">
            TheStreakApp
          </Link>
          <StreakForm />
        </div>

        <Suspense fallback={<Skeleton />}>
          <StreakList />
        </Suspense>
      </div>
    </div>
  );
}
