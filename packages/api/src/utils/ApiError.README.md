# API Error Handling

This module provides a standardized error handling system for the API, with type-safe error classes and automatic serialization/deserialization.

## Usage in Endpoints

Simply throw the appropriate error class:

```typescript
import { NotFoundError, ValidationError, UnauthorizedError } from "../utils/ApiError";

// In your route handler
export const myRoute = new Hono().get("/:id", async (c) => {
  const id = c.req.param("id");
  
  const resource = await db.find(id);
  if (!resource) {
    throw new NotFoundError("Resource not found");
  }
  
  if (!hasPermission(resource)) {
    throw new UnauthorizedError("You don't have permission to access this");
  }
  
  return c.json(resource);
});
```

## Available Error Classes

- `ValidationError(errors, message?)` - 400, for validation failures
- `BadRequestError(message?)` - 400, for general bad requests
- `UnauthenticatedError(message?)` - 401, user needs to sign in
- `UnauthorizedError(message?)` - 403, user lacks permission
- `NotFoundError(message?)` - 404, resource not found
- `MethodNotAllowedError(method)` - 405, HTTP method not allowed
- `ServerError(reason)` - 500, internal server error
- `UnknownError(message?)` - 500, unknown error

## Validation Errors

For Zod validation errors, you can create a ValidationError manually:

```typescript
import { ValidationError } from "../utils/ApiError";
import { z } from "zod";

const schema = z.object({ name: z.string().min(1) });

try {
  schema.parse({ name: "" });
} catch (error) {
  if (error instanceof z.ZodError) {
    const fieldErrors: Record<string, string[]> = {};
    error.issues.forEach((issue) => {
      const path = issue.path.join(".");
      if (!fieldErrors[path]) {
        fieldErrors[path] = [];
      }
      fieldErrors[path].push(issue.message);
    });
    throw new ValidationError(fieldErrors);
  }
}
```

Or use `serializeError()` which automatically handles ZodErrors:

```typescript
import { serializeError } from "../utils/ApiError";

// In your error handler (already set up in server.ts)
app.onError((err, c) => {
  const errorResponse = serializeError(err);
  return c.json(errorResponse, errorResponse.status);
});
```

## Client-Side Usage

Errors are automatically deserialized in `ClientFetch`:

```typescript
import { ApiError, NotFoundError, ValidationError } from "../utils/ClientFetch";

try {
  await client.get({ path: "/resource/123", request });
} catch (error) {
  if (error instanceof NotFoundError) {
    console.log("Resource not found:", error.message);
  } else if (error instanceof ValidationError) {
    console.log("Validation errors:", error.errors);
  } else if (error instanceof ApiError) {
    console.log(`API Error [${error.status}]:`, error.message);
  }
}
```

## Error Response Format

All errors follow this structure:

```typescript
{
  error_type: "validation" | "not_found" | "unauthorized" | ...,
  status: number,
  message: string,
  errors?: Record<string, string[]> // Only for validation errors
}
```
