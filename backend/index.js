import express, { urlencoded } from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import dotenv from  "dotenv"
import connectDB from "./src/utils/db.js"
import userRouter from "./src/routes/user.route.js";
import postRouter from  "./src/routes/post.route.js";
import messageRouter  from "./src/routes/message.route.js";



dotenv.config({
    path: "./.env"
})


const app = express();

const PORT = process.env.PORT || 3000;

app.get("/",(req, res) => {
    return res.status(200).json({
        message: "i m coming from backend",
        success: true
    })
})

//middleware
app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({extended:true}));
const corsOption = {
    origin:process.env.CORS_ORIGIN,
    credentials:true
}
app.use(cors(corsOption));


//yha pe apni api aayegi
//"http://localhost:8000/api/v1/user"
app.use("/api/v1/user", userRouter)
app.use("/api/v1/post", postRouter)
app.use("/api/v1/message", messageRouter)

app.listen(PORT, () =>{
    connectDB();
    console.log(`Server is running at port ${PORT}`);
})