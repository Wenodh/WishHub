# Long-Term Architecture (3-Year Plan)

## 1. Modular Monolith to Event-Driven Microservices
While a modular monorepo (monolith) is highly efficient for MVP validation, scaling to millions of users will require transitioning to a hybrid, event-driven microservices architecture.

```mermaid
graph TD
    %% User entry
    client[Browser / Extension / Mobile Client] --> api_gw[API Gateway / Cloudflare]

    %% NextJS Web Service
    api_gw --> web_service[NextJS Web Service]
    web_service --> cache[Redis Cache Layer]

    %% Event Broker
    web_service -- Publish Event --> event_bus[Apache Kafka / RabbitMQ]

    %% Decoupled Workers
    event_bus --> scraper_service[Scraper & Normalizer Service]
    event_bus --> notification_service[Notification & Messaging Service]
    event_bus --> ai_service[AI Analytics & Taxonomy Service]

    %% Databases
    scraper_service --> pg_pool[Supabase PostgreSQL Replica Pool]
    notification_service --> pg_pool
    ai_service --> vector_db[Pinecone Vector Database]
```

---

## 2. Distributed Caching & Task Queues
- **Redis Replication**: Deploy Redis clusters across target regional Edge nodes to cache user sessions and frequently accessed public wishlist details, minimizing database read operations.
- **Robust Task Worker Queues**: Migrate background operations (such as scheduling scrapers or sending alerts) to event-driven processing frameworks like **BullMQ** or **Temporal**. This guarantees reliable, transactional execution with built-in retry logic.

---

## 3. Search, Vector Indexing, & AI Recommendations
- **Semantic Product Search**: Store product description embeddings inside a vector database like **Pinecone** or PostgreSQL with **pgvector**. This enables semantic search, visual similarity matching, and automatic alternative product recommendations.
- **AI Taxonomy Engine**: Deploy background workers to automatically tag, clean, and categorize catalog items into a standardized taxonomy, keeping search indexes clean and accurate.
