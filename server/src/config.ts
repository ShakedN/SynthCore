// All settings in one place. Values come from environment variables, with
// defaults that match docker-compose.yml, so local dev works with zero setup.
export const config = {
  port: Number(process.env.PORT ?? 1234),
  databaseUrl:
    process.env.DATABASE_URL ?? "postgres://synthcore:synthcore@localhost:5432/synthcore",
};
