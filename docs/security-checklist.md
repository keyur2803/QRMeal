# Security Checklist (MVP)

- Enforce JWT validation on kitchen/admin routes.
- Validate request payloads for all mutating endpoints.
- Rate limit auth endpoints.
- Store secrets in environment variables only.
- Ensure CORS origin whitelist in production.
- Log sensitive events (login failures, status changes).
- Run dependency vulnerability scan before release.
