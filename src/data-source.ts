// import "reflect-metadata";
// import { DataSource } from "typeorm";
// import { Link } from "./entity/Link";
// import dotenv from "dotenv";

// dotenv.config();

// export const AppDataSource = new DataSource({
//   type: "postgres",
//   host: process.env.DB_HOST,
//   username: process.env.DB_USER,
//   password: process.env.DB_PASS,
//   database: process.env.DB_NAME,
//   synchronize: false,          
//   logging: false,
//   entities: [Link],     
//   migrations: ["src/migrations/*.ts"],
//   migrationsTableName: "migrations",
// });







import "reflect-metadata";
import { DataSource } from "typeorm";
import { Link } from "./entity/Link";
import dotenv from "dotenv";

dotenv.config();

// Check if we're using DATABASE_URL (Neon) or individual vars (local)
let dbConfig: any = {};

if (process.env.DATABASE_URL) {
  // Parse DATABASE_URL for Neon (production)
  const url = new URL(process.env.DATABASE_URL);
  dbConfig = {
    host: url.hostname,
    port: parseInt(url.port) || 5432,
    username: url.username,
    password: url.password,
    database: url.pathname.slice(1), // Remove leading '/'
    ssl: {
      rejectUnauthorized: false, // ✅ This fixes the SSL error for Neon
    },
  };
  console.log("✅ Using Neon database (SSL enabled)");
} else {
  // Use individual env vars for local PostgreSQL
  dbConfig = {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    // No SSL needed for local PostgreSQL
  };
  console.log("✅ Using local PostgreSQL (no SSL)");
}

export const AppDataSource = new DataSource({
  type: "postgres",
  ...dbConfig,
  synchronize: false,
  logging: false,
  entities: [Link],
  migrations: [
    process.env.NODE_ENV === "production"
      ? "dist/migrations/*.js"
      : "src/migrations/*.ts",
  ],
  migrationsTableName: "migrations",
});