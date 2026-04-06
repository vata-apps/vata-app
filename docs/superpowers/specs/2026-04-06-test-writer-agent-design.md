# Test Writer Agent Design

## Context

The project follows a TDD-first approach: tests are written before implementation code. Currently, test writing happens ad hoc during development, with no dedicated agent to enforce TDD discipline.

The user's testing philosophy:

- Test the **usage** of a function, not its implementation
- Tests must **prevent regressions**, not break on every refactor
- No coverage metrics — 20 useful tests > 100 superficial ones
- Mock only at boundaries, never internals

The existing `testing-standards` skill already codifies these principles. The existing tests are well-written and behavioral. This agent operationalizes the TDD workflow by writing tests before implementation.

## Scope

Create a Claude Code agent at `.claude/agents/test-writer.md` that writes behavioral tests for a described feature before the implementation code exists.

## Agent: `test-writer`

### Identity

- **File:** `.claude/agents/test-writer.md`
- **Model:** `sonnet`
- **Dispatch:** Via `Agent` tool with `subagent_type` in CLAUDE.md agents table

### Input

The agent receives in its prompt:

- **Feature description** — what the function/component/hook must do
- **Target file** — where the implementation will live (e.g., `src/db/trees/places.ts`)
- **Signature** (optional) — function name and parameters if already decided

### Workflow

1. **Read context**
   - Read the `testing-standards` skill (`.claude/skills/testing-standards/SKILL.md`)
   - Read existing tests for the target file (if any) to match patterns
   - Read types and interfaces relevant to the feature

2. **Identify the test layer**
   - `src/db/**` → Integration test with in-memory SQLite (real schema, no mocks)
   - `src/managers/**` → Integration test with in-memory SQLite
   - `src/hooks/**` → Unit test, mock only the DB layer function
   - `src/components/**` → RTL behavioral test with `renderWithProviders`
   - `src/lib/**` → Pure unit test, no mocks

3. **Write the tests**
   - Co-locate: `{module}.test.ts` next to `{module}.ts`
   - Follow the naming conventions from testing-standards (describe = feature, it = plain English fact, no "should")
   - Every test must pass the litmus test: "If I rewrite the implementation but keep the behavior, does this test still pass?"
   - Do NOT write tests for: trivial wrappers, auto-generated files, internal SQL structure

4. **Run the tests**
   - Execute `pnpm vitest run <test-file>`
   - Confirm tests **fail** (red) — this proves TDD is working correctly
   - If tests pass unexpectedly, investigate (the implementation may already exist or tests are trivially true)

5. **Report back**
   - List the test scenarios written
   - Confirm red status
   - Do NOT commit — the caller commits tests + implementation together once green

### What the Agent Must NOT Do

- Commit files
- Write implementation code
- Add coverage configuration or thresholds
- Mock internal implementation details (only mock at layer boundaries)
- Write snapshot tests
- Write tests that assert on SQL string content, mock call counts, or internal function arguments

### Test Quality Rules (embedded in agent instructions)

| Rule                                          | Rationale                                                                           |
| --------------------------------------------- | ----------------------------------------------------------------------------------- |
| Test behavior, not implementation             | A refactor that preserves behavior must not break tests                             |
| Mock only at boundaries                       | DB layer uses real in-memory SQLite; hooks mock DB functions; components mock hooks |
| No `toHaveBeenCalledWith` on internal details | Tests call counts and argument shapes are implementation coupling                   |
| No snapshot tests                             | They break on any change, useful tests don't                                        |
| Skip trivial wrappers                         | If there's no logic, there's nothing to test                                        |
| Assert on returned data or observable state   | Not on how the function achieved the result                                         |

## Files to Create/Modify

| File                                        | Action | Purpose                                                                     |
| ------------------------------------------- | ------ | --------------------------------------------------------------------------- |
| `.claude/agents/test-writer.md`             | Create | The agent definition                                                        |
| `CLAUDE.md`                                 | Modify | Add `test-writer` to the Available Agents table                             |
| `.claude/skills/testing-standards/SKILL.md` | Modify | Add TDD section + replace coverage goals with regression-focused philosophy |

## Integration with TDD Workflow

```
1. Developer describes the feature
2. test-writer agent writes tests (red)
3. Developer (or Claude) implements the code
4. Tests pass (green)
5. Refactor if needed
6. Commit tests + implementation together
```

The agent handles step 2 only. Steps 3-6 remain with the developer or the main Claude conversation.

## Verification

1. Dispatch the agent with a simple feature description (e.g., "add `deleteIndividual(id)` to `src/db/trees/individuals.ts` that deletes an individual and cascades to names")
2. Verify the agent writes tests in the correct file, following existing patterns
3. Verify the tests fail (red) when run
4. Implement the feature and verify the tests pass (green)
