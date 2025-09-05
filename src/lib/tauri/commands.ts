import { invoke } from '@tauri-apps/api/core';

export interface TreeInfo {
  name: string;
  path: string;
  created_at: string;
}

export const tauriCommands = {
  // Tree management
  async createTree(name: string): Promise<TreeInfo> {
    return await invoke('create_tree', { name });
  },

  async listTrees(): Promise<TreeInfo[]> {
    return await invoke('list_trees');
  },

  async deleteTree(name: string): Promise<void> {
    return await invoke('delete_tree', { name });
  },

  // Test command
  async greet(name: string): Promise<string> {
    return await invoke('greet', { name });
  },
};