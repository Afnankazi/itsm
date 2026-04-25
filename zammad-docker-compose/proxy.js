// Zammad CORS Proxy — run with: node proxy.js
// Then use http://localhost:3001 as your Zammad URL in the agent

const http = require("http");
const https = require("https");

const ZAMMAD_TARGET = "http://localhost:8080"; // your actual Zammad URL

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const target = new URL(ZAMMAD_TARGET);
  const options = {
    hostname: target.hostname,
    port: target.port || (target.protocol === "https:" ? 443 : 80),
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: target.host },
  };

  const lib = target.protocol === "https:" ? https : http;
  const proxy = lib.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, {
      ...proxyRes.headers,
      "Access-Control-Allow-Origin": "*",
    });
    proxyRes.pipe(res);
  });

  proxy.on("error", (e) => {
    console.error("Proxy error:", e.message);
    res.writeHead(502);
    res.end(JSON.stringify({ error: e.message }));
  });

  req.pipe(proxy);
});

server.listen(3001, () => {
  console.log("Zammad CORS proxy running at http://localhost:3001");
  console.log("Use http://localhost:3001 as the URL in the AI agent");
});