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

export function NavigationSheetMenu() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">
          <MenuIcon />
        </Button>
      </SheetTrigger>
      <SheetContent side={"top"} className="flex flex-col items-center justify-center gap-2">
        <NavigationMenuItems />
      </SheetContent>
    </Sheet>
  );
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
] as const;

export const NavigationMenuItems = () => {
  return (
    <NavigationMenu>
      <NavigationMenuList className="flex items-center justify-center gap-2">
        {MENU_ITEMS.map(({ name, href }) => (
          <NavigationMenuItem key={name}>
            <NavigationMenuLink href={href}>{name}</NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
};
