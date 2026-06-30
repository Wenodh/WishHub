# ADR 002: Authentication

## Status

Accepted

## Context

Universal wishlist functionality requires consistent authentication across Web, Mobile, and Extension.

## Decision

We will use **Better Auth** as the authentication provider.

Authentication logic will be centralized in `packages/auth`. This package will handle:

- Configuration
- Session management
- Middleware
- Shared helpers

## Consequences

- Single source of truth for identity.
- Consistent user experience across platforms.
- Easier management of OAuth providers and session persistence.
