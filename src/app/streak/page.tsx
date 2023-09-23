import { StreakForm } from "@/components/StreakForm";
import StreakList from "@/components/StreakList";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex flex-col gap-2 lg:w-1/2">
        <div className="mb-2 flex flex-col items-center justify-center gap-2 lg:mb-8 lg:flex-row lg:justify-between">
          <Link href={"/"} className="flex items-center gap-2 text-end text-2xl font-bold">
            <Image className="hidden lg:block" src={"/../icon.png"} width={64} height={64} alt="thestreakapp_icon" />
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
