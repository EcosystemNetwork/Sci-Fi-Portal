import { defineConfig } from "drizzle-kit";

// Determine which database dialect to use based on DATABASE_URL
const usePostgres = process.env.DATABASE_URL?.startsWith("postgres");

if (usePostgres && !process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set for PostgreSQL mode");
}

export default usePostgres
  ? defineConfig({
      out: "./migrations",
      schema: "./shared/schema.ts",
      dialect: "postgresql",
      dbCredentials: {
        url: process.env.DATABASE_URL!,
      },
    })
  : defineConfig({
      out: "./migrations-sqlite",
      schema: "./shared/schema.ts",
      dialect: "sqlite",
      dbCredentials: {
        url: process.env.DATABASE_PATH || "./data/game.db",
      },
    });
