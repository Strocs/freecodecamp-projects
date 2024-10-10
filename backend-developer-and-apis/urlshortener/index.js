require("dotenv").config();
const dns = require("dns");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

let savedUrls = [];

// Middleware to check url
function checkUrl(req, res, next) {
  const prefixRegex = /http(s)?:\/\//g;
  const getUrl = req.body.url.replace(prefixRegex, "").split("/")[0];

  dns.lookup(getUrl, function (err) {
    if (err) return res.json({ error: "invalid url" });
    next();
  });
}

app.post("/api/shorturl", checkUrl, function (req, res) {
  const original_url = req.body.url;
  const short_url = savedUrls.length;
  savedUrls.push(original_url);

  res.json({ original_url, short_url });
});

app.get("/api/shorturl/:shorturl", function (req, res) {
  const shorturl = req.params.shorturl;
  res.redirect(savedUrls[shorturl]);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
