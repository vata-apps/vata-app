"use client";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu-exports";
import { cn } from "@/lib/utils";
import { useLocation, useRouter } from "@tanstack/react-router";

export function MainNavigationMenu() {
  const location = useLocation();
  const router = useRouter();

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink
            onClick={() => router.navigate({ to: "/individuals" })}
            className={cn(navigationMenuTriggerStyle(), "cursor-pointer", {
              "bg-accent text-accent-foreground": isActive("/individuals"),
            })}
          >
            Individuals
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            onClick={() => router.navigate({ to: "/families" })}
            className={cn(navigationMenuTriggerStyle(), "cursor-pointer", {
              "bg-accent text-accent-foreground": isActive("/families"),
            })}
          >
            Families
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            onClick={() => router.navigate({ to: "/places" })}
            className={cn(navigationMenuTriggerStyle(), "cursor-pointer", {
              "bg-accent text-accent-foreground": isActive("/places"),
            })}
          >
            Places
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            onClick={() => router.navigate({ to: "/events" })}
            className={cn(navigationMenuTriggerStyle(), "cursor-pointer", {
              "bg-accent text-accent-foreground": isActive("/events"),
            })}
          >
            Events
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
