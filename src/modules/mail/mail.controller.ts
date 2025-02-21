import { Body, Controller, Post } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}
  @Post('test')
  async testEmail(@Body('email') email: string) {
    return await this.mailService.sendTestEmail(email);
  }
}
