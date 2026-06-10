const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'warehouse',
    password: 'postgres',
    port: 5432,
});

async function getUser(id) {
    try {
        const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        console.log(res.rows[0]);
    } catch (err) {
        console.error('Error executing query', err.stack);
    }
}
