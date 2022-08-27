import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EmailAdapter } from './email-service';

class EmailClass {
  email: string;
  subject: string;
  message: string;
}

@Controller('email')
export class EmailController {
  constructor(protected emailAdapter: EmailAdapter) {}
  async postMessage(@Body() body: EmailClass) {
    //await this.emailAdapter.sendEmail(body.email, body.subject, body.message);
    return;
  }
}
