<!--
IMPORTANT: This file contains core standards for reference.
Sections marked with [PRESERVE] must be kept in all future versions of this file.
You may add to these sections, but the core information should remain intact.
-->

# Project Overview [PRESERVE]

Vata is a modern genealogy application designed to help you manage and visualize family trees. The application follows the latest GEDCOM standard.

## Key Features

- Individuals: Core module for managing family members with detailed profiles
- Names: Support for different name variations (birth, marriage, nickname) associated with individuals
- Families: Module for creating and visualizing relationships between individuals
- Places: Geographic location management with hierarchical relationships (city, county, state, country)
- Events: System for recording life events connected to individuals and families
- Relationships: Interconnections between all modules to create a comprehensive family tree

## Tech stack

- Supabase for all the backend
- React/TypeScript frontend
- PostgreSQL database managed by the Supabase API
- pnpm as package manager

## Core Commands [PRESERVE]

- `pnpm dev` - Start development server
- `pnpm type-check` - TypeScript type checking
- `pnpm build` - Build app
- `pnpm lint` - Eslint
- `pnpm db:reset` - Reset database
- `pnpm db:types` - Fetch types from Supabase locale

## Approach to create visual element [PRESERVE]

- Default to Mantine components for all UI elements
- Use Mantine's built-in props and theme system for customization
- Avoid adding custom styles on top of Mantine components
- Reuse as much as possible existing component in folder /src/components/

## Approach to Problem Solving [PRESERVE]

- Always analyze the structure and context thoroughly before making code changes
- Understand the current behavior and specific issue before implementing a solution
- Explore related components to identify reusable patterns and architectural constraints
- Create a clear approach before writing any code
- For visual components, understand the layout hierarchy and scroll containers

## Approach to create a commit message [PRESERVE]

- Messages must be in English
- Single line format
- Always run git status to know the changes
- If you don't have enough information with git status, run git diff
- Keep it short (~100 characters)
- Use conventional commit prefixes:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation changes
  - `style:` for formatting changes
  - `refactor:` for code refactoring
  - `test:` for adding or modifying tests
  - `chore:` for maintenance tasks

### Examples

- `feat: add user authentication system`
- `fix: resolve login page crash on mobile`
- `docs: update API documentation`
- `style: format code according to ESLint rules`
- `refactor: simplify database queries`
- `test: add unit tests for user service`
- `chore: update dependencies`

## Interaction Preferences [PRESERVE]

- Provide explanations with context and "why" behind solutions
- Include relevant educational information when answering questions
- Break down complex concepts into manageable parts
- Point out patterns and best practices in the codebase

## Documentation Resources [PRESERVE]

- The project's documentation is available in the `/documentation` folder, which includes:
  - database schema
  - best practices

<!--
MAINTENANCE NOTE:
This file should be reviewed quarterly to ensure it remains accurate.
Last updated: 2025-05-27
-->
