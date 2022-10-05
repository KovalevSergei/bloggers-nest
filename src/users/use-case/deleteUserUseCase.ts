import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../users-repositorySQL';
import { UsersDBType, UsersDBTypeWithId, usersGetDBType } from '../users.type';
//import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { compareAsc, format, add } from 'date-fns';
import * as bcrypt from 'bcrypt';
import {
  CommandHandler,
  ICommandHandler,
  ICommandPublisher,
} from '@nestjs/cqrs';
export class DeleteUserCommand {
  constructor(public id: string) {}
}
@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand> {
  constructor(protected usersRepository: UsersRepository) {}
  async execute(command: DeleteUserCommand): Promise<boolean> {
    return this.usersRepository.deleteUsersId(command.id);
  }
}
