# Home Screen (Tree Selection)

## Purpose

The outside-picker context at URL `/`. The user views their existing trees, opens a recent one, creates a new tree, or imports a GEDCOM file. No tree DB is open here.

## Domain note

A **duplicate tree name on create is allowed**. The tree's name is just a display label; its database file is named with a UUID, so two trees may safely share a name.

## Implementation

`src/pages/Home.tsx`, with the tree-card and tree-modal components in [`src/components/trees/`](../../../src/components/trees/).
