"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 lg:gap-24">
      <div className="flex justify-center">
        <section>
          <h1 className="text-4xl font-bold">The Streak App</h1>
          <h2 className="text-xl font-semibold">Streaks Unleashed!</h2>
          <p className="text-center">Create streaks and track your progress. How long can you go?</p>
          <Button size={"lg"} onClick={() => signIn("", { callbackUrl: "/streak?signedInState=signedIn" })}>
            Get Started
          </Button>
        </section>
      </div>
      <Image
        src={"/thestreakapp-icon.png"}
        width={64}
        height={64}
        alt="thestreakapp_icon"
        className="hover:animate-spin"
      />
    </div>
  );
}
