// src/modules/mail/mail.service.ts
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { SendMailDto } from './dto/send-mail.dto';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserConfirmation(user: User, verificationCode: string) {
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Bienvenido a Smart Buffet! Confirma tu Email',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>¡Bienvenido ${user.fullName}!</h2>
          <p>Gracias por registrarte. Para completar tu registro, ingresa el siguiente código:</p>
          <div style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 24px; margin: 20px 0;">
            <strong>${verificationCode}</strong>
          </div>
          <p>Si no creaste esta cuenta, puedes ignorar este correo.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">Este es un correo automático, por favor no respondas a este mensaje.</p>
        </div>
      `,
    });
  }

  async sendTestEmail(email: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Prueba de Correo - Smart Buffet Food',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>¡Prueba de configuración exitosa!</h2>
            <p>Este es un correo de prueba del sistema de Smart Buffet Food.</p>
            <p>Fecha y hora de la prueba: ${new Date().toLocaleString()}</p>
            <hr>
            <p style="color: #666; font-size: 12px;">Este es un correo de prueba, por favor no respondas a este mensaje.</p>
          </div>
        `,
      });
      return {
        success: true,
        message: 'Correo de prueba enviado exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al enviar el correo',
        error: error.message
      };
    }
  }

  async sendPasswordReset(user: User, code: string) {
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Recuperação de Senha - Smart Buffet',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Olá ${user.fullName}!</h2>
          <p>Recebemos uma solicitação para redefinir sua senha.</p>
          <p>Seu código de recuperação é:</p>
          <div style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 24px; margin: 20px 0;">
            <strong>${code}</strong>
          </div>
          <p>Se você não solicitou esta recuperação, ignore este email.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">Este é um email automático, por favor não responda.</p>
        </div>
      `,
    });
  }
  async sendCustomEmail(mailDto: SendMailDto) {
    await this.mailerService.sendMail({
      to: mailDto.to,
      subject: mailDto.subject,
      template: mailDto.template,
      context: mailDto.context,
      html: mailDto.html,
    });
  }
  async sendGoogleWelcome(user: User) {
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Bem-vindo ao Smart Buffet!',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Bem-vindo ao Smart Buffet, ${user.fullName}!</h2>
          <p>Sua conta foi criada com sucesso através do Google.</p>
          <p>Você já pode acessar nossa plataforma usando seu email do Google: ${user.email}</p>
          <div style="margin: 20px 0;">
            <p>Alguns próximos passos que você pode fazer:</p>
            <ul>
              <li>Complete seu perfil adicionando seu CPF e telefone</li>
              <li>Explore nossos serviços</li>
              <li>Configure suas preferências</li>
            </ul>
          </div>
          <p>Se tiver alguma dúvida, não hesite em nos contatar.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">Este é um email automático, por favor não responda.</p>
        </div>
      `,
    });
  }
}