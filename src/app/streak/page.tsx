"use client";

import { StreakForm } from "@/components/StreakForm";
import StreakList from "@/components/StreakList";
import { useState } from "react";

export default function Page() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center">
      {/* <StreakForm />; */}
      <div className="flex flex-col lg:w-1/2">
        <div className="flex flex-row justify-between">
          <h1 className="flex text-2xl font-bold">StreakList</h1>
          <StreakForm />
        </div>

        <StreakList />
      </div>
    </div>
  );
}
