const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const { default: mongoose } = require("mongoose");
const nunjucks = require("nunjucks");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const expressSession = require("express-session");
const path = require("path");
const MongoStore = require("connect-mongo");
const { ensureAuthenticated } = require("./utils/ensureAuthenticated");

const app = express();

const port = process.env.PORT || 3000;
const connectionUri = process.env.MONGODB_CONNECTION_URI;
const secret = process.env.SESSION_SECRET;

const nunjuckEnv = nunjucks.configure("src/views", {
  autoescape: true,
  express: app,
  watch: process.env.NODE_ENV === "production" ? false : true,
});

nunjuckEnv.addFilter("date", (dateInput) => {
  const date = new Date(dateInput);
  return date.toISOString().split("T")[0].replaceAll("-", ". ") + ".";
});

app.set("engine", nunjuckEnv);

app.use(express.static(path.join(__dirname, "public")));

mongoose.connect(connectionUri);

mongoose.connection.on("connected", () => {
  console.log("succesfull db connect");
});

mongoose.connection.on("error", (error) => {
  console.log("error", error);
});

require("./models/user.model");
require("./models/country.model");
require("./models/subcountry.model");
require("./models/city.model");
require("./models/image.model");
require("./models/category.model");
require("./models/rating.model");

const userModel = mongoose.model("user");

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));

passport.use(
  "local",
  new LocalStrategy(
    { usernameField: "username", passwordField: "password" },
    (username, password, done) => {
      userModel.findOne({ username: username }, (err, user) => {
        if (err) return done("Error during request.", null);
        if (!user) return done(null, false);
        user.comparePasswords(password, (error, isMatch) => {
          if (error) return done(error, false);
          if (!isMatch) return done(null, false);
          return done(null, user);
        });
      });
    }
  )
);

passport.serializeUser((user, done) => {
  if (!user) return done("No user provided", null);
  return done(null, user);
});

passport.deserializeUser((user, done) => {
  if (!user) return done("No user provided", null);
  return done(null, user);
});

console.log("testecs");

app.use(
  expressSession({
    secret,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: connectionUri }),
    cookie: {
      maxAge: 5 * 24 * 60 * 60 * 1000,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(require("./utils/inject-globals"));
app.use("/auth", require("./routes/auth.routes"));
app.use("/images", require("./routes/image.routes"));
app.use("/users", ensureAuthenticated, require("./routes/user.routes"));
app.use("/admin", require("./routes/admin.routes"));
app.use("/api", require("./routes/api.routes"));

app.get("/", (req, res) => {
  return res.redirect("/images");
});

app.use((req, res, next) => {
  res.status(404).send("Not found");
});

app.listen(port, () => {
  console.log(`Server started on port`);
});
// new comment in index.js
