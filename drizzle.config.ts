import { defineConfig } from "drizzle-kit";

// Determine which database dialect to use based on DATABASE_URL
const usePostgres = process.env.DATABASE_URL?.startsWith("postgres");

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
      schema: "./shared/schema-sqlite.ts",
      dialect: "sqlite",
      dbCredentials: {
        url: process.env.DATABASE_PATH || "./data/game.db",
      },
    });
