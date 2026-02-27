import { requireAuth } from "@clerk/express";
import User from "../models/User.js";

export const protectRoute = [
  // ✅ 1. Allow preflight requests to pass (CRITICAL FOR VERCEL)
  (req, res, next) => {
    if (req.method === "OPTIONS") {
      return next();
    }
    next();
  },

  // ✅ 2. Clerk authentication
  requireAuth(),

  // ✅ 3. Attach MongoDB user to request
  async (req, res, next) => {
    try {
      const clerkId = req.auth().userId;

      if (!clerkId) {
        return res.status(401).json({
          message: "Unauthorized - invalid token",
        });
      }

      const user = await User.findOne({ clerkId });

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      if (user.blocked) {
        return res.status(403).json({
          message:
            "Your account has been blocked due to policy violations",
        });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error("Error in protectRoute middleware:", error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  },
];
