# Launch Checklist (Day 90 Production Readiness)

## 1. Context & Criteria
This launch checklist defines the criteria that must be met before launching WishHub publicly to ensure a stable, secure, and performant user experience.

---

## 2. Readiness Checklist

### Security & Access Controls
- [ ] Implement Next.js Edge middleware rate limiting on all public API routes.
- [ ] Enforce HTTPS on all production domains.
- [ ] Secure production database credentials and verify CORS settings on API handlers.
- [ ] Run automated vulnerability scanning on monorepo dependencies.

### Performance & Scaling
- [ ] Enable Vercel Edge caching on read-only endpoints (such as public wishlists).
- [ ] Set up database connection pooling to handle high concurrent user traffic.
- [ ] Optimize image loading using Next.js image components.
- [ ] Verify that the extension popup load time is consistently under 200ms.

### Monitoring & Analytics
- [ ] Set up error tracking (Sentry) across the web app, docs, and browser extension.
- [ ] Implement database query logging to catch slow queries.
- [ ] Set up analytics tracking (PostHog) to monitor user engagement.

### Operational & Legal
- [ ] Create and publish legal pages (Terms of Service, Privacy Policy).
- [ ] Set up automated database backups with point-in-time recovery.
- [ ] Deploy transactional email services (Resend) for account verifications.
- [ ] Set up a centralized customer support inbox.
