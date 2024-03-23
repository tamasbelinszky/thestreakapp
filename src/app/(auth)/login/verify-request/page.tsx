import { Icons } from "@/components/Icons";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Login - Verify Request",
  description: "Verify your email to sign in to your account",
};

export default function VerifyRequestPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Link href="/" className={cn(buttonVariants({ variant: "ghost" }), "absolute left-4 top-4 md:left-8 md:top-8")}>
        <>
          <Icons.chevronLeft className="mr-2 h-4 w-4" />
          Back
        </>
      </Link>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex w-full flex-col items-center justify-center space-y-2 text-center">
          <Image
            src={"/thestreakapp-icon.png"}
            width={64}
            height={64}
            alt="thestreakapp_icon"
            className="hover:animate-spin"
          />
          <h1 className="text-2xl font-semibold tracking-tight">We sent you a login link.</h1>

          <p className="text-sm text-muted-foreground">If you don&apos;t see it, check your spam folder.</p>
          <Icons.mail className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
}
