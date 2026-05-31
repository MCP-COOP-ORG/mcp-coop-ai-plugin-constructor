---
name: Security
description: Standard rules and conventions for security.
trigger: always_on
---

## Auth Guards

- Protect all authenticated routes using Route Guards (`canActivate`, `canMatch`).
- Route guards should verify token existence and validity synchronously if possible, or asynchronously via an auth service.
- Redirect unauthenticated users immediately to the login page, preserving the intended destination URL for post-login redirection.
- Handle role-based access control (RBAC) at the route level to prevent unauthorized navigation to admin or restricted areas.
- **NEVER** rely solely on client-side route guards for security — the backend API must also enforce authorization on every request.

## XSS Protection

- Utilize the framework's native DOM sanitization (e.g., Angular's `DomSanitizer`) — **NEVER** bypass security trusts (`bypassSecurityTrustHtml`) without strict justification and manual sanitization.
- **NEVER** render raw HTML from untrusted user input directly into the DOM.
- Use `textContent` or framework interpolation (which auto-escapes) instead of `innerHTML` when displaying user data.
- Enforce a strict Content Security Policy (CSP) via HTTP headers or meta tags to restrict the sources of executable scripts.
- Validate and sanitize all external URLs before using them in `href` or `src` attributes to prevent `javascript:` URI attacks.
