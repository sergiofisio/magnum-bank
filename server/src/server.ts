import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import CommonMiddleware from "./middlewares/common.middleware";
import helmet from "helmet";
import os from "os";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { mainRoutes } from "./routes";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.replace(/\/$/, "") || "*",
  })
);
app.use(helmet());
app.use(compression());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

app.use(express.json());

app.use(CommonMiddleware.logger);

app.get(["", "/", "/init"], (_: Request, res: Response) => {
  res.json({ status: true, message: "API Iniciada" });
});

app.use("/api", mainRoutes);

app.use(CommonMiddleware.NotFound);
app.use(CommonMiddleware.errorHandler);

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    const networkInterface = interfaces[name];

    if (networkInterface) {
      for (const iface of networkInterface) {
        if (iface.family === "IPv4" && !iface.internal) {
          return iface.address;
        }
      }
    }
  }
  return "localhost";
}

const PORT = process.env.PORT;

const server = app.listen(PORT, () => {
  const ip = getLocalIP();
  const serverUrl = process.env.SERVER_BASE_URL;
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  if (ip !== "localhost") {
    console.log(`🌐 Acesso na rede:  http://${ip}:${PORT}`);
  }
  if (serverUrl) {
    console.log(`🌍 URL configurada: ${serverUrl}${PORT}`);
  }
});

const signals = ["SIGTERM", "SIGINT"];

function gracefulShutdown(signal: string) {
  process.on(signal, async () => {
    console.log(`\n🚨 Recebido sinal ${signal}, desligando...`);
    server.close(() => {
      console.log("✅ Conexões HTTP fechadas.");
      process.exit(0);
    });
  });
}

signals.forEach(gracefulShutdown);
