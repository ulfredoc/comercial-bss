// src/modules/auth/strategies/google.strategy.ts
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: 'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile'],
      state: true,
      passReqToCallback: true
    });
  }

  async validate(
    request: any,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    this.logger.log('Perfil de Google recibido:', profile);
  
    try {
      const { name, emails, photos } = profile;
      
      if (!emails || emails.length === 0) {
        this.logger.error('No se recibió email de Google');
        throw new Error('No email provided by Google');
      }
  
      const user = {
        email: emails[0].value,
        fullName: name.givenName + ' ' + name.familyName,
        picture: photos?.[0]?.value,
        googleId: profile.id
        // Ya no necesitamos state
      };
  
      this.logger.log('Usuario procesado:', user);
      done(null, user);
    } catch (error) {
      this.logger.error('Error en validate:', error);
      done(error, null);
    }
  }
}