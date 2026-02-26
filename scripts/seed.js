/* eslint-disable @typescript-eslint/no-require-imports */
const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

dotenv.config({ path: ".env.local" });
if (!process.env.MONGODB_URI) {
  dotenv.config({ path: ".env" });
}

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("Please define MONGODB_URI in your environment variables");
  process.exit(1);
}

async function seed() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db();
    const usersCollection = db.collection("users");

    const users = [
      {
        name: "Supervisor User",
        email: "supervisor@example.com",
        password: await bcrypt.hash("password123", 10),
        role: "Supervisor",
      },
      {
        name: "Specialist User",
        email: "specialist@example.com",
        password: await bcrypt.hash("password123", 10),
        role: "Specialist",
      },
      {
        name: "Staff User",
        email: "staff@example.com",
        password: await bcrypt.hash("password123", 10),
        role: "Staff",
      },
    ];

    for (const user of users) {
      await usersCollection.updateOne(
        { email: user.email },
        { $set: user },
        { upsert: true }
      );
      console.log(`User ${user.email} seeded/updated`);
    }

    console.log("Seeding completed successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await client.close();
  }
}

seed();
