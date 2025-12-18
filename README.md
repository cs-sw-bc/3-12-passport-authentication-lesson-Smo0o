# 🔐 Authentication with Passport.js (Session-Based)

## 🎯 Lesson Objective

By the end of this lesson, you will be able to:

* Use Passport.js for **local (username/password)** authentication
* Keep users logged in using **sessions**
* Protect routes using `req.isAuthenticated()`
* Redirect users back to the page they originally tried to access

---

# ✅ Step-by-Step Manual (Local Auth + MongoDB)

## 0) Prerequisites

* Node.js installed
* MongoDB running locally **or** MongoDB Atlas connection string
* A project folder opened in VS Code

---

## 1) Clone your project

```bash
npm install
```

If you want ES Modules (recommended for this course), add this to `package.json`:

```json
{
  "type": "module"
}
```

---

## 2) Install required packages

### ✅ Core packages for this lesson

```bash
npm i passport passport-local express-session
```


---

## 3) Recommended folder structure

```
passport-demo/
  app.js
  db.js
  passport.js
  models/
    User.js
  views/
    login.html
    dashboard.html
    show-notes.html
  routes/
    notes.js
```

---

## 4) Connect to MongoDB

### `db.js`

```js
import mongoose from "mongoose";

export default async function connectDB() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/passport_demo");
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed", err);
  }
}
```

---

## 5) Create a User model

### `models/User.js`

```js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

export default mongoose.model("User", userSchema);
```

> ✅ For this lesson we use plain-text passwords to keep the focus on Passport flow.

---

## 6) Configure Passport (Local Strategy + Sessions)

### `passport.js`

```js
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import User from "./models/User.js";

// 1) LOCAL STRATEGY (login logic)
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username });

      if (!user) return done(null, false);
      if (user.password !== password) return done(null, false);

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

// 2) SERIALIZE: store ONLY an identifier in the session
passport.serializeUser((user, done) => {
  done(null, user._id.toString());
});

// 3) DESERIALIZE: rebuild the user on each request
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// ✅ Route guard (pages)
export function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();

  // Save the original URL for redirect after login
  req.session.returnTo = req.originalUrl;
  res.redirect("/login");
}

export default passport;
```

---

## 7) Create `app.js` (Express + session + passport.initialize)

### `app.js`

```js
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false
  })
);

// Passport wiring
app.use(passport.initialize());
app.use(passport.session());
```

---

## 8) Notes route (API)

### `routes/notes.js`

```js
import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    notes: [
      "Learn Passport",
      "Understand sessions",
      "Protect routes",
      `Logged in as: ${req.user.username}`
    ]
  });
});

export default router;
```

---


# 🧪 Practice Assignment

### Part 1: Local Authentication

1. Add Passport Local authentication to your assignment from the previous class.
2. Protect at least one page and one API route.
3. Add redirect-after-login (return to original page).

### Part 2: Google Authentication

Add Google OAuth authentication using Passport.

Reference videos:

* [https://www.youtube.com/watch?v=Q0a0594tOrc](https://www.youtube.com/watch?v=Q0a0594tOrc)
* [https://www.youtube.com/watch?v=X4mtsWfhNzw](https://www.youtube.com/watch?v=X4mtsWfhNzw)

Deliverable:

* User can login using Google
* User is created/found in the database
* Protected pages work after login
