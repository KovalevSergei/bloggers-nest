import { ConfigModule } from '@nestjs/config';

export const configForSwitch = ConfigModule.forRoot({
  envFilePath: '.env',
  isGlobal: true,
});
