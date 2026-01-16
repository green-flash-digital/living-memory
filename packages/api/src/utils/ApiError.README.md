# API Error Handling

This module provides a standardized error handling system for the API, with type-safe error classes and automatic serialization/deserialization.

## Usage in Endpoints

Use the centralized `HTTPError` utility for creating errors:

```typescript
import { HTTPError } from "../utils/ApiError";

// In your route handler
export const myRoute = new Hono().get("/:id", async (c) => {
  const id = c.req.param("id");
  
  const resource = await db.find(id);
  if (!resource) {
    throw HTTPError.notFound("Resource not found");
  }
  
  if (!hasPermission(resource)) {
    throw HTTPError.unauthorized("You don't have permission to access this");
  }
  
  return c.json(resource);
});
```

**Alternative:** You can also use the error classes directly if you prefer:
```typescript
import { NotFoundError, UnauthorizedError } from "../utils/ApiError";
throw new NotFoundError("Resource not found");
```

## Available Error Methods (HTTPError)

The `HTTPError` utility provides a centralized API for creating errors:

- `HTTPError.validation(errors, message?)` - 400, for validation failures
- `HTTPError.badRequest(message?)` - 400, for general bad requests
- `HTTPError.unauthenticated(message?)` - 401, user needs to sign in
- `HTTPError.unauthorized(message?)` - 403, user lacks permission
- `HTTPError.notFound(message?)` - 404, resource not found
- `HTTPError.methodNotAllowed(method)` - 405, HTTP method not allowed
- `HTTPError.serverError(reason)` - 500, internal server error
- `HTTPError.unknown(message?, status?)` - 500, unknown error (status defaults to 500)

**Note:** You can also use the error classes directly (e.g., `new NotFoundError()`), but `HTTPError` provides a cleaner, more consistent API.

## Validation Errors

For Zod validation errors, you can create a ValidationError manually:

```typescript
import { HTTPError } from "../utils/ApiError";
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
    throw HTTPError.validation(fieldErrors);
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
