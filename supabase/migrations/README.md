# Supabase migrations

These migrations are written to be repeatable and service-role friendly.

## Local

- Run the SQL files in order against a local Supabase instance.
- Use the service role key on the server only.

## Preview

- Keep preview databases isolated from development.
- Sync product rows from `lib/commercial/products.ts` after deploy if needed.

## Production

- Apply the migrations in order.
- Do not expose report tables to anonymous clients.
- Keep row level security enabled and access the tables only from server-side code.
