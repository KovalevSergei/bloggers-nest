import { Injectable } from '@nestjs/common';
import { JwtService } from '../application/jwt-service';
import { EmailAdapter } from '../email/email-service';
import { UsersRepository } from '../users/users-repositorySQL';
import { UsersService } from '../users/users-service';
import { UsersDBType } from '../users/users.type';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    protected usersRepository: UsersRepository,
    protected usersService: UsersService,
    protected jwtService: JwtService,
    protected emailAdapter: EmailAdapter,
  ) {}
  async createUser(
    login: string,
    email: string,
    password: string,
  ): Promise<UsersDBType> {
    /*    const passwordSalt = await bcrypt.genSalt(10)
        const passwordHash = await UsersServis._generateHash(password, passwordSalt);
        const user: UsersDBType = {
          id: new Date().toString(),
          accountData: {
            login: login,
            email,
            passwordHash,
            passwordSalt,
            createdAt: new Date(),
          },
          emailConfirmation: {
            confirmationCode: uuidv4(),
            expirationDate: add(new Date(), {
              hours: 1,
              minutes: 3,
            }),
            isConfirmed: false,
          },
        }; */
    const createResult = await this.usersService.createUser(
      login,
      email,
      password,
    );

    if (createResult) {
      this.emailAdapter.sendEmail(
        email,
        'Registration',
        createResult.emailConfirmation.confirmationCode,
      );
    }
    return createResult;
  }
  async confirmEmail(email: string): Promise<boolean> {
    let user = await this.usersRepository.findByEmail(email);

    if (!user) return false;
    const id = user.id;
    const code = uuidv4();
    await this.usersRepository.updateCode(id, code);
    this.emailAdapter.sendEmail(email, 'email', code);

    return true;
  }
  async confirmCode2(code: string): Promise<UsersDBType | boolean> {
    let user = await this.usersRepository.findByConfirmationCode(code);
    if (!user) return false;
    if (user.emailConfirmation.isConfirmed) return false;

    return user;
  }

  async confirmCode(code: string): Promise<boolean> {
    let user = await this.usersRepository.findByConfirmationCode(code);
    if (!user) return false;
    if (user.emailConfirmation.isConfirmed) return false;

    let result = await this.usersRepository.updateConfirmation(user.id); //подтвердить пользователя с таким айди

    return result;
  }
  async refreshTokenSave(token: string): Promise<boolean | string> {
    let refreshToken = await this.usersRepository.refreshTokenSave(token);
    return refreshToken;
  }
  async refreshTokenFind(token: string): Promise<boolean> {
    let refreshTokenFind = await this.usersRepository.refreshTokenFind(token);
    if (refreshTokenFind === null) {
      return false;
    }
    let refreshTokenTimeOut = await this.jwtService.getUserIdByToken(token);

    if (refreshTokenTimeOut === null) {
      return false;
    } else {
      return true;
    }
  }
  async refreshTokenKill(token: string): Promise<boolean> {
    let result = await this.usersRepository.refreshTokenKill(token);
    if (result === false) {
      return false;
    } else {
      return true;
    }
  }
  async findEmail(email: string): Promise<boolean> {
    let result = this.usersRepository.findByEmail(email);
    if (!result) {
      return true;
    }
    return false;
  }

  async findLogin(login: string): Promise<boolean> {
    let result = this.usersRepository.FindUserLogin(login);
    if (!result) {
      return true;
    }
    return false;
  }
}
