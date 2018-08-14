const jwt = require("jsonwebtoken");
const User = require("./../models/user");

// module.exports = (req, res, next) => {
//   var token = req.header("x-auth");

//   jwt.verify(token, "theWorldBiggestSecret", (err, decoded) => {
//     User.findUserWithToken({ _id: decoded._id, "tokens.token": token })
//       .then(foundUser => {
//         req.user = foundUser;
//         req.token = token;
//         next();
//       })
//       .catch(e => {
//         res.status(401).send(e);
//       });
//   });
// };

module.exports = (req, res, next) => {
  var token = req.header("x-auth");

  jwt.verify(token, "TopSecret", (err, decoded) => {
    if (!decoded) {
      User.findOne({ "tokens.token": token })
        .then(foundUser => {
          if (foundUser) {
            foundUser.removeToken(token);
          }
        })
        .catch(err);
      return res.status(401).send("Invalid token.");
    }

    User.findOne({ _id: decoded._id, "tokens.token": token })
      .then(foundUser => {
        if (!foundUser) {
          return res.status(401).send("Invalid token.");
        }

        req.user = foundUser;
        req.token = token;
        req.logout = function() {
          req.user.removeToken(req.token);
        };
        next();
      })
      .catch(err => {
        return res.status(401).send(err);
      });
  });
};
