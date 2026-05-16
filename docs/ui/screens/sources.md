# Sources & Media Screen

## Why this screen exists

Source-centric data entry is the core UX innovation of Vata. Instead of creating entities first and attaching sources afterward, the user works **from the source outward**: open a source document (with its scanned image), then create and link individuals, events, places, and families from one workspace. This matches how a genealogist actually works — a record in hand, transcribing what it says — and makes citing the source the default path rather than an afterthought.

The module has two views: a **source list** for browsing, and a **source workspace** (side-by-side image viewer + linking panel) for data entry.

Implementation: `src/pages/SourcesPage.tsx`, `src/pages/SourceViewPage.tsx`, `src/pages/SourceWorkspacePage.tsx`, `src/pages/RepositoriesPage.tsx`, `src/pages/RepositoryViewPage.tsx`.

## Templates by event type

The workspace's linking panel offers an event-type dropdown. Selecting a type loads a **template** of named slots — a genuine genealogical mapping of which roles a given record type documents:

| Event Type      | Slots                                                                                                              |
| --------------- | ------------------------------------------------------------------------------------------------------------------ |
| Marriage (MARR) | Husband, Wife, Father of husband, Mother of husband, Father of wife, Mother of wife, + Witnesses, Officiant, Place |
| Baptism (CHR)   | Child, Father, Mother, Godfather, Godmother, Officiant, Place                                                      |
| Birth (BIRT)    | Child, Father, Mother, Place                                                                                       |
| Death (DEAT)    | Deceased, Informant, Place                                                                                         |
| Burial (BURI)   | Deceased, Informant, Place                                                                                         |
| Census (CENS)   | Head of household, + Household members, Place                                                                      |
| Other/None      | No template — free-form only                                                                                       |

## Slot behavior

- Each slot lets the user **search** for an existing entity, **create one inline**, or **clear** the link.
- Slots prefixed with `+` are repeatable (e.g. `+ Witnesses` accepts multiple).
- **Place slots** search the places table; all other slots search individuals.
- **Gender is inferred from the slot** when creating a person inline — `Husband` → male, `Wife` → female, `Witness` → unknown — pre-filled but editable.
- A `+ Add person` action below the template links arbitrary entities the template doesn't cover (a neighbor in a census, a curé who is also a relative), with a role selector.

## Auto-citation

Linking an entity in the workspace creates citations automatically — the user never creates a citation by hand:

1. One `source_citation` is created per source, **reused for all links made in the same workspace session**.
2. A `citation_link` connects that citation to each linked entity.

## Event suggestion

Once an event type is selected and the principal slots are filled, the workspace suggests creating the matching event (with optional date/place). Accepting it creates the event, links it to the source via the citation, and adds the principal individuals as event participants. It is a suggestion only — the event may already exist in the tree.

## Quality Badge

Citations carry a quality rating, displayed wherever citations appear. Enum values: **Primary**, **Secondary**, **Questionable**, **Unreliable**, **Unrated** (null).
