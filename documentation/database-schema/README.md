# Database Schema Documentation

This directory contains documentation for the database schema used in the Vata App. The schema is designed to store genealogical data including individuals, families, events, places, and their relationships using a unified event system with support for multiple family trees.

## Core Entities

- [Trees](./trees.md) - Manages multiple family trees and organizes all genealogical data
- [Families](./families.md) - Represents family units and their relationships
- [Family Children](./family-children.md) - Links children to their families
- [Individuals](./individuals.md) - Represents individual persons
- [Names](./names.md) - Records different names associated with individuals
- [Places](./places.md) - Represents locations and their hierarchical relationships
- [Place Types](./place-types.md) - Types of places that can be recorded

## Unified Event System

The database uses a unified event system that handles both individual and family events through a flexible participant-based model:

- [Events](./events.md) - Main events table for all types of events
- [Event Types](./event-types.md) - Types of events that can be recorded
- [Event Subjects](./event-subjects.md) - Links events to primary individuals they are about
- [Event Participants](./event-participants.md) - Links events to all involved individuals with roles
- [Event Roles](./event-roles.md) - Defines roles individuals can have in events

## Database Views

- [Views](./views.md) - Database views for convenient data access

## Database Functions

- [Functions](./functions.md) - Database functions for complex operations

## Enums

- `gender` - Values: `male`, `female`
- `name_type` - Values: `birth`, `marriage`, `nickname`, `unknown`
- `family_type` - Values: `married`, `civil union`, `unknown`, `unmarried`
