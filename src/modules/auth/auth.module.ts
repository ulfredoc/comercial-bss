// src/modules/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from './entities/user.entity';
import { MailModule } from '../mail/mail.module';
import { GoogleStrategy } from './strategies/google.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),  // Esto es lo importante, registra la entidad User
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { 
          expiresIn: '1h' 
        },
      }),
      inject: [ConfigService],
    }),
    MailModule,  // Agregar MailModule a los imports
    ConfigModule
  ],
  controllers: [AuthController],
  providers: [AuthService,
    GoogleStrategy, // Agregamos la estrategia de Google
  ],
  exports: [AuthService]
})
export class AuthModule {}