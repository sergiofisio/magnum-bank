import { NextFunction, Request, Response } from "express";
import { ApiError } from "../errors/ApiError";

class CommonMiddleware {
  logger(req: Request, _: Response, next: NextFunction) {
    const url = `${req.protocol}://${req.get("host")}${req.originalUrl}`;

    console.log("--------------------");

    console.log(`[${req.method}] ${url}`);

    next();
  }
  NotFound(req: Request, res: Response) {
    res.status(404).json({
      error: true,
      message: `Rota não encontrada: [${req.method}] ${req.originalUrl}`,
    });
  }

  errorHandler(
    err: Error | ApiError,
    req: Request,
    res: Response,
    _: NextFunction
  ) {
    const status = err instanceof ApiError ? err.status : 500;
    const message =
      err instanceof ApiError ? err.message : "Erro interno no servidor.";

    console.error(
      `🚨 [ERRO] ${status} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
    );
    console.error(err.stack);

    const responseBody: { error: boolean; message: string; stack?: string } = {
      error: true,
      message,
    };

    if (process.env.NODE_ENV !== "production") {
      responseBody.stack = err.stack;
    }

    return res.status(status).json(responseBody);
  }
}

export default new CommonMiddleware();
