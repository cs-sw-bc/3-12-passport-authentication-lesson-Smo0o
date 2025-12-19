import passport from "passport";
import { Strategy } from "passport-local";
import User from "./models/user.js";

passport.use(new Strategy(
 async function(username, password, done) {
    const user_to_test = await User.findOne({username: username}); //fetch the user from DB
    console.log(user_to_test);
    //CHeck if the given password= database password.
    if (!user_to_test) { return done(null, false); }

    console.log("users password",password);
    if(user_to_test.password == password){
        return done(null, user_to_test); // auth success
    }else{
        //incorrect password
        return done(null, false);
    }

  }
));

// if authentication succeeded, store some aspect of the user in the session -1 
passport.serializeUser((user,done)=>{
    //save the user in the session
    done(null, user.username);
});
//Everytime the use with a Session ID logs in, extract their information from database - 2 (Deserialize User)
//run on every single requiest after loggin in.
passport.deserializeUser(async(username, done)=>{
    //fetch all infortmation from database
    const loggedinUser = await User.findOne({username: username});
    done(null, loggedinUser);
});

export default passport;