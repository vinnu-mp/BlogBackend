import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import postRoutes from "./routes/post.routes.js";
import uploadRoutes from "./routes/upload.routes.js";

const app = express();

// -------- Core Middlewares --------
app.use(
  cors({
    origin: [
      "https://blog-frontend-git-main-vinnumps-projects.vercel.app",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(express.json()); // parse JSON bodies

// -------- Health Check Route --------
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Backend is running fine 🚀",
  });
});

// -------- Placeholder for future routes --------
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/upload", uploadRoutes); // Upload routes
// app.use("/api/comments", commentRoutes);

export default app;
