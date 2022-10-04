import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../users-repositorySQL';
import { UsersDBType, UsersDBTypeWithId, usersGetDBType } from '../users.type';
//import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { compareAsc, format, add } from 'date-fns';
import * as bcrypt from 'bcrypt';

@Injectable()
export class DeleteUserUseCase {
  constructor(protected usersRepository: UsersRepository) {}
  async execute(id: string): Promise<boolean> {
    return this.usersRepository.deleteUsersId(id);
  }
}
