const { Pool } = require("pg");
require("dotenv").config();

console.log("Host:", process.env.DB_HOST);
console.log("User:", process.env.DB_USER);
console.log("Port:", process.env.DB_PORT);

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.connect()
  .then(() => console.log("Connecté à Supabase PostgreSQL !"))
  .catch(err => console.error("Erreur de connexion :", err));

module.exports = pool;
