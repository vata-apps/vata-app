import { ActionIcon, TextInput } from "@mantine/core";
import { IconSearch, IconX } from "@tabler/icons-react";

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
      leftSection={<IconSearch size={18} />}
      rightSection={
        value && (
          <ActionIcon
            color="gray"
            onClick={() => onChange("")}
            radius="xl"
            size={32}
            variant="subtle"
          >
            <IconX size={18} />
          </ActionIcon>
        )
      }
      value={value}
      onChange={handleChange}
    />
  );
}
