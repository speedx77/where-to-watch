import pg from "pg";

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "where_to_watch",
    password: "test123",
    port: 5432,
});
db.connect();

