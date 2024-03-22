import { Icons } from "@/components/Icons";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

export const metadata = {
  title: "Chat with an AI your about goals",
  description: "The science of goal setting with an AI chatbot. Set and achieve goals with the help of a professional.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col justify-between">
      <nav className="flex justify-start pl-2 pt-2">
        <Link href="/streak" className={buttonVariants({ variant: "ghost" })}>
          <Icons.chevronLeft className="mr-2 h-4 w-4" />
          Back
        </Link>
      </nav>
      <div className="flex h-full  w-full flex-col items-center justify-center pb-[4rem]">{children}</div>
    </div>
  );
}
