# When to Use `deserializeError`

## Overview

`deserializeError` converts a plain JSON error response object (from your API) into a typed `ApiError` class instance. This gives you:
- Type safety (TypeScript knows the error type)
- Instance methods and properties
- Proper error class hierarchy for `instanceof` checks

---

## ✅ Use Case 1: Inside `ClientFetch` (Already Done)

**Current implementation:** `ClientFetch` automatically uses `deserializeError` when it receives an error response from the API.

```typescript
// In ClientFetch._fetch()
if (!res.ok && isJsonError) {
  const tJson = await tryHandle<unknown>(res.json());
  if (tJson.success) {
    const apiError = deserializeError(tJson.data, method);
    throw apiError; // Now it's a proper ApiError instance
  }
}
```

**You don't need to call it manually** when using `ClientFetch` - it's already handled!

---

## ✅ Use Case 2: Direct Fetch Calls (Without ClientFetch)

If you're making direct `fetch()` calls (not using `ClientFetch`), you'll need to manually deserialize errors:

```typescript
import { deserializeError, NotFoundError, ValidationError } from "./utils/ApiError";

async function fetchUserDirectly(id: string) {
  try {
    const response = await fetch(`/api/users/${id}`);
    
    if (!response.ok) {
      const errorJson = await response.json();
      // Convert JSON error to ApiError instance
      const apiError = deserializeError(errorJson, "GET");
      throw apiError;
    }
    
    return await response.json();
  } catch (error) {
    // Now you can use instanceof checks
    if (error instanceof NotFoundError) {
      console.log("User not found:", error.message);
    } else if (error instanceof ValidationError) {
      console.log("Validation errors:", error.errors);
    }
    throw error;
  }
}
```

---

## ✅ Use Case 3: Error Response from Third-Party APIs

If you're calling external APIs that return errors in your `ErrorResponse` format:

```typescript
import { deserializeError } from "./utils/ApiError";

async function callExternalService() {
  try {
    const response = await fetch("https://external-api.com/endpoint");
    
    if (!response.ok) {
      const errorJson = await response.json();
      
      // If the external API uses your error format, deserialize it
      const apiError = deserializeError(errorJson, "GET");
      throw apiError;
    }
    
    return await response.json();
  } catch (error) {
    // Handle as ApiError
  }
}
```

---

## ✅ Use Case 4: Server-Side Error Handling (SSR/API Routes)

In React Router or Next.js API routes, when you receive error responses:

```typescript
// In a React Router loader/action
import { deserializeError } from "../utils/ApiError";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const response = await fetch(`${API_URL}/users`, {
      headers: request.headers,
    });
    
    if (!response.ok) {
      const errorJson = await response.json();
      const apiError = deserializeError(errorJson, "GET");
      
      // Now you can handle it properly
      if (apiError instanceof NotFoundError) {
        throw new Response("Not Found", { status: 404 });
      }
      throw apiError;
    }
    
    return json(await response.json());
  } catch (error) {
    // Error is already an ApiError instance
    throw error;
  }
}
```

---

## ✅ Use Case 5: Error Logging/Monitoring

When logging errors to external services, you might receive error data that needs deserialization:

```typescript
import { deserializeError, ApiError } from "./utils/ApiError";

// Error data from a log or monitoring service
const errorDataFromLogs = {
  error_type: "validation",
  status: 400,
  message: "Validation failed",
  errors: { email: ["Invalid email"] }
};

// Deserialize to get a proper ApiError instance
const apiError = deserializeError(errorDataFromLogs);

// Now you can use it properly
console.log(apiError.error_type); // "validation"
console.log(apiError.errors); // { email: ["Invalid email"] }
```

---

## ✅ Use Case 6: Error Recovery/Retry Logic

When implementing retry logic with error handling:

```typescript
import { deserializeError, ServerError, UnauthenticatedError } from "./utils/ApiError";

async function fetchWithRetry(url: string, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorJson = await response.json();
        const apiError = deserializeError(errorJson, "GET");
        
        // Don't retry on client errors (4xx)
        if (apiError.status >= 400 && apiError.status < 500) {
          throw apiError;
        }
        
        // Retry on server errors (5xx) or network issues
        if (apiError instanceof ServerError && i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
          continue;
        }
        
        throw apiError;
      }
      
      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
    }
  }
}
```

---

## ✅ Use Case 7: Error Transformation/Formatting

When you need to transform error responses for different contexts:

```typescript
import { deserializeError, ValidationError } from "./utils/ApiError";

function formatErrorForUI(errorJson: unknown) {
  const apiError = deserializeError(errorJson);
  
  if (apiError instanceof ValidationError) {
    // Format validation errors for form display
    return {
      type: "validation",
      fields: Object.entries(apiError.errors || {}).map(([field, messages]) => ({
        field,
        messages
      }))
    };
  }
  
  return {
    type: apiError.error_type,
    message: apiError.message,
    status: apiError.status
  };
}
```

---

## ❌ When You DON'T Need It

### 1. Errors Already Thrown by ClientFetch

If you're using `ClientFetch`, errors are already deserialized:

```typescript
// ✅ Good - ClientFetch handles deserialization
try {
  await client.get({ path: "/users/123", request });
} catch (error) {
  // error is already an ApiError instance
  if (error instanceof NotFoundError) {
    // Handle it
  }
}

// ❌ Don't do this - error is already deserialized
try {
  await client.get({ path: "/users/123", request });
} catch (error) {
  const apiError = deserializeError(error); // Unnecessary!
}
```

### 2. Errors Thrown Directly in Code

If you're throwing `ApiError` instances directly, they're already the right type:

```typescript
// ✅ Good - Already an ApiError
throw new NotFoundError("User not found");

// ❌ Don't do this
const error = { error_type: "not_found", status: 404, message: "Not found" };
throw deserializeError(error); // Just throw new NotFoundError() instead!
```

### 3. Server-Side Error Serialization

On the server, use `serializeError`, not `deserializeError`:

```typescript
// ✅ Server-side - serialize errors
app.onError((err, c) => {
  const errorResponse = serializeError(err); // Convert Error → ErrorResponse
  return c.json(errorResponse, errorResponse.status);
});

// ❌ Don't use deserializeError on the server
app.onError((err, c) => {
  const apiError = deserializeError(err); // Wrong direction!
});
```

---

## Summary

**Use `deserializeError` when:**
- ✅ Making direct `fetch()` calls (not using `ClientFetch`)
- ✅ Handling error responses from external APIs
- ✅ Working with error data from logs/monitoring
- ✅ Implementing custom error handling logic
- ✅ Transforming error responses for different contexts

**Don't use `deserializeError` when:**
- ❌ Using `ClientFetch` (it's already handled)
- ❌ Throwing errors directly in code (just use the error classes)
- ❌ On the server side (use `serializeError` instead)

---

## Quick Reference

```typescript
// Server-side: Error → ErrorResponse (JSON)
const errorResponse = serializeError(error);

// Client-side: ErrorResponse (JSON) → ApiError (instance)
const apiError = deserializeError(errorJson, method);
```
