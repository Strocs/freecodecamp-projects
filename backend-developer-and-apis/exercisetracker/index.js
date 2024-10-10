const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

let userDB = [];
let exerciseDB = [];

function generateId() {
  let id = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 24; i++)
    id += possible.charAt(Math.floor(Math.random() * possible.length));

  return id;
}

// Create and get users
app
  .route("/api/users")
  .post(function (req, res) {
    const findUser = userDB.find((user) => user.username === req.body.username);

    if (findUser)
      return res.status(409).json({ message: "User already exists" });

    let user = {
      username: req.body.username,
      _id: generateId(),
    };

    userDB.push(user);
    res.json(user).status(201);
  })
  .get(function (req, res) {
    res.json(userDB).status(200);
  });

// Create and get exercises
app.post("/api/users/:_id/exercises", function (req, res) {
  const user = userDB.find((user) => user._id === req.params._id);

  if (!user) return res.status(404).json({ message: "User not found" });

  let exercise = {
    username: user.username,
    description: req.body.description,
    duration: +req.body.duration,
    date: req.body.date
      ? new Date(req.body.date).toDateString()
      : new Date().toDateString(),
    _id: user._id,
  };

  exerciseDB.push(exercise);
  res.json(exercise).status(201);
});

app.get("/api/users/:_id/logs", function (req, res) {
  const user = userDB.find((user) => user._id === req.params._id);

  if (!user) return res.status(404).json({ message: "User not found" });

  const from = req.query.from && new Date(req.query.from);
  const to = req.query.to && new Date(req.query.to);
  const limit = +req.query.limit;

  console.log({ query: req.query, from, to, limit });

  const userExercises = exerciseDB.filter((exercise) => {
    if (exercise._id !== user._id) return false;
    if (from && new Date(exercise.date) < from) return false;
    if (to && new Date(exercise.date) > to) return false;
    return true;
  });

  if (limit && limit < userExercises.length)
    userExercises.splice(limit, userExercises.length - limit);

  let log = {
    username: user.username,
    count: userExercises.length,
    _id: user._id,
    log: userExercises.map((exercices) => ({
      description: exercices.description,
      duration: exercices.duration,
      date: exercices.date,
    })),
  };

  res.json(log).status(201);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
