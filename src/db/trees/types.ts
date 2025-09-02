export const selectTree =
  "id, name, is_default, description, created_at" as const;

export interface Tree {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  createdAt: string;
}
