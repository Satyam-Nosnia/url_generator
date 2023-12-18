const sql = require("mssql");

const config = {
  server: "s1.anantya.ai",
  database: "anantyalink",
  port: 63999,
  user: "AnantyaLinkUser",
  password: "qwe!@#@AnantyaLinkUser",
  enableArithAbort: true,
  trustServerCertificate: true,
};

const poolPromise = new sql.ConnectionPool(config).connect();

module.exports = {
  sql,
  poolPromise,
};