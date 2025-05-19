"use client";

import {
  ActionIcon,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import clsx from "clsx";
import { Moon, Sun } from "lucide-react";

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
      ml="auto"
      variant="default"
      size="lg"
      radius="md"
      aria-label="Toggle color scheme"
    >
      <Sun className={clsx(classes.icon, classes.light)} />
      <Moon className={clsx(classes.icon, classes.dark)} />
    </ActionIcon>
  );
}
