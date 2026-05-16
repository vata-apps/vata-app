# Tree View Screen (Tree Overview)

## Purpose

The dashboard shown when a tree is first opened (the Home icon in the in-tree top nav). It summarizes the tree — counts, recent activity, quick creation actions — and is the landing point of the in-tree shell. It is a full-width page, not the three-panel module layout.

## Domain note

The overview surfaces **individuals without parents** as potential tree roots: a person with no assigned parents is, genealogically, an entry point into the tree (the oldest known ancestor on a line). Listing them helps the researcher see where the tree currently bottoms out.

## Implementation

`src/pages/TreeView.tsx`.
