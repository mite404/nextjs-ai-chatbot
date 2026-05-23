import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const db = drizzle({
  client: postgres(process.env.DATABASE_URL!, {
    // Disable prepared statements for Supabase Transaction pool mode
    prepare: false,
  }),
});

export { db };
