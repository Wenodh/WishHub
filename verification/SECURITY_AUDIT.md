# Security Audit Report

## 1. Authentication Configuration Audit

- **Authoritative Platform**: Better Auth has been successfully established as the single authoritative V1 authentication provider, backed entirely by Neon PostgreSQL.
- **Unified Architecture**: Duplicate authentication/database layers have been completely eliminated from the architecture.
- **Secret Constraints**: Better Auth strictly validates session signatures. In production mode, the library actively throws validation errors if `BETTER_AUTH_SECRET` is missing or uses default keys, blocking deployment initialization.
- **Session Validation**: All requests are checked in `withApiHandler` via `auth.api.getSession({ headers: req.headers })` which safely handles HTTP-only cookies securely.

---

## 2. Authorization & IDOR Mitigations

### Codebase Auditing Patterns
Every user-owned resource route (Wishlists, Products) implements a strict server-side authentication check.

For example, when updating a product in `/api/products/[id]`:
```typescript
const savedProduct = await prisma.savedProduct.findUnique({
  where: { id },
});

if (!savedProduct || savedProduct.userId !== session.user.id) {
  return ApiResponse.forbidden('You do not have access to this product');
}
```
1. **Derivation of Ownership**: Clients cannot spoof `userId` parameters because the user context is derived exclusively from the session cookie.
2. **Strict Matching**: Every mutation and access request verifies `savedProduct.userId === session.user.id` or matching wishlist ownership parameters. IDOR checks strictly return `403 Forbidden` / `404 Not Found` if a user attempts cross-mutations.

---

## 3. Server-Side Request Forgery (SSRF) Mitigations

The URL metadata extraction endpoint (`/api/products/extract`) incorporates multi-tier defense layers to prevent SSRF vulnerabilities:

1. **Protocol Restriction**: Enforced strictly via standard Zod constraints. Only `http://` and `https://` protocols are allowed. Private protocols, FTP, file schemes, and data URIs are rejected instantly.
2. **DNS Resolution & IP Blacklisting**:
   - The handler performs DNS lookup on the target hostname using `dns.lookup`.
   - The resolved IP address is analyzed against standard IPv4 and IPv6 blocklist ranges:
     - **Loopback**: `127.0.0.0/8`, `::1`, `::`.
     - **Private RFC1918**: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`.
     - **Link-Local**: `169.254.0.0/16`, `fe80::/10`.
     - **IPv6 Site-Local**: `fc00::/7`, `fd00::/8`.
     - **Broadcast / Unspecified**: `0.0.0.0`, `224.0.0.0/4`.
3. **Payload Limit**: HTML retrieval limits raw strings to a maximum of 5MB, protecting server CPU and memory against compression bombs.
4. **Request Timeout**: Strict 10-second request timeout via `AbortSignal.timeout(10000)` blocks connection exhaustion attacks.
