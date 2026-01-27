import app from "./app";
import { config } from "./config";

const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${config.nodeEnv}`);
  console.log(`🔗 API Base: http://localhost:${PORT}`);
});

// Graceful shutdown
const shutdown = () => {
  console.log("\n🛑 Received shutdown signal. Closing server...");
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error("⚠️  Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
