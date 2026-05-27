import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const dist = join(root, "dist");

await rm(dist, { recursive: true, force: true });
await mkdir(join(dist, "data"), { recursive: true });

for (const file of ["index.html", "styles.css", "app.js"]) {
  await cp(join(root, file), join(dist, file));
}

await cp(join(root, "data", "market.json"), join(dist, "data", "market.json"));
await cp(join(root, "data", "market-data.js"), join(dist, "data", "market-data.js"));
await writeFile(join(dist, ".nojekyll"), "", "utf8");

console.log(`Built static site in ${dist}`);
