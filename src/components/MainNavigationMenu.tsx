"use client";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
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
            onClick={() =>
              router.navigate({ to: "/individuals", search: { page: 1 } })
            }
            className={cn(navigationMenuTriggerStyle(), {
              "bg-accent text-accent-foreground": isActive("/individuals"),
            })}
          >
            Individuals
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            onClick={() =>
              router.navigate({ to: "/families", search: { page: 1 } })
            }
            className={cn(navigationMenuTriggerStyle(), {
              "bg-accent text-accent-foreground": isActive("/families"),
            })}
          >
            Families
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
