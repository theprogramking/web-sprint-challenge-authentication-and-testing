const router = require("express").Router();
const bcrypt = require("bcryptjs");
const Users = require("../user/user-model");
const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/secrets");

router.post("/register", (req, res) => {
  let user = req.body;
  const hash = bcrypt.hashSync(user.password, 20);
  user.password = hash;
  Users.add(user)
    .then((savedUser) => {
      res.status(200).json(savedUser);
    })
    .catch((error) => {
      res.status(500).json({
        err: error,
        message: "There was an error registering user.",
      });
    });
});

router.post("/login", (req, res) => {
  let { username, password } = req.body;
  Users.findBy({ username })
    .first()
    .then((user) => {
      if (user && bcrypt.compareSync(password, user.password)) {
        const token = generateToken(user);
        res.status(200).json({
          message: "Howdy",
          token,
        });
      } else {
        res.status(401).json({
          message: "Invalid creds bro.",
        });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: "There was an error logging in.",
        err: error,
      });
    });
});

function generateToken(user) {
  const payload = {
    subject: user.id,
    username: user.username,
  };
  const options = {
    expiresIn: "1h",
  };
  return jwt.sign(payload, jwtSecret, options);
}

module.exports = router;
