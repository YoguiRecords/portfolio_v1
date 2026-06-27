## Conventions
- RESTful design. Resources are nouns, HTTP methods are verbs.
- Lowercase, hyphens in URLs: /api/user-profiles not /api/userProfiles.
- Versioning via URL prefix: /api/v1/ only if breaking changes require it.
- JSON request and response bodies. Content-Type: application/json.

## HTTP Methods
- GET: read-only, idempotent, no body.
- POST: create resource, returns 201 Created + Location header.
- PUT: full update (replace), idempotent.
- PATCH: partial update.
- DELETE: remove resource, returns 204 No Content.

## Forbidden
- FORBIDDEN: business logic in URL paths (avoid /api/doSomething).
- FORBIDDEN: returning 200 with error information in the body.
- FORBIDDEN: exposing internal IDs or database structure in responses.
- FORBIDDEN: non-idempotent GET requests.

## Recommended Patterns
- Consistent error format: { "error": "code", "message": "...", "details": [] }.
- Pagination: cursor-based for large datasets. Page-based for small.
- Filtering via query parameters: /api/orders?status=pending&limit=20.
- HATEOAS links where navigation complexity warrants it.

## Security
- Authentication: JWT Bearer or API Key in Authorization header.
- HTTPS only in production.
- Rate limiting: return 429 Too Many Requests with Retry-After header.
- Input validation on every endpoint — return 422 Unprocessable Entity for validation errors.
- CORS: explicit allowed origins — never wildcard (*) in production.

## Common Pitfalls
- Inconsistent status codes: agree on conventions and document them.
- Chatty API: too many requests for one user action — batch where possible.
- Missing pagination: returning unbounded lists causes performance issues.
