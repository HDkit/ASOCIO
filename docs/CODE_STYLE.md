# Class / Type / Interface Usage Guidelines

This guide outlines the rules for using `class`, `type`, and `interface` consistently across the codebase.

## class

- Used for: DTOs and Entities only
- Validation: `class-validator`
- Purpose:
  - Concrete implementations
  - For complicated objects with methods or transformation logic
  - Suitable for use cases like request validation or persistence

## type

- Validation: `zod`
- Used for: Internal data structures defined within the application domain
- Features:
  - Supports intersection via `type A = B & C`
  - Lightweight and composable

## interface

- Validation: `zod`
- Used for: External data structures such as incoming requests or third-party responses
- Features:
  - Acts as a blueprint for external contracts
  - Supports extension via `interface A extends B`
  - Can be declared multiple times and will be merged

# Decorators Usage Guide

This guide defines the required decorator order and structure conventions for the codebase. It ensures consistency, readability, and maintainability across controllers and DTOs.

---

## Controller Decorator Order

For method-level decorators in a controller, use the following order **top-to-bottom**:

1. `@Version()`
2. HTTP Method Decorator (`@Get()`, `@Post()`, etc.)
3. `@UseGuards(...)`
4. Interceptors (e.g. `@UseInterceptors(LoggerInterceptor)`)
5. Pipes (`@UsePipes(...)`)
6. Filters (`@UseFilters(...)`)
7. Other decorators (in **alphabetical order**)

### Example

```ts
@Version('1')
@Post()
@UseGuards(AuthGuard)
@UseInterceptors(LoggerInterceptor)
@UsePipes(ValidationPipe)
@UseFilters(HttpExceptionFilter)
@CustomDecorator()
@ZDecorator()
```

---

## DTO Decorator Order

For property decorators using `class-transformer` and `class-validator`:

1. All `class-transformer` decorators (in **alphabetical order**)
2. All `class-validator` decorators (in **alphabetical order**)

### Example

```ts
export class CreateUserDto {
	@Expose()
	@Transform(({ value }) => value.trim())
	@IsEmail()
	@IsNotEmpty()
	@MaxLength(255)
	email: string;

	@Exclude()
	@Transform(({ value }) => value?.toString())
	@IsNotEmpty()
	@IsString()
	@MinLength(8)
	password: string;
}
```
