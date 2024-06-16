import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import userRouter from "./routes/user.route.js"
import orderRouter from "./routes/order.route.js"
import dishRouter from "./routes/dish.route.js"

const app = express();

// app.use(cors({
//     origin: process.env.CORS_ORIGIN,
//     credentials: true
// }))
const allowedOrigins = ['http://localhost:5173']; // Change this to your frontend URL

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json({limit: "16kb"}))

app.use(express.urlencoded({extended: true, limit: "16kb"}))

app.use(express.static("public"))

app.use(cookieParser())

app.use("/api/v1/users", userRouter)

app.use("/api/v1/orders", orderRouter)

app.use("/api/v1/dish", dishRouter)

export default app;