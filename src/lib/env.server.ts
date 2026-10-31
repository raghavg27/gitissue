import "server-only";
import { required } from "./env";

// Secrets. The server-only import makes the build fail if client code imports this file.
export const serverEnv = {
  get serviceRoleKey() {
    return required("SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY);
  },
  get tokenEncryptionKey() {
    return required("TOKEN_ENCRYPTION_KEY", process.env.TOKEN_ENCRYPTION_KEY);
  },
  // The AI keys are each optional, but at least one must be set for drafting to work.
  groqKey: () => process.env.GROQ_API_KEY,
  groqModel: () => process.env.GROQ_MODEL || "qwen/qwen3.8-27b",
  geminiKey: () => process.env.GEMINI_API_KEY,
  geminiModel: () => process.env.GEMINI_MODEL || "gemini-3.8-flash",
};
