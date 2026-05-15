import dotenv from "dotenv";
import app from "./app.js";
import { connectDatabase } from "./config/db.js";
import { bootstrapAdmin, seedSampleContent } from "./seed/bootstrap.js";
import { ensureUploadsDirectory } from "./utils/assetStorage.js";

dotenv.config();

const port = process.env.PORT || 5000;
const host = process.env.HOST || "0.0.0.0";

async function startServer() {
  await ensureUploadsDirectory();
  await connectDatabase();
  await bootstrapAdmin();

  if (process.env.ENABLE_SAMPLE_CONTENT === "true") {
    await seedSampleContent();
  }

  app.listen(port, host, () => {
    console.log(`medmaxpub API running on ${host}:${port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
