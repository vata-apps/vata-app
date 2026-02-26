export type Gender = 'M' | 'F' | 'U';

export interface Tree {
  id: string;
  name: string;
  filename: string;
  description: string | null;
  individualCount: number;
  familyCount: number;
  lastOpenedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
