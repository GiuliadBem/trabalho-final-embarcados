const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");

const app = express();
app.use(cors());

// Proxy para o controle-svc
app.use(
  "/controle",
  createProxyMiddleware({
    target: "http://localhost:5002",
    changeOrigin: true,
    pathRewrite: { "^/controle": "" },
  })
);

// Proxy para o logging-svc
app.use(
  "/logging",
  createProxyMiddleware({
    target: "http://localhost:5003",
    changeOrigin: true,
    pathRewrite: { "^/logging": "" },
  })
);

const PORT = 5001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`API Gateway rodando na porta ${PORT}`);
});
