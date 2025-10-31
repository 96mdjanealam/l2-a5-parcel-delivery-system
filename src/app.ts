import session from 'express-session'; // Correct import
import passport from "passport";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, {Application, Request, Response } from "express";
import { envVars } from "./app/config/env.config";
import { router } from "./app/route";
import globalErrorHandler from "./app/middleware/globalErrorHandler";
import notFound from "./app/middleware/notFound";
import "./app/config/passport";
// import expressSession from "express-session";
// import passport from "passport";
// import { envVars } from "./app/config/env";
// import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
// import notFound from "./app/middlewares/notFound";
// import { router } from "./app/routes";

const app: Application = express()
app.use(express.json())
app.use(session({
    secret: envVars.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());
app.set("trust proxy", 1);
app.use(cors({
    origin: [
        "http://localhost:5173",
    ],
    credentials: true
}));

// app.use(expressSession({
//     secret: envVars.EXPRESS_SESSION_SECRET,
//     resave: false,
//     saveUninitialized: false
// }))
// app.use(passport.initialize())
// app.use(passport.session())
// app.set("trust proxy", 1);
// app.use(express.urlencoded({ extended: true }))
// app.use(cors({
//     origin: envVars.FRONTEND_URL,
//     credentials: true
// }))

app.use("/api/v1", router)

app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        message: "Welcome to Parcel Delivery System Backend"
    })
})


app.use(globalErrorHandler)

app.use(notFound)

export default app