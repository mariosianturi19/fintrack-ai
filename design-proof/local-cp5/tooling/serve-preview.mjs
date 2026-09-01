import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const TOOLING_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(TOOLING_DIR, "..");
const HOST = "127.0.0.1";
const PORT = Number.parseInt(process.env.FINTRACK_CP5_PORT ?? "4175", 10);

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
};

const server = http.createServer((request, response) => {
  const rawPath = new URL(request.url ?? "/", `http://${HOST}:${PORT}`).pathname;
  const decodedPath = decodeURIComponent(rawPath);
  const requestedPath =
    decodedPath === "/"
      ? "/preview/index.html"
      : decodedPath.endsWith("/")
        ? `${decodedPath}index.html`
        : decodedPath;
  const absolutePath = path.resolve(ROOT, `.${requestedPath}`);
  const relativePath = path.relative(ROOT, absolutePath);
  const contained =
    relativePath !== "" &&
    relativePath !== ".." &&
    !relativePath.startsWith(`..${path.sep}`) &&
    !path.isAbsolute(relativePath);

  if (!contained) {
    response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Forbidden");
    return;
  }

  fs.stat(absolutePath, (statError, stat) => {
    if (statError || !stat.isFile()) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    const extension = path.extname(absolutePath).toLowerCase();
    response.writeHead(200, {
      "Cache-Control": "no-store",
      "Content-Type": contentTypes[extension] ?? "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
    });
    fs.createReadStream(absolutePath).pipe(response);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Fintrack AI CP5 preview: http://${HOST}:${PORT}/preview/`);
});

function shutdown() {
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
