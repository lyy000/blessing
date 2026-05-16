import fs from "fs";
import path from "path";

const root = process.cwd();
const standaloneDir = path.join(root, ".next", "standalone");

if (!fs.existsSync(standaloneDir)) {
  console.log("[postbuild] 未检测到 standalone 输出，跳过资源复制。");
  process.exit(0);
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(from, to);
    } else {
      fs.copyFileSync(from, to);
    }
  }
}

const publicSrc = path.join(root, "public");
if (fs.existsSync(publicSrc)) {
  copyDir(publicSrc, path.join(standaloneDir, "public"));
}

const staticSrc = path.join(root, ".next", "static");
if (fs.existsSync(staticSrc)) {
  copyDir(staticSrc, path.join(standaloneDir, ".next", "static"));
}

console.log("[postbuild] standalone 静态资源已就绪。");
