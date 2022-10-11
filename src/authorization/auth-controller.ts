import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  Inject,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsEmail, IsNotEmpty, Length } from 'class-validator';
import { JwtService } from '../application/jwt-service';
import { UsersService } from '../users/users-service';
import { AuthService } from './auth-service';
import { Request } from 'express';
import { Response } from 'express';
import { Auth } from '../guards/Auth';
import { Mistake429 } from '../guards/Mistake429';
import { UsersDBType } from '../users/users.type';
import { MailFindDoublicate } from '../guards/mailFindDoublicate';
import { LoginFindDoublicate } from '../guards/loginFindDoublicate';
import { CreateUserCommand } from '../users/use-case/createUserUseCase';
import { CommandBus } from '@nestjs/cqrs';
import { UsersRepositoryQuery } from '../users/users-repositoryMongoQuery';
import { ChechCredentialCommand } from '../users/use-case/checkCredentialsCommand';
import { ConfirmEmailCommand } from './use-case/confirmEmailCommand';
import { ConfirmCodeCommand } from './use-case/confirmCode2Command';
import { RefreshTokenFindCommand } from './use-case/refreshTokenFinCommand';
import { RefreshTokenKillCommand } from './use-case/refreshTokenKillCommand';
import { InjectConnection } from '@nestjs/mongoose';
import { IRepositoryUsersQuery } from '../users/usersRepository.interface';
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
class Email {
  @IsEmail()
  email: string;
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
    @Inject('UsersRepositoryQuery')
    protected usersRepositoryQuery: IRepositoryUsersQuery,
    private commandBus: CommandBus,
  ) {}
  @UseGuards(Mistake429)
  @Post('login')
  @HttpCode(200)
  async loginPost(
    @Body() body: AuthBody,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.usersRepositoryQuery.FindUserLogin(body.login);

    if (!user) {
      throw new UnauthorizedException();
    }
    // req.ip or req.headers['x-forwarder-for'] or req.connection.remoteAddress

    const areCredentialsCorrect = await this.commandBus.execute(
      new ChechCredentialCommand(body.login, body.password),
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
    const user = await this.commandBus.execute(
      new CreateUserCommand(body.login, body.email, body.password),
    );

    return user;
  }
  @UseGuards(Mistake429)
  @Post('registration-email-resending')
  @HttpCode(204)
  async registrationEmailResending(@Body() body: Email) {
    const result = await this.commandBus.execute(
      new ConfirmEmailCommand(body.email),
    );
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
    const codeReturn = await this.commandBus.execute(
      new ConfirmCodeCommand(body.code),
    );
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

    const result = await this.commandBus.execute(
      new ConfirmCodeCommand(body.code),
    );
    return;
  }
  @Post('refresh-token')
  @HttpCode(200)
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
    const findToken = await this.commandBus.execute(
      new RefreshTokenFindCommand(refreshToken),
    );

    if (findToken === false) {
      throw new UnauthorizedException();
    }
    await this.commandBus.execute(new RefreshTokenKillCommand(refreshToken));
    const userId = await this.jwtService.getUserIdByToken(refreshToken);
    const user = await this.usersRepositoryQuery.findUserById(userId);
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
  @HttpCode(204)
  async logout(@Req() req: Request) {
    const refreshToken = req.cookies?.refreshToken;
    const tokenExpire = await this.jwtService.getUserIdByToken(refreshToken);
    if (tokenExpire === null) {
      throw new UnauthorizedException();
    }
    return;
  }
  @UseGuards(Auth)
  @Get('me')
  async me(@Req() req: Request) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException();
    } else {
      const userId = await this.jwtService.getUserIdByToken(token);
      const user = await this.usersRepositoryQuery.findUserById(userId);

      const result = {
        email: user?.accountData.email,
        login: user?.accountData.login,
        userId: user?.id,
      };
      return result;
    }
  }
}
