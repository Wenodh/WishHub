# Security Audit Report

This report evaluates and verifies the defensive controls, session validations, and server-side authorization patterns across WishHub's production architecture.

---

## 1. Authentication Security (Neon Auth)

- **Authoritative Provider**: **Neon Auth** has been successfully integrated as the single authoritative provider for V1.
- **Cryptographic Signature Validation**: All server-side requests are checked inside `withApiHandler` via `auth.api.getSession({ headers: req.headers })`. This extracts the session cookie and verifies its cryptographic HMAC-SHA256 signature using `NEON_AUTH_COOKIE_SECRET`.
- **Zero Client Spoofing**: Since session decoding is completed entirely server-side, it is mathematically impossible for malicious clients to spoof active user sessions or session tokens.

---

## 2. Server-Side Authorization & IDOR Mitigations

Every API handler and service in WishHub is strictly hardened against Insecure Direct Object Reference (IDOR) attacks:

1. **Never Trust Client Inputs**:
   - We **never trust** `userId` parameters from request bodies, query strings, or client state.
   - The user's authenticated identity (`session.user.id`) is always resolved securely on the server-side from the validated session.
2. **Resource Scoping**:
   - Access to wishlists and products is strictly scoped to the derived user ID.
   - For example, when reading, modifying, or deleting a saved product in `/api/products/[id]`, the system performs ownership verification:
     ```typescript
     const savedProduct = await prisma.savedProduct.findUnique({
       where: { id },
     });

     if (!savedProduct || savedProduct.userId !== session.user.id) {
       return ApiResponse.forbidden('You do not have access to this product');
     }
     ```
   - This guarantees that **User B cannot**:
     - Read or list User A's wishlist or products.
     - Add products to User A's wishlist.
     - Modify, archive, or delete User A's products.
     - Read User A's AI shopping insights.

---

## 3. Server-Side Request Forgery (SSRF) Mitigations

The product metadata extraction route (`/api/products/extract`) handles untrusted user URLs using a multi-tiered defense in depth strategy:

1. **Protocol Restriction**: Built into the Zod validation schema. Only `http://` and `https://` schemes are permitted. Other schemes (e.g., `file://`, `ftp://`, `gopher://`, `data:`) are rejected.
2. **DNS Resolution Verification**:
   - The handler resolves the target domain's IP address asynchronously using node's `dns.lookup()`.
3. **Private & Loopback IP Blocking**:
   - The resolved IP address is verified against a strict subnet blocklist. Access is immediately aborted if the resolved IP belongs to private or loopback ranges:
     - **Loopback**: `127.0.0.0/8`, `::1`, `::`.
     - **Private RFC1918**: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`.
     - **Link-Local**: `169.254.0.0/16`, `fe80::/10`.
     - **IPv6 Unique Local / Site Local**: `fc00::/7`, `fd00::/8`.
     - **Anycast / Broadcast**: `0.0.0.0`, `255.255.255.255`.
4. **Timeout Controls**: Enforced with a strict 10-second request timeout via `AbortSignal.timeout(10000)` to prevent resource exhaustion/slowloris attacks.
5. **Payload Cap**: Max downloaded HTML stream limit is 5MB to block zip bomb or decompression memory inflation attacks.
