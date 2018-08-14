// BASE SETUP
//=========================================

// Call the pakages
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const { ObjectID } = require("mongodb");
const authenticate = require("./middleware/authenticate");

// Create app
const app = express();

// Connect to database
mongoose.Promise = global.Promise;
mongoose.connect(
  "mongodb://localhost:27017/blog",
  { useNewUrlParser: true },
  err => {
    if (err) {
      console.log("Fail to connect to DB.");
    }
  }
);

// Setup db models
const Blog = require("./models/blog");
const User = require("./models/user");

// App config
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set(express.static(__dirname + "/public"));

// Setup port
port = process.env.PORT || 4000;

// ROUTES FOR THE APP
//=========================================

// GET /
app.get("/", (req, res) => {
  res.send("Hello");
});

// GET /blog
// Show all the blogs
app.get("/blog", (req, res) => {
  Blog.find().then(
    blogs => {
      res.send({ blogs });
    },
    e => {
      res.status(400).send();
    }
  );
});

// GET /blog
// Create a blog
app.post("/blog", (req, res) => {
  var newBlog = new Blog({
    title: req.body.title,
    text: req.body.text
  });

  newBlog.save().then(
    blog => {
      res.send(blog);
    },
    e => {
      res.status(400).send();
    }
  );
});

// GET /blog/:id
// Show the requested blog
app.get("/blog/:id", (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    res.status(404).send();
  }

  Blog.findById(id).then(
    blog => {
      res.send(blog);
    },
    e => {
      res.status(400).send();
    }
  );
});

// PATCH /blog/:id
// Update a requested blog's content
app.patch("/blog/:id", (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ["title", "text", "image"]);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Blog.findByIdAndUpdate(id, { $set: body }, { new: true }).then(
    updatedBlog => {
      if (!updatedBlog) {
        return res.status(404).send();
      }

      updatedBlog.date = Date.now;
      updatedBlog.edited = true;

      res.send(updatedBlog);
    },
    e => {
      res.status(400).send();
    }
  );
});

// DELETE /blog/:id
// Delete the requested blog
app.delete("/blog/:id", (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Blog.findByIdAndRemove(id).then(
    removedBlog => {
      if (!removedBlog) {
        return res.status(404).send();
      }

      res.send(removedBlog);
    },
    e => {
      res.status(400).send();
    }
  );
});

// POST /user
// Create a user
app.post("/user", (req, res) => {
  var body = _.pick(req.body, ["username", "email", "password"]);
  var newUser = new User(body);

  newUser
    .save()
    .then(() => {
      return newUser.generateAuthToken();
    })
    .then(token => {
      res.header("x-auth", token).send(newUser);
    })
    .catch(err => {
      res.status(400).send(err);
    });
});

// app.post("/user", (req, res) => {
//   var body = _.pick(req.body, ["username", "email", "password"]);

//   User.create(body)
//     .then(newUser => {
//       res.header("x-auth", newUser.generateAuthToken()).send(newUser);
//     })
//     .catch(err => {
//       res.status(400).send(err);
//     });
// });

// POST /login
// Login
app.post("/login", (req, res) => {
  var body = _.pick(req.body, ["uOre", "password"]);

  User.verifyCredential(body.uOre, body.password)
    .then(user => {
      res.header("x-auth", user.generateAuthToken()).send("Logged in");
    })
    .catch(err => {
      res.status(400).send(err);
    });
});

// GET / logout
// Logout
app.delete("/logout", authenticate, (req, res) => {
  req.logout();
  res.send("Logged out");
});

// This is used to test authenticate
app.get("/secret", authenticate, (req, res) => {
  res.send("Secret");
});

app.listen(port, () => {
  console.log(`Server started at ${port}`);
});
