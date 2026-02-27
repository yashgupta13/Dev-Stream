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

// ✅ JSON parser
app.use(express.json());

/* =========================
   ✅ PRODUCTION SAFE CORS
   ========================= */

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests without origin (Postman, mobile apps)
    if (!origin) return callback(null, true);

    // Allow local dev
    if (origin === "http://localhost:5173") {
      return callback(null, true);
    }

    // Allow all Vercel preview & production deployments
    if (origin.endsWith(".vercel.app")) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// 🔥 VERY IMPORTANT — Handle preflight
app.options("*", cors(corsOptions));

/* =========================
   ✅ AUTH
   ========================= */

app.use(clerkMiddleware());

/* =========================
   ✅ ROUTES
   ========================= */

app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/chat", chatRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/users", userRoutes);

/* =========================
   ✅ HEALTH CHECK
   ========================= */

app.get("/health", (req, res) => {
  res.status(200).json({ msg: "API is up and running 🚀" });
});

/* =========================
   ✅ EXPORT (NO app.listen)
   ========================= */

export default app;
