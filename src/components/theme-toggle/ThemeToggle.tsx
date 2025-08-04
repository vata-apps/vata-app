"use client";

import {
  ActionIcon,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";
import clsx from "clsx";

import classes from "./ThemeToggle.module.css";

export function ThemeToggle() {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("light", {
    getInitialValueInEffect: true,
  });

  return (
    <ActionIcon
      onClick={() =>
        setColorScheme(computedColorScheme === "light" ? "dark" : "light")
      }
      variant="default"
      size="lg"
      radius="md"
      aria-label="Toggle color scheme"
    >
      <IconSun className={clsx(classes.icon, classes.light)} />
      <IconMoon className={clsx(classes.icon, classes.dark)} />
    </ActionIcon>
  );
}
