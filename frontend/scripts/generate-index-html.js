import * as fs from "fs";
import * as path from "path";

const clientAssetsDir = path.resolve(process.cwd(), "dist/client/assets");
if (!fs.existsSync(clientAssetsDir)) {
  console.error("Client assets directory not found. Build the project first.");
  process.exit(1);
}

const files = fs.readdirSync(clientAssetsDir);
const jsFile = files.find(f => f.startsWith("index-") && f.endsWith(".js"));
const cssFile = files.find(f => f.startsWith("styles-") && f.endsWith(".css"));

if (!jsFile || !cssFile) {
  console.error("Could not find index.js or styles.css bundle.");
  process.exit(1);
}

console.log("Found client bundle JS:", jsFile);
console.log("Found client bundle CSS:", cssFile);

const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assera - ERP Asset Management</title>
  <link rel="icon" href="/Fevicon.png" type="image/png">
  <link rel="stylesheet" href="/assets/${cssFile}">
</head>
<body class="dark bg-background text-foreground">
  <div id="app"></div>
  <script type="module" src="/assets/${jsFile}"></script>
</body>
</html>`;

const indexPath = path.resolve(process.cwd(), "dist/client/index.html");
fs.writeFileSync(indexPath, htmlTemplate, "utf-8");
console.log("Successfully generated dist/client/index.html!");
process.exit(0);
