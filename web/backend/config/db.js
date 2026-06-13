const sql = require('mssql');
require('dotenv').config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT) || 1433,
  options: {
    encrypt: false, // Use false for local development
    trustServerCertificate: true, // Crucial for local dev instances
    enableArithAbort: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

console.log(`Attempting to connect to SQL Server [${config.server}:${config.port}] DB [${config.database}] as [${config.user}]...`);

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('--------------------------------------------------');
    console.log('🎉 CONNECTED TO SQL SERVER SUCCESSFULLY');
    console.log('--------------------------------------------------');
    return pool;
  })
  .catch(err => {
    console.log('--------------------------------------------------');
    console.error('❌ SQL SERVER CONNECTION FAILED:', err.message);
    console.log('💡 Note: The backend server is still running.');
    console.log('💡 Please check your database server state and update web/backend/.env with correct credentials.');
    console.log('--------------------------------------------------');
  });

module.exports = {
  sql,
  poolPromise
};
