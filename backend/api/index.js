import express from "express";
import cors from "cors";
import { serve } from "inngest/express";
import { clerkMiddleware } from "@clerk/express";

import { ENV } from "../src/lib/env.js";
import { connectDB } from "../src/lib/db.js";
import { inngest, functions } from "../src/lib/inngest.js";

import chatRoutes from "../src/routes/chatRoutes.js";
import sessionRoutes from "../src/routes/sessionRoute.js";
import userRoutes from "../src/routes/user.js";

const app = express();

// Connect DB (top-level for serverless reuse)
await connectDB();

app.use(express.json());
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));
app.use(clerkMiddleware());

app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/chat", chatRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/users", userRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ msg: "api is up and running" });
});

export default app;
