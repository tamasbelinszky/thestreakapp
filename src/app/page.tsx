"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const { data } = useSession();

  return (
    <div className="flex flex-col items-center justify-center gap-6 lg:gap-24">
      <h1 className="text-3xl font-bold">{data?.user ? `Hello ${data.user.name}! 👋` : "Welcome to thestreak"}</h1>
      {!data && <Button onClick={() => signIn()}>Sign in with Github</Button>}

      {data && (
        <div className="flex flex-col gap-8">
          <Link className={buttonVariants({ size: "lg" })} href="/streak">
            Go to Streak
          </Link>
          <Button
            className={buttonVariants({
              size: "lg",
              variant: "outline",
              className: "text-black",
            })}
            onClick={() => signOut()}
          >
            Sign out
          </Button>
        </div>
      )}
    </div>
  );
}
