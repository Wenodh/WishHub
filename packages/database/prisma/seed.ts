import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create or find a default test user
  const testUser = await prisma.user.upsert({
    where: { email: 'demo@wishhub.com' },
    update: {},
    create: {
      email: 'demo@wishhub.com',
      name: 'Demo Explorer',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    },
  });

  console.log(`👤 Test user created/found: ${testUser.email}`);

  // Create a default wishlist for the user
  const defaultWishlist = await prisma.wishlist.upsert({
    where: {
      userId_name: {
        userId: testUser.id,
        name: 'My First Wishlist',
      },
    },
    update: {},
    create: {
      userId: testUser.id,
      name: 'My First Wishlist',
      isDefault: true,
    },
  });

  console.log(`📂 Default wishlist created/found: ${defaultWishlist.name}`);

  // Create some premium design-inspired products
  const productsToSeed = [
    {
      store: 'Amazon',
      externalId: 'B08N5LNXC5',
      canonicalUrl: 'https://www.amazon.com/dp/B08N5LNXC5',
      title: 'Apple MacBook Air (M1, 2020)',
      description: 'The thinnest, lightest notebook, completely transformed by the Apple M1 chip. CPU speeds up to 3.5x faster. GPU speeds up to 5x faster. Our most advanced Neural Engine for up to 9x faster machine learning. The longest battery life ever in a MacBook Air. And a silent, fanless design.',
      brand: 'Apple',
      images: [
        { url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80' }
      ],
      category: 'Electronics',
      metadata: { price: 999, currency: 'USD' },
      tags: ['Laptop', 'Premium', 'Apple', 'Productivity'],
    },
    {
      store: 'Amazon',
      externalId: 'B0B92N7Y7V',
      canonicalUrl: 'https://www.amazon.com/dp/B0B92N7Y7V',
      title: 'Sony WH-1000XM5 Wireless Headphones',
      description: 'The WH-1000XM5 headphones rewrite the rules for distraction-free listening. Two processors control 8 microphones for unprecedented active noise canceling and exceptional call quality.',
      brand: 'Sony',
      images: [
        { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80' }
      ],
      category: 'Audio',
      metadata: { price: 398, currency: 'USD' },
      tags: ['Audio', 'Noise Canceling', 'Premium', 'Travel'],
    },
    {
      store: 'Amazon',
      externalId: 'B09G96TFFX',
      canonicalUrl: 'https://www.amazon.com/dp/B09G96TFFX',
      title: 'iPad Mini (6th Generation)',
      description: 'iPad mini is meticulously designed to be absolutely beautiful. An all-new enclosure features a new, larger edge-to-edge screen, along with narrow borders and elegant rounded corners.',
      brand: 'Apple',
      images: [
        { url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80' }
      ],
      category: 'Electronics',
      metadata: { price: 499, currency: 'USD' },
      tags: ['Tablet', 'Apple', 'Portable', 'Design'],
    }
  ];

  for (const item of productsToSeed) {
    const { tags, ...productData } = item;

    // Create Catalog Product
    const catalogProduct = await prisma.catalogProduct.upsert({
      where: { canonicalUrl: productData.canonicalUrl },
      update: productData,
      create: productData,
    });

    console.log(`📦 Seeded Catalog Product: ${catalogProduct.title}`);

    // Create Tags
    for (const tagName of tags) {
      await prisma.productTag.upsert({
        where: {
          catalogProductId_name: {
            catalogProductId: catalogProduct.id,
            name: tagName,
          },
        },
        update: {},
        create: {
          catalogProductId: catalogProduct.id,
          name: tagName,
        },
      });
    }

    // Link product to test user's wishlist
    const savedProduct = await prisma.savedProduct.upsert({
      where: {
        userId_catalogProductId: {
          userId: testUser.id,
          catalogProductId: catalogProduct.id,
        },
      },
      update: {},
      create: {
        userId: testUser.id,
        catalogProductId: catalogProduct.id,
        originalUrl: productData.canonicalUrl,
      },
    });

    await prisma.wishlistItem.upsert({
      where: {
        wishlistId_savedProductId: {
          wishlistId: defaultWishlist.id,
          savedProductId: savedProduct.id,
        },
      },
      update: {},
      create: {
        wishlistId: defaultWishlist.id,
        savedProductId: savedProduct.id,
      },
    });

    // Create a beautiful default AI Insight for each product
    await prisma.productInsight.upsert({
      where: {
        catalogProductId_promptVersion: {
          catalogProductId: catalogProduct.id,
          promptVersion: '1.0.0',
        },
      },
      update: {},
      create: {
        catalogProductId: catalogProduct.id,
        summary: `A high-quality, top-tier consumer choice for ${productData.category || 'general'} needs, offering unmatched experience in its class.`,
        pros: ['Exceptional design language', 'Highly reliable and functional', 'Fantastic customer satisfaction ratings'],
        cons: ['Premium price entry point', 'Minor learning curve'],
        buyRecommendation: 'Good Buy',
        confidenceScore: 0.92,
        reasoning: 'The product consistently ranks at the top of performance benchmarks and consumer reviews.',
        provider: 'mock',
        model: 'deterministic-hash',
        promptVersion: '1.0.0',
        contentFingerprint: 'seed-fingerprint-' + catalogProduct.id,
      },
    });
  }

  console.log('✅ Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
