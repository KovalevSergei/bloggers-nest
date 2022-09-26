import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsEmail, IsNotEmpty, Length } from 'class-validator';
import { response } from 'express';
import { send } from 'process';
import { JwtService } from '../application/jwt-service';
import { UsersService } from '../users/users-service';
import { AuthService } from './auth-service';
import { Request } from 'express';
import { Response } from 'express';
import { Auth } from '../guards/Auth';
import { Mistake429 } from '../guards/Mistake429';
import { UsersDBType } from '../users/users.type';
import { truncate } from 'fs';
import { MailFindDoublicate } from '../guards/mailFindDoublicate';
import { LoginFindDoublicate } from '../guards/loginFindDoublicate';
class AuthBody {
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(3, 10)
  login: string;
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(6, 20)
  password: string;
}
class CreateUser {
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(3, 10)
  login: string;
  @IsEmail()
  email: string;
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(6, 20)
  password: string;
}
class CreateUserCode {
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  code: string;
}
@Controller('auth')
export class AuthController {
  constructor(
    protected authService: AuthService,
    protected usersServis: UsersService,
    protected jwtService: JwtService,
  ) {}
  @UseGuards(Mistake429)
  @Post('login')
  @HttpCode(200)
  async loginPost(
    @Body() body: AuthBody,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.usersServis.getUserByLogin(body.login);

    if (!user) {
      throw new UnauthorizedException();
    }
    // req.ip or req.headers['x-forwarder-for'] or req.connection.remoteAddress

    const areCredentialsCorrect = await this.usersServis.checkCredentials(
      user,
      body.login,
      body.password,
    );
    if (!areCredentialsCorrect) {
      throw new UnauthorizedException();
    }
    const token = await this.jwtService.createJWT(user);
    const refreshToken = await this.jwtService.createJWTrefresh(user);

    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: 20 * 1000,
    });

    return { accessToken: token };
  }
  @UseGuards(Mistake429)
  @UseGuards(MailFindDoublicate)
  @UseGuards(LoginFindDoublicate)
  @Post('registration')
  @HttpCode(204)
  async createUser(@Body() body: CreateUser) {
    const user = await this.authService.createUser(
      body.login,
      body.email,
      body.password,
    );

    return user;
  }
  @UseGuards(Mistake429)
  @Post('registration-email-resending')
  @HttpCode(204)
  async registrationEmailResending(@Body() body: CreateUser) {
    const result = await this.authService.confirmEmail(body.email);
    if (result) {
      return;
    } else {
      throw new BadRequestException({
        errorsMessages: [
          {
            message: 'string',
            field: 'string',
          },
        ],
      });
    }
  }
  @UseGuards(Mistake429)
  @Post('registration-confirmation')
  @HttpCode(204)
  async confirmCode(@Body() body: CreateUserCode) {
    const codeReturn = await this.authService.confirmCode2(body.code);
    if (!codeReturn) {
      throw new HttpException(
        {
          errorsMessages: [
            {
              message: 'string',
              field: 'code',
            },
          ],
        },
        400,
      );
    }
    const r = codeReturn as UsersDBType;
    if (r.emailConfirmation.isConfirmed) {
      throw new HttpException(
        {
          errorsMessages: [
            {
              message: 'user is confirmed',
              field: 'code',
            },
          ],
        },
        400,
      );
    }

    const result = await this.authService.confirmCode(body.code);
    return;
  }
  @Post('refresh-token')
  async refreshToken(
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException();
    }
    const tokenExpire = await this.jwtService.getUserIdByToken(refreshToken);
    if (tokenExpire === null) {
      throw new UnauthorizedException();
    }
    const findToken = await this.authService.refreshTokenFind(refreshToken);

    if (findToken === false) {
      throw new UnauthorizedException();
    }
    await this.authService.refreshTokenKill(refreshToken);
    const userId = await this.jwtService.getUserIdByToken(refreshToken);
    const user = await this.usersServis.findUserById(userId);
    if (!user) {
      throw new UnauthorizedException();
    }
    const token = await this.jwtService.createJWT(user);
    const RefreshToken = await this.jwtService.createJWTrefresh(user);

    res.cookie('refreshToken', RefreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: 20 * 1000,
    });
    return { accessToken: token };
  }
  @Post('logout')
  async logout(@Req() req: Request) {
    const refreshToken = req.cookies?.refreshToken;
    const tokenExpire = await this.jwtService.getUserIdByToken(refreshToken);
    if (tokenExpire === null) {
      throw new UnauthorizedException();
    }
  }
  @UseGuards(Auth)
  @Get('me')
  async me(@Req() req: Request) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException();
    } else {
      const userId = await this.jwtService.getUserIdByToken(token);
      const user = await this.usersServis.findUserById(userId);

      const result = {
        email: user?.accountData.email,
        login: user?.accountData.login,
        userId: user?.id,
      };
      return result;
    }
  }
}
