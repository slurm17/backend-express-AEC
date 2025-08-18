// src/db/access.js
import ADODB from "node-adodb";
import path from "path";

const dbPath = path.resolve("db/Database21.accdb");

const accessConnection = ADODB.open(
  `Provider=Microsoft.ACE.OLEDB.12.0;Data Source=${dbPath};Persist Security Info=False;`
);

export default accessConnection;
