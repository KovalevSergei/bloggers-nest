import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    if (status === 400) {
      const errrosRes = {
        errorsMessage: [],
      };

      const response2: any = exception.getResponse();
      //   response2.message.forEach((m) =>
      //     errrosRes.errorsMessage.push({ message: m.message, field: m.field }),
      //   );

      response.status(status).json(response2);
    } else {
      response.status(status).json(exception.message);
    }
  }
}
