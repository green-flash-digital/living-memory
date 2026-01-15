#!/usr/bin/env tsx
// Generate client-safe worker-configuration types by copying and removing mainModule
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const sourcePath = join(process.cwd(), "worker-configuration.d.ts");
const destPath = join(process.cwd(), "worker-configuration.client.d.ts");

const content = readFileSync(sourcePath, "utf-8");

// Remove the mainModule line that imports server
// This allows client builds to use the auto-generated types without importing server.ts
const fixed = content.replace(
  /mainModule:\s*typeof\s+import\(["']\.\/src\/server["']\);/g,
  "mainModule?: any; // Removed for client builds"
);

writeFileSync(destPath, fixed, "utf-8");
console.log(
  "✓ Generated worker-configuration-client.d.ts (removed server import)"
);
