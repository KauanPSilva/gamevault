import { AppError } from '../../../../errors/app.error.js';

export class GatewayError extends AppError {
  constructor(
    message: string,
    statusCode = 502,
    code = 'GATEWAY_ERROR'
  ) {
    super(message, statusCode, code);

    this.name = 'GatewayError';
  }
}