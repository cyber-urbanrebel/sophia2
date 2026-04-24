const express = require("express");
const axios = require("axios");

const app = express();
const port = 3000;

const consumerKey = "YOUR_CONSUMER_KEY";
const consumerSecret = "YOUR_CONSUMER_SECRET";

app.get("/token", async (req, res) => {
  try {
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

    const response = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`
        }
      }
    );

    res.json(response.data);

  } catch (error) {
    res.status(500).json(error.response?.data || error.message);
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});