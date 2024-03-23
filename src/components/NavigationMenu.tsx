"use client";

import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MenuIcon } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { useEffect } from "react";

import { Separator } from "./ui/separator";

const PUBLIC_ROUTES = ["/", "/login", "/login/verify-request"];

const MENU_ITEMS = [
  {
    name: "Streaks",
    href: "/streak",
  },
  {
    name: "Settings",
    href: "/settings",
  },
] as const;

export function NavigationSheetMenu() {
  const session = useSession();
  const user = session.data?.user;

  const router = useRouter();
  const posthog = usePostHog();
  const pathname = usePathname();

  const searchParams = useSearchParams();

  const signedInState = searchParams.get("signedInState");

  useEffect(() => {
    if (signedInState === "signedIn" && user?.email) {
      posthog.identify(user.email);
      router.replace("/streak");
    }
  }, [user?.email, signedInState, router, posthog]);

  useEffect(() => {
    if (signedInState === "signedOut") {
      posthog.reset();
      router.replace("/");
    }
  }, [posthog, router, signedInState]);

  return (
    session.status !== "unauthenticated" &&
    !PUBLIC_ROUTES.includes(pathname) && (
      <Sheet>
        <SheetTrigger className="absolute right-2 top-2 p-2">
          <MenuIcon />
        </SheetTrigger>
        <SheetContent className="flex w-64 flex-col items-center justify-center py-[4rem]" side={"right"}>
          <NavigationMenu className="flex h-full flex-col justify-between">
            <NavigationMenuList className="flex flex-col gap-8">
              {MENU_ITEMS.filter((e) => e.href !== pathname).map(({ name, href }) => (
                <NavigationMenuItem key={name}>
                  <NavigationMenuLink href={href}>{name}</NavigationMenuLink>
                  <Separator />
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
          <Button
            variant="outline"
            onClick={() => {
              signOut({ callbackUrl: "/?signedInState=signedOut" });
            }}
          >
            Sign Out
          </Button>
        </SheetContent>
      </Sheet>
    )
  );
}
