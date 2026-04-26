# User Personas

## Marie — The Beginner

**Age**: 35  
**Experience**: New to genealogy  
**Technical comfort**: Moderate (uses everyday apps, not a developer)

### Context

Marie recently received a GEDCOM file from a cousin who has been researching their family history. She wants to explore the data, add what she knows about her immediate family, and keep everything organized on her laptop.

### Goals

- Import and browse the GEDCOM file she received
- Add her parents, grandparents, and siblings with basic facts (birth, marriage, death)
- Have a clear, simple interface that doesn't overwhelm her

### Frustrations

- Online platforms require subscriptions and store her data on someone else's servers
- Existing desktop software feels outdated and hard to learn
- She doesn't want to spend hours learning a complex tool

### Relationship to Vata

Marie needs tree management, GEDCOM import, and the ability to add people and events through a polished, intuitive UI from the very first session.

---

## Robert — The Enthusiast

**Age**: 62  
**Experience**: 15+ years of genealogical research  
**Technical comfort**: Comfortable (uses multiple genealogy tools, exports/imports regularly)

### Context

Robert has a tree with 2,000+ individuals spanning 10 generations. He regularly exports GEDCOM files to share with other researchers and imports files from archives and other software. Performance and data integrity are critical — he has lost data before when a tool crashed mid-import.

### Goals

- Manage a large tree without performance degradation
- Import and export GEDCOM reliably with no data loss
- Quickly find and edit individuals, families, and events
- Have confidence that his data is safe (transactions, no corruption)

### Frustrations

- Slow software that freezes on large trees
- GEDCOM import that silently drops data or creates duplicates
- Tools that require internet access to function

### Relationship to Vata

Robert is the primary stress-test persona. Tree management at scale, robust GEDCOM round-trip, efficient CRUD on large datasets, and the performance targets in the architecture are all designed with Robert in mind.

---

## Claire — The Researcher

**Age**: 45  
**Experience**: 10 years, methodical and source-driven  
**Technical comfort**: High (comfortable with databases and structured data)

### Context

Claire approaches genealogy as a research discipline. Every fact in her tree must be backed by a source — a birth certificate, a parish register, a census record. She documents not just what happened, but where she found the evidence.

### Goals

- Attach sources and citations to every event and individual
- Maintain a clean, well-documented tree that could be shared with other serious researchers
- Manage files (scanned documents, photos) linked to entities
- Export her work in GEDCOM without losing source information

### Frustrations

- Tools that treat sources as an afterthought
- No way to link files directly to events or individuals
- GEDCOM exports that strip source and citation data

### Relationship to Vata

Claire is the target persona for sources, citations, and file management. Her needs validate that the data model must support sources, repositories, and file attachments as first-class entities from the schema design onward.
