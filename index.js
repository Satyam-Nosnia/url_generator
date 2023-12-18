const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const app = express();
const PORT = 3003;

const { poolPromise, sql } = require("./config/dbConfig");

// Function to check the database connection
const checkDatabaseConnection = async () => {
  try {
    const pool = await poolPromise;
    if (pool.connected) {
      console.log("Database connection is established.");
    } else {
      console.error("Database connection is not established.");
    }
  } catch (error) {
    console.error("Error checking database connection:", error);
  }
};

checkDatabaseConnection();

app.use(cors());
app.use(express.json());

// Express route to handle dynamic URLs
app.get("/:dynamicUrl", async (req, res) => {
  const dynamicUrl = req.params.dynamicUrl;

  try {
    // Fetch text and video data from MSSQL based on dynamicUrl
    const data = await fetchDataFromMSSQL(dynamicUrl);

    // Example response
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/storeData", async (req, res) => {
  try {
    const { videoPath } = req.body;

    const url = generateRandomString(6);

    // Validate inputs (you can add more validation as needed)
    if (!url || !videoPath) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Store data in MSSQL
    const result = await storeDataInMSSQL(url, videoPath);

    res.json({ success: true, result });
  } catch (error) {
    console.error("Error storing data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Define MSSQL query function
async function fetchDataFromMSSQL(dynamicUrl) {
  try {
    // Create a connection pool
    const pool = await poolPromise;
    const SP_GET_URL_DATA = "GET_URL_DATA";

    // Execute MSSQL query based on dynamicUrl

    const result = await pool
      .request()
      .input("dynamicUrl", sql.NVarChar, dynamicUrl)
      .execute(SP_GET_URL_DATA);

    // Close the connection pool
    await pool.close();

    // Return the result
    return result.recordset[0]; // Assuming a single result row, adjust as needed
  } catch (error) {
    console.error("Error fetching data from MSSQL:", error);
    console.log(error);
  }
}

async function storeDataInMSSQL(url, videoPath) {
  try {
    const pool = await poolPromise;

    const SP_STORE_URL_DATA = "SP_GET_URL_DATA";

    // Assuming you have a table named 'YourTable'
    const result = await pool
      .request()
      .input("date", sql.DateTime, new Date()) // Assuming date is a string in a valid format
      .input("url", sql.NVarChar, url)
      .input("videoPath", sql.NVarChar, videoPath)
      .execute(SP_STORE_URL_DATA);
    // .query('INSERT INTO YourTable (DateColumn, UrlColumn, VideoPathColumn) VALUES (@date, @url, @videoPath)');

    await pool.close();

    return result.rowsAffected;
  } catch (error) {
    console.error("Error storing data in MSSQL:", error);
    console.error(error);
  }
}

function generateRandomString(length) {
  const buffer = crypto.randomBytes(length);
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let randomString = "";

  for (let i = 0; i < buffer.length; i++) {
    const randomIndex = buffer.readUInt8(i) % characters.length;
    randomString += characters.charAt(randomIndex);
  }

  return randomString;
}

function getRandomURLString(length) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let randomString = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }

  return randomString;
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
