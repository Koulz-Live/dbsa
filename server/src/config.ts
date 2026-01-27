import dotenv from "dotenv";
dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  supabase: {
    url: string;
    serviceRoleKey: string;
    jwtSecret: string;
  };
  resend: {
    apiKey: string;
  };
}

export const config: Config = {
  port: parseInt(process.env.PORT || "3001", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  supabase: {
    url: process.env.SUPABASE_URL || "",
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    jwtSecret: process.env.SUPABASE_JWT_SECRET || "",
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY || "",
  },
};

// Validate required config
const requiredEnvVars = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_JWT_SECRET",
];

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.warn(
    `⚠️  Missing environment variables: ${missingEnvVars.join(", ")}`,
  );
}
