# Coding Standards

This document outlines the coding standards and project-specific guidelines for the Vata App.

## Code Style

### Immutability

- Always write immutable code
- Use `const` instead of `let` for variable declarations
- Avoid mutating state directly

### Conditional Statements

- Avoid ternary operators for better code readability
- Use Immediately Invoked Function Expressions (IIFE) instead of ternary operators or mutable variables

Example:

```typescript
// ❌ Don't use ternary
const message = isValid ? "Valid" : "Invalid";

// ✅ Use IIFE
const message = (() => {
  if (isValid) {
    return "Valid";
  }
  return "Invalid";
})();
```

## TypeScript

- Use TypeScript for all new code
- Ensure proper type definitions for all variables, functions, and components
- Avoid using `any` type unless absolutely necessary

## React Components

- Use functional components with TypeScript
- Follow React 19 best practices
- Utilize TanStack Query for data fetching
- Implement proper error boundaries

## Styling

- Use Mantine UI components for all styling needs
- Follow Mantine's built-in props and theme system for customization
- Use CSS modules for custom styling when needed
- Maintain consistent spacing and layout using Mantine's spacing system

## Data Management

- Use TanStack Query for server state management
- Follow Supabase best practices for database operations
- Implement proper error handling for database operations

## Project Structure

- Keep components modular and reusable
- Organize code by feature/module
- Maintain clear separation of concerns

## Documentation

- Document complex logic and business rules
- Add JSDoc comments for functions and components
- Keep documentation up to date with code changes

This document will be updated as new standards and best practices are established.
