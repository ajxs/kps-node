import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { taskRoutes } from "./routes/taskRoutes";
import { AppError, errorHandler } from "./middleware/errorHandler";

const app = express();
const PORT = process.env.PORT || 3000;

const rateLimiter = rateLimit({
  limit: 100,
  // Refers to the IETF proposed rate limit standard headers.
  // See: https://datatracker.ietf.org/doc/html/draft-ietf-httpapi-ratelimit-headers
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: (req: Request, res: Response, next: NextFunction) => {
    console.error(`Rate limit exceeded for IP: ${req.ip}`, {
      path: req.path,
      body: req.body,
      ip: req.ip,
    });

    next(
      new AppError(
        "Too many requests, please try again later.",
        "ApiRateLimitExceeded",
        429
      )
    );
  },
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting middleware applied to all API requests.
app.use(rateLimiter);

// Routes
app.use("/api", taskRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Error handling middleware (should be last)
app.use(errorHandler);

// Start server (only if not in test environment)
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📋 Task Manager API ready!`);
  });
}

export { app };
