import { ActionIcon, TextInput } from "@mantine/core";
import { useDebouncedCallback } from "@mantine/hooks";
import { IconSearch, IconX } from "@tabler/icons-react";
import { useState } from "react";

interface SearchInputProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly placeholder?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);

  const debouncedOnChange = useDebouncedCallback(
    () => onChange(localValue),
    500,
  );

  const handleChange = (value: string) => {
    setLocalValue(value);
    debouncedOnChange();
  };

  return (
    <TextInput
      radius="xl"
      size="sm"
      w="100%"
      maw={{ base: "100%", xs: "320px" }}
      placeholder={placeholder}
      rightSectionWidth={42}
      leftSection={<IconSearch size={18} />}
      rightSection={
        localValue && (
          <ActionIcon
            color="gray"
            onClick={() => handleChange("")}
            radius="xl"
            size={24}
            variant="subtle"
          >
            <IconX size={16} />
          </ActionIcon>
        )
      }
      value={localValue}
      onChange={(e) => handleChange(e.target.value)}
    />
  );
}
