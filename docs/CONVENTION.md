# Entity & Schema Typing Guidelines

This document outlines conventions for defining entity and schema classes in a NestJS project.

## Typing Rules

1. **All properties must be explicitly typed.**

   - Minimal reliance on type inference.
   - Refrain from using `any`.

2. **Properties must not have `undefined` as a possible value**, unless:

   - The property is intentionally omitted in a subclass that handles DB-specific logic.
   - Otherwise, all fields must be defined and typed explicitly.

3. **Nullable values must be expressed with `null`, not `undefined`.**

   - Use `property: Type | null` if a value is intentionally nullable.

4. **Optional properties (e.g., DTOs) should use `?` but still be typed.**

   ```ts
   // For optional input fields
   name?: string;

   // For explicitly nullable values (e.g., DB fields)
   description: string | null;
   ```
