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
import { useRouter, useSearchParams } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { PropsWithChildren, useEffect } from "react";

export function NavigationSheetMenu() {
  const session = useSession();
  const user = session.data?.user;

  const router = useRouter();
  const posthog = usePostHog();
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

  return user ? (
    // TODO: implement a proper navigation menu
    <nav className="fixed right-0 top-0 z-50 flex h-12 items-center justify-center md:max-w-[200px] md:justify-start">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">
            <MenuIcon />
          </Button>
        </SheetTrigger>
        <SheetContent side={"top"} className="flex flex-col items-center justify-center gap-2">
          <NavigationMenuItems>
            <Button
              variant="outline"
              onClick={() => {
                signOut({ callbackUrl: "/?signedInState=signedOut" });
              }}
            >
              Sign Out
            </Button>
          </NavigationMenuItems>
        </SheetContent>
      </Sheet>
    </nav>
  ) : null;
}

const MENU_ITEMS = [
  {
    name: "Home",
    href: "/",
  },
  {
    name: "Streaks",
    href: "/streak",
  },
  {
    name: "Settings",
    href: "/settings",
  },
] as const;

export const NavigationMenuItems: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <NavigationMenu>
      <NavigationMenuList className="flex items-center justify-center gap-2">
        {MENU_ITEMS.map(({ name, href }) => (
          <NavigationMenuItem key={name}>
            <NavigationMenuLink href={href}>{name}</NavigationMenuLink>
          </NavigationMenuItem>
        ))}
        {children}
      </NavigationMenuList>
    </NavigationMenu>
  );
};
