import 'dotenv/config' // Ensure env vars are loaded
import { Pool } from 'pg' // <--- 1. IMPORT POOL
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client.js'

// 2. Create the actual connection Pool instance
const connectionString = process.env.DATABASE_URL!
const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false } // Essential for Neon/AWS
})

// 3. Pass the 'pool' variable here, NOT the config object
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing todos
  await prisma.todo.deleteMany()

  // Create example todos
  const todos = await prisma.todo.createMany({
    data: [
      { title: 'Buy groceries' },
      { title: 'Read a book' },
      { title: 'Workout' },
    ],
  })

  console.log(`✅ Created ${todos.count} todos`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })