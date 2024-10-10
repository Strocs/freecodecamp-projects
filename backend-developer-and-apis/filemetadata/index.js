var express = require("express");
const multer = require("multer");
var cors = require("cors");
require("dotenv").config();

var app = express();

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(cors());
app.use("/public", express.static(process.cwd() + "/public"));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.post("/api/fileanalyse", upload.single("upfile"), function (req, res) {
  try {
    const { originalname, mimetype, size } = req.file;
    res.json({ name: originalname, type: mimetype, size });
  } catch (error) {
    if ((typeof error) instanceof Error) {
      res.json({ error });
    }
  }
});

const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Your app is listening on port " + port);
});
