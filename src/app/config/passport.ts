import bcrypt from "bcryptjs";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { User } from "../modules/user/user.model";



passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email: string, password: string, done) => {
      try {
        const isExistUser = await User.findOne({ email }).select("+password");
        if (!isExistUser) {
          // Changed: First parameter should be null for no error, second is false for no user, third is error message
          return done(null, false, { message: "User does not exist" });
        }

        if (isExistUser && isExistUser.isActive === "INACTIVE") {
          return done(null, false, { message: "User is inactive" });
        }
        if (isExistUser && isExistUser.isActive === "BLOCKED") {
          return done(null, false, { message: "User is blocked" });
        }

        if (isExistUser.isDeleted) {
          return done(null, false, { message: "User is deleted" });
        }

        const isMatchPassword = await bcrypt.compare(
          password as string,
          isExistUser.password as string
        );

        if (!isMatchPassword) {
          return done(null, false, { message: "Incorrect password" });
        }

        return done(null, isExistUser); // This is correct
      } catch (error) {
        // Changed: Pass the actual error as first parameter
        done(error, false);
      }
    }
  )
);

passport.serializeUser((user: any, done: (err: any, id?: unknown) => void) => {
  done(null, user._id);
});

passport.deserializeUser(async (id: string, done: any) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    console.log(error);
    done(error, null); // Added null as second parameter
  }
});