## 1. Data Layer — Relationships Hook

- [ ] 1.1 Create `useIndividualRelationships(individualId)` hook in `src/hooks/` that composes existing DB functions (`getParentFamilies`, `getSpouseFamilies`, `getChildrenInFamily`) to return `{ father, mother, siblings, halfSiblings, spouseFamilies }` as a TanStack Query hook
- [ ] 1.2 Add tests for `useIndividualRelationships` covering: both parents, siblings, half-siblings, no parent family

## 2. Layout — Three-Panel Structure

- [ ] 2.1 Create `IndividualsMasterDetail` layout component with CSS Grid three-column layout (`280px 1fr 320px`) and independent scroll regions per panel
- [ ] 2.2 Update the `/tree/$treeId/individuals` route to use the new master-detail layout with `id` search param for selected individual
- [ ] 2.3 Add redirect from old `/tree/$treeId/individual/$individualId` route to `/tree/$treeId/individuals?id=$individualId`
- [ ] 2.4 Add integration test: selecting an individual via `?id=` restores the selection after navigation / back / refresh
- [ ] 2.5 Add integration test: the old `/tree/$treeId/individual/$individualId` route redirects to `/tree/$treeId/individuals?id=$individualId` while preserving browser history
- [ ] 2.6 Add integration test: an invalid `?id=` value renders the "not found" empty state without selecting any individual

## 3. Left Panel — Individual List

- [ ] 3.1 Create `IndividualListPanel` component: scrollable list of individuals with name, ID, gender, birth/death years, and living status per row
- [ ] 3.2 Add search input filtering individuals by name
- [ ] 3.3 Highlight the currently selected individual in the list
- [ ] 3.4 On click, update the URL search param to navigate to the selected individual

## 4. Center Panel — Individual Summary

- [ ] 4.1 Create `IndividualSummaryPanel` component with individual name heading and "Edit" button placeholder
- [ ] 4.2 Build the key-value table rows: ID, Gender, Alternative names, Birth date, Birth place, Death date, Death place
- [ ] 4.3 Add Father, Mother, Siblings, Half-siblings rows using data from `useIndividualRelationships`, with clickable links to navigate to related individuals
- [ ] 4.4 Display places as styled accent-colored links

## 5. Right Panel — Sidebar

- [ ] 5.1 Create `IndividualSidebar` component with collapsible sections: Parents, Families, Events
- [ ] 5.2 Build Parents section: parent cards (name, ID, dates, gender, status) + sibling cards + "Add Brother"/"Add Sister" placeholder buttons
- [ ] 5.3 Build Families section: spouse families with spouse and children as clickable links
- [ ] 5.4 Build Events section: reuse `EventTimeline` component + "Add" placeholder button
- [ ] 5.5 Handle empty states for each sidebar section

## 6. Cleanup & Polish

- [ ] 6.1 Remove or deprecate the old `IndividualViewPage` component
- [ ] 6.2 Ensure all clickable individual/place links navigate correctly within the master-detail layout
- [ ] 6.3 Verify empty state when no individual is selected (center + right panels)
