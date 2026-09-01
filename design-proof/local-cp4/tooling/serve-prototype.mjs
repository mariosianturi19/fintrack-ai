import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const toolingDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(toolingDir, "..", "..", "..");
const host = "127.0.0.1";
const port = 4174;

const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ttf": "font/ttf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(
    new URL(request.url ?? "/", `http://${host}:${port}`).pathname,
  );
  const relative = pathname === "/" ? "design-proof/local-cp4/prototype/index.html" : pathname.slice(1);
  const requestedPath = path.resolve(projectRoot, relative);
  const allowed =
    requestedPath === projectRoot ||
    requestedPath.startsWith(`${projectRoot}${path.sep}`);

  if (!allowed) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.stat(requestedPath, (statError, stat) => {
    const finalPath =
      !statError && stat.isDirectory()
        ? path.join(requestedPath, "index.html")
        : requestedPath;
    fs.readFile(finalPath, (readError, data) => {
      if (readError) {
        response.writeHead(404);
        response.end("Not found");
        return;
      }
      response.writeHead(200, {
        "Content-Type":
          types[path.extname(finalPath).toLowerCase()] ??
          "application/octet-stream",
        "Cache-Control": "no-store",
      });
      response.end(data);
    });
  });
});

server.listen(port, host, () => {
  console.log(`Fintrack AI CP4 prototype: http://${host}:${port}/design-proof/local-cp4/prototype/`);
});
