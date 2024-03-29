import { StreakFormCreate } from "@/components/StreakFormCreate";
import StreakList from "@/components/StreakList";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { Suspense } from "react";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex flex-col gap-2 lg:w-1/2">
        <div className="flex flex-col items-center justify-center gap-2 py-2 lg:mb-8 lg:flex-row lg:justify-between">
          <Image
            className="hidden hover:animate-spin lg:block"
            src={"/icon.png"}
            width={64}
            height={64}
            alt="thestreakapp_icon"
          />
          <StreakFormCreate />
        </div>
        <Suspense fallback={<Skeleton />}>
          <StreakList />
        </Suspense>
      </div>
    </div>
  );
}
