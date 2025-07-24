import { useTree } from "@/hooks/use-tree";
import { Select } from "@mantine/core";

export const TreeSelector = () => {
  const { currentTreeId, trees, isLoading, setCurrentTree } = useTree();

  const data = trees.map((tree) => ({
    value: tree.id,
    label: tree.name,
  }));

  return (
    <Select
      data={data}
      value={currentTreeId}
      onChange={(value) => value && setCurrentTree(value)}
      placeholder="Select tree..."
      disabled={isLoading || trees.length === 0}
      size="sm"
      w={200}
      comboboxProps={{
        withinPortal: false,
      }}
      allowDeselect={false}
    />
  );
};
