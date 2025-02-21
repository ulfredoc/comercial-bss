// src/modules/mail/dto/send-mail.dto.ts
export class SendMailDto {
    to: string;
    subject: string;
    template?: string;
    context?: any;
    html?: string;
  }