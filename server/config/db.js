const mysql = require('mysql2/promise')
require('dotenv').config();

const connection = mysql.createPool({
  host: 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: 'medical'
})

module.exports = connection