"use client";

import {
  ActionIcon,
  Group,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import { cx } from "class-variance-authority";
import { Moon, Sun } from "lucide-react";

import classes from "./ThemeToggle.module.css";

export function ThemeToggle() {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("light", {
    getInitialValueInEffect: true,
  });

  return (
    <Group ml="auto" justify="center">
      <ActionIcon
        onClick={() =>
          setColorScheme(computedColorScheme === "light" ? "dark" : "light")
        }
        variant="default"
        size="lg"
        radius="md"
        aria-label="Toggle color scheme"
      >
        <Sun className={cx(classes.icon, classes.light)} />
        <Moon className={cx(classes.icon, classes.dark)} />
      </ActionIcon>
    </Group>
  );
}
