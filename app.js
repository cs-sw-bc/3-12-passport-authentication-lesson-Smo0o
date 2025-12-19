import notesRoute from "./routes/notes.js"
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import express from "express"
import passport from "./passport.js";
import connectDB from "./db.js";
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const app = express();

connectDB();
//add session
app.use(session({
  secret: "daniel cat",
  resave: false,
  saveUninitialized: false
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// initialize passport
app.use(passport.initialize());
app.use(passport.session());
//Create POST login
app.post("/login",
passport.authenticate('local', { failureRedirect: '/crash', failureMessage: true, successRedirect: '/dashboard'}
));

function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }else{
    res.redirect('/login');
  }
}
//Create logout
app.get('/logout', function(req, res, next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/login');
  });
});
//Create a function to authenticate if a user logged in

app.get("/login", (req, res) => {
  res.sendFile(path.join(dirname, "views", "login.html"));
});


//Protecting routes
app.get("/dashboard", ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(dirname, "views", "dashboard.html"));
});

app.get("/show-notes", ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(dirname, "views", "show-notes.html"));
});


app.use((req, res, next)=>{
  console.log("Request received in this global middleware function");
  next();
});

app.use("/crash",(req,res,next)=>{
    const error = new Error("Authenticated failed");
    error.status =401;
    next(error);
})
app.use("/notes", ensureAuthenticated, notesRoute);

//4. Route not found middleware function
app.use((a,b,c) =>{
  const error = new Error("We don't have that route in our API listings");
  error.status = 404;
  c(error);
});

app.use((err, req, res, next)=>{
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    ERROR:{
      status: statusCode,
      message: err.message
    }
  })
});


app.listen(3000, () => console.log("Server running on http://localhost:3000"));