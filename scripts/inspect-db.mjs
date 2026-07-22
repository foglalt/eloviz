import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);
console.log(await sql.query("select current_database() as db, current_schema() as schema"));
console.log(await sql.query("select table_schema, table_name from information_schema.tables where table_schema = 'public' order by table_name"));
