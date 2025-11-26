// build-scenes.mjs
import fs from "fs/promises";
import path from "path";
import yaml from "js-yaml";

async function expandIncludes(filePath, visited = new Set()) {
  if (visited.has(filePath)) {
    throw new Error(`Include loop detected: ${filePath}`);
  }
  visited.add(filePath);

  let text = await fs.readFile(filePath, "utf8");

  const includeRegex = /!include\s+([^\s]+)/g;
  const matches = [...text.matchAll(includeRegex)];

  for (const match of matches) {
    const includePath = match[1];
    const abs = path.resolve(path.dirname(filePath), includePath);
    const included = await expandIncludes(abs, visited);
    text = text.replace(match[0], included);
  }
  return text;
}

async function buildAllScenes() {
  const scenesDir = "./src/scenes";
  const outDir = "./public/scenes/compiled";

  const files = await fs.readdir(scenesDir);

  await fs.mkdir(outDir, { recursive: true });

  for (const file of files) {
    if (!file.endsWith(".yaml")) continue;

    const source = path.join(scenesDir, file);
    const expanded = await expandIncludes(source);

    const outFile = `${file.replace(".yaml", ".compiled.yaml")}`;
    await fs.writeFile(path.join(outDir, outFile), expanded, "utf8");

    console.log(`✔ Compiled ${file} → ${outFile}`);
  }
}

buildAllScenes();
