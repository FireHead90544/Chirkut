
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();
const saltRounds = 10;

interface User {
  name: string;
  pin: string;
}

interface Config {
  users: User[];
}

async function main() {
  // Read configuration file
  const configPath = join(process.cwd(), 'config.json');
  let config: Config;

  try {
    const configFile = readFileSync(configPath, 'utf-8');
    config = JSON.parse(configFile);
  } catch (error) {
    console.error('Error reading config.json. Please create a config.json file based on config.example.json');
    process.exit(1);
  }

  // Validate configuration
  if (!config.users || config.users.length === 0) {
    console.error('No users found in config.json. Please add at least one user.');
    process.exit(1);
  }

  // Clear existing users
  await prisma.user.deleteMany({});

  // Create users from configuration
  const usersToCreate = await Promise.all(
    config.users.map(async (user) => ({
      name: user.name,
      pin: await bcrypt.hash(user.pin, saltRounds),
    }))
  );

  await prisma.user.createMany({
    data: usersToCreate,
  });

  console.log(`✓ Seeded ${usersToCreate.length} user(s) successfully`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
