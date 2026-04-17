import express from "express";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { app, httpServer } from "./lib/socket.js";
import path from "path";

dotenv.config()
const PORT = process.env.PORT

const __dirname = path.resolve();


app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(cookieParser())
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174", process.env.FRONTEND_URL],
    credentials: true
}))

app.use("/api/auth", authRoutes)
app.use("/api/messages", messageRoutes)

if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname, "..", "frontend", "dist")))

    // SPA fallback for non-API GET requests
    app.get(/^((?!\/api).)*$/, (req, res) => {
        res.sendFile(path.join(__dirname, "..", "frontend", "dist", "index.html"));
    });
}

httpServer.listen(PORT, () => {
    console.log("server is running on port : " + PORT)
    connectDB()
})