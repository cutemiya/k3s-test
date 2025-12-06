const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.on('connect', () => {
    console.log('Подключение к базе данных установлено');
});

pool.on('error', (err) => {
    console.error('Ошибка подключения к базе данных:', err.message);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool,
};