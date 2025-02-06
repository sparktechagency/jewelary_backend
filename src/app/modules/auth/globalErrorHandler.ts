import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

interface CustomError {
  statusCode?: number;
  message: string;
  stack?: string;
}

const globalErrorHandler = (
  err: CustomError, 
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  console.error(err.stack);

  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message: message,
    errorMessages: [{ path: req.originalUrl, message: message }],
  });
};

export default globalErrorHandler;
