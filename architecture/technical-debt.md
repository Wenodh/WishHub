# Technical Debt Register

This document tracks known technical limitations and architectural improvements identified during development.

## High Priority

### 1. Advanced Search Optimization
- **Category**: Performance
- **Current State**: Search is performed using basic Prisma `contains` queries.
- **Goal**: Implement full-text search using Postgres indexes or Algolia.

### 2. Image Optimization and Resizing
- **Category**: Performance
- **Current State**: We serve raw product images directly from stores.
- **Goal**: Implement a proxy/CDN that resizes and caches images for the dashboard grid.

## Medium Priority

### 3. Background Scraper Resiliency
- **Category**: Reliability
- **Current State**: Scraping happens synchronously during the API request.
- **Goal**: Move scraping to a background job (e.g., Upstash Workflow) to reduce latency and allow for retries.

### 4. Shared SDK for Mobile
- **Category**: Architecture
- **Current State**: `@wishhub/sdk` is optimized for web fetch.
- **Goal**: Ensure the SDK works seamlessly in React Native environment without Node.js dependencies.

## Low Priority

### 5. Automated E2E Flow Tests
- **Category**: Testing
- **Current State**: We have high unit and integration coverage, but few end-to-end flows.
- **Goal**: Implement Playwright tests covering the path from Extension save to Dashboard view.
