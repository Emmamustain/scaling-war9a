/**
 * Global teardown — runs after all tests complete.
 * Cleans up test data if possible; tolerates failures gracefully.
 */
import fs from "fs";
import path from "path";

async function globalTeardown() {
  const idsPath = path.resolve(__dirname, "../.auth/test-ids.json");
  if (!fs.existsSync(idsPath)) return;

  // For now, we rely on ephemeral test databases or manual cleanup.
  // If the app exposes a cleanup endpoint, it would be called here.
  console.log("  E2E teardown: test data left in place (clean manually or use ephemeral DB)");
}

export default globalTeardown;
