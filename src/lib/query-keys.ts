export const queryKeys = {
  trees: ['trees'] as const,
  tree: (id: string) => ['trees', id] as const,
  treeDebugData: (treeId: string) => ['trees', treeId, 'debug'] as const,
};
