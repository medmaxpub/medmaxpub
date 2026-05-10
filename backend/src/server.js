import dotenv from "dotenv";
import app from "./app.js";
import { connectDatabase } from "./config/db.js";
import { bootstrapAdmin, seedSampleContent } from "./seed/bootstrap.js";
import { ensureUploadsDirectory } from "./utils/assetStorage.js";

dotenv.config();

const port = process.env.PORT || 5000;

async function startServer() {
  await ensureUploadsDirectory();
  await connectDatabase();
  await bootstrapAdmin();
  await seedSampleContent();

  app.listen(port, () => {
    console.log(`medmaxpub API running on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
