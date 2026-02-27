import express from "express";
import cors from "cors";
import { serve } from "inngest/express";
import { clerkMiddleware } from "@clerk/express";

import { connectDB } from "../src/lib/db.js";
import { inngest, functions } from "../src/lib/inngest.js";

import chatRoutes from "../src/routes/chatRoutes.js";
import sessionRoutes from "../src/routes/sessionRoute.js";
import userRoutes from "../src/routes/user.js";

const app = express();

// ✅ Connect DB (serverless-safe)
await connectDB();

// ✅ Middleware
app.use(express.json());

// ✅ CORS configuration (Vercel + Local + Credentials safe)
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);

      // Allow localhost (development)
      if (origin === "http://localhost:5173") {
        return callback(null, true);
      }

      // Allow all Vercel deployments (preview + production)
      if (origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }

      // Otherwise block
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// ✅ Clerk Auth Middleware
app.use(clerkMiddleware());

// ✅ Routes
app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/chat", chatRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/users", userRoutes);

// ✅ Health Check
app.get("/health", (req, res) => {
  res.status(200).json({ msg: "API is up and running 🚀" });
});

// ✅ Export for Vercel (NO app.listen)
export default app;
