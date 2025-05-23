import { SearchIcon } from "lucide-react";

import { ActionIcon, TextInput } from "@mantine/core";
import { X } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
}: SearchInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <TextInput
      radius="xl"
      size="sm"
      w="100%"
      maw={{ base: "100%", xs: "320px" }}
      placeholder={placeholder}
      rightSectionWidth={42}
      leftSection={<SearchIcon size={18} />}
      rightSection={
        value && (
          <ActionIcon
            color="gray"
            onClick={() => onChange("")}
            radius="xl"
            size={32}
            variant="subtle"
          >
            <X size={18} />
          </ActionIcon>
        )
      }
      value={value}
      onChange={handleChange}
    />
  );
}
