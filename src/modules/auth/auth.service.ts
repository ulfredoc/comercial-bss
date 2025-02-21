// src/modules/auth/auth.service.ts
import { Injectable, ConflictException , Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { MailService } from '../mail/mail.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtService } from '@nestjs/jwt';
import { PreRegisterGoogleDto } from './dto/pre-register-google.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService  // Inyectar ConfigService

  ) {}

    // Genera un CPF aleatorio con formato correcto
    private async generateUniqueCpf(): Promise<string> {
      let attempts = 0;
      const maxAttempts = 10;
      
      while (attempts < maxAttempts) {
        // Genera un CPF aleatorio (formato brasileño: XXX.XXX.XXX-XX)
        const cpf = 
          `${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}` +
          `${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}` +
          `${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}` +
          `${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`;
        
        // Verifica si ya existe
        const existingUser = await this.userRepository.findOne({
          where: { cpf }
        });
        
        if (!existingUser) {
          return cpf;
        }
        
        attempts++;
      }
      
      throw new ConflictException('No se pudo generar un CPF único después de varios intentos');
    }
    
    // Genera un número de teléfono aleatorio único
    private async generateUniquePhone(): Promise<string> {
      let attempts = 0;
      const maxAttempts = 10;
      
      while (attempts < maxAttempts) {
        // Generar teléfono aleatorio (formato +55XXXXXXXXXX)
        const phone = `+55${Math.floor(10000000000 + Math.random() * 90000000000)}`;
        
        // Verificar si ya existe
        const existingUser = await this.userRepository.findOne({
          where: { phone }
        });
        
        if (!existingUser) {
          return phone;
        }
        
        attempts++;
      }
      
      throw new ConflictException('No se pudo generar un teléfono único después de varios intentos');
    }
  async register(registerDto: RegisterDto) {
    // Verificar email único
    const existingEmail = await this.findByEmail(registerDto.email);
    if (existingEmail) {
      throw new ConflictException('Email já cadastrado');
    }

    // Verificar CPF único
    const existingCPF = await this.userRepository.findOne({
      where: { cpf: registerDto.cpf }
    });
    if (existingCPF) {
      throw new ConflictException('CPF já cadastrado');
    }

    // Generar código de verificación
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Crear usuario con los campos adicionales
    const user = this.userRepository.create({
      ...registerDto,
      username: registerDto.username || registerDto.fullName.split(' ')[0],
      verificationCode,
      isVerified: false,
      isActive: false
    });

    // Guardar usuario
    await this.userRepository.save(user);

    // Enviar código de verificación
    await this.mailService.sendUserConfirmation(user, verificationCode);

    return {
      success: true,
      message: 'Por favor, verifique seu email para ativar sua conta',
      email: user.email
    };
  }

  async login(loginDto: LoginDto) {
    // Buscar usuario por email
    const user = await this.findByEmail(loginDto.email);
    
    if (!user) {
      return null;
    }

    // Verificar si el usuario está verificado
    if (!user.isVerified) {
      throw new ConflictException('Por favor, verifique seu email antes de fazer login');
    }

    // Por ahora solo retornamos el usuario, más adelante añadiremos
    // validación de password y generación de token
    return user;
  }

  async findByEmail(email: string) {
    return await this.userRepository.findOne({ where: { email } });
  }

  async verifyCode(email: string, code: string) {
    const user = await this.userRepository.findOne({
      where: { 
        email,
        verificationCode: code
      }
    });

    if (!user) {
      throw new ConflictException('Código de verificação inválido');
    }

    // Actualizar estado del usuario
    user.isVerified = true;
    user.isActive = true;
    user.verificationCode = null;
    
    await this.userRepository.save(user);

    return {
      success: true,
      message: 'Conta ativada com sucesso'
    };
  }

  async forgotPassword(email: string) {
    const user = await this.findByEmail(email);

    if (!user) {
      throw new ConflictException('Email não encontrado');
    }

    // Generar código de recuperación
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = resetCode;
    await this.userRepository.save(user);

    // Enviar email con código
    await this.mailService.sendPasswordReset(user, resetCode);

    return {
      success: true,
      message: 'Enviamos um código de recuperação para seu email'
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.userRepository.findOne({
      where: {
        email: resetPasswordDto.email,
        verificationCode: resetPasswordDto.code
      }
    });

    if (!user) {
      throw new ConflictException('Código inválido');
    }

    // Actualizar contraseña
    user.password = resetPasswordDto.newPassword;
    user.verificationCode = '';
    await this.userRepository.save(user);

    return {
      success: true,
      message: 'Senha atualizada com sucesso'
    };
  }

  async googleLogin(req) {
    this.logger.log('Iniciando login con Google');

    if (!req.user) {
      this.logger.error('No se recibieron datos de usuario de Google');
      return {
        success: false,
        message: 'No se encontró usuario de Google'
      };
    }

    this.logger.log(`Intentando login con email: ${req.user.email}`);
    let user = await this.findByEmail(req.user.email);

    if (!user) {
      this.logger.log(`Creando nuevo usuario para: ${req.user.email}`);
      
      // Generar una contraseña aleatoria segura
      const temporaryPassword = Math.random().toString(36).slice(-8);
      const uniqueCpf = await this.generateUniqueCpf();
      const uniquePhone = await this.generateUniquePhone();
   
      
      user = this.userRepository.create({
        email: req.user.email,
        fullName: req.user.fullName,
        isVerified: true,
        isActive: true,
        username: req.user.email.split('@')[0],
        cpf: uniqueCpf,  // Campo requerido para completar después
        phone: uniquePhone, // Campo requerido para completar después
        password: temporaryPassword,
        // Guardamos información adicional
        lastLogin: new Date(),
      });

      try {
        await this.userRepository.save(user);
        this.logger.log(`Usuario creado exitosamente: ${user.email}`);
        
        // Opcional: Enviar email de bienvenida con instrucciones para completar perfil
        await this.mailService.sendUserConfirmation(user, 'Bienvenido a Smart Buffet');
      } catch (error) {
        this.logger.error(`Error al crear usuario de Google: ${error.message}`);
        throw new ConflictException('Error al crear usuario');
      }
    } else {
      this.logger.log(`Usuario existente encontrado: ${user.email}`);
      // Actualizar última conexión
      user.lastLogin = new Date();
      await this.userRepository.save(user);
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        username: user.username,
        isVerified: user.isVerified,
        isActive: user.isActive,
        // No devolvemos campos sensibles como password
      }
    };
  }

  // Añadir este método al AuthService existente
 // Modificar el método existente de validateGoogleUser
 async validateGoogleUser(googleProfile: any) {
  this.logger.log('Iniciando validateGoogleUser');
  this.logger.log('Google Profile:', googleProfile);

  try {
    // Verificar estructura del perfil y extraer email
    let email = '';
    if (googleProfile.emails && googleProfile.emails.length > 0) {
      email = googleProfile.emails[0].value;
    } else if (googleProfile.email) {
      email = googleProfile.email;
    }

    // Validar que tenemos email
    if (!email) {
      this.logger.error('No se recibió email en el perfil de Google');
      throw new Error('Email not provided in Google profile');
    }

    // Extraer nombre completo
    let fullName = '';
    if (googleProfile.name) {
      fullName = `${googleProfile.name.givenName || ''} ${googleProfile.name.familyName || ''}`.trim();
    } else if (googleProfile.fullName) {
      fullName = googleProfile.fullName;
    }

    // Extraer foto de perfil
    let picture = '';
    if (googleProfile.photos && googleProfile.photos.length > 0) {
      picture = googleProfile.photos[0].value;
    } else if (googleProfile.picture) {
      picture = googleProfile.picture;
    }

    // Extraer GoogleId
    const googleId = googleProfile.id || '';

    // Buscar usuario existente
    let user = await this.userRepository.findOne({
      where: { email }
    });

    if (user) {
      this.logger.log('Usuario existente encontrado:', user.email);
      
      user = await this.userRepository.save({
        ...user,
        lastLogin: new Date(),
        picture: picture || user.picture,
        isGoogleUser: true,
        googleId: user.googleId || googleId
      });
      
      this.logger.log('Usuario actualizado con éxito:', user.email);
    } else {
      this.logger.log('Creando nuevo usuario para:', email);
      
      // Generar username desde email
      const username = email.split('@')[0];
      
      user = await this.userRepository.save({
        email,
        fullName,
        username,
        picture,
        googleId,
        cpf: '', // Inicialmente vacío
        phone: '', // Inicialmente vacío
        isGoogleUser: true,
        isVerified: true,
        isActive: true,
        lastLogin: new Date(),
        password: '' // O generar una contraseña aleatoria si es necesario
      });

      this.logger.log('Nuevo usuario creado con éxito:', user.email);
      await this.mailService.sendGoogleWelcome(user);
    }

    // Generar token JWT
    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      isGoogleUser: true
    });

    // Retornar respuesta completa
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        username: user.username,
        picture: user.picture,
        cpf: user.cpf,
        phone: user.phone
      },
      accessToken
    };

  } catch (error) {
    this.logger.error('Error en validateGoogleUser:', error);
    throw error;
  }
}
 // Nuevo método para pre-registro
 async preRegisterGoogle(preRegisterDto: PreRegisterGoogleDto) {
  this.logger.log('Pre-registro Google iniciado:', preRegisterDto);

  try {
    const stateData = {
      cpf: preRegisterDto.cpf,
      phone: preRegisterDto.phone
    };

    const stateToken = this.jwtService.sign(stateData, {
      expiresIn: '5m',
      secret: this.configService.get('JWT_SECRET')
    });

    this.logger.log('Token generado correctamente');

    const redirectUrl = `/auth/google?state=${stateToken}`;
    this.logger.log('URL de redirección:', redirectUrl);

    return {
      success: true,
      redirectUrl
    };
  } catch (error) {
    this.logger.error('Error en pre-registro:', error);
    throw error;
  }
}
// Método para manejar la redirección inicial a Google
async handleGoogleAuth(req: any) {
  return req.user;
}

async updateGoogleData(email: string, preRegisterDto: PreRegisterGoogleDto) {
  this.logger.log(`Iniciando actualización de datos para: ${email}`);

  try {
    // Buscar el usuario
    const user = await this.userRepository.findOne({
      where: { email }
    });

    if (!user) {
      this.logger.error(`Usuario no encontrado: ${email}`);
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar CPF único
    if (preRegisterDto.cpf !== user.cpf) {
      const existingCPF = await this.userRepository.findOne({
        where: { cpf: preRegisterDto.cpf }
      });
      
      if (existingCPF && existingCPF.id !== user.id) {
        throw new ConflictException('CPF já cadastrado');
      }
    }

    // Actualizar datos
    user.cpf = preRegisterDto.cpf;
    user.phone = preRegisterDto.phone;

    // Guardar cambios
    await this.userRepository.save(user);

    this.logger.log('Datos actualizados correctamente:', {
      email,
      cpf: user.cpf,
      phone: user.phone
    });

    return {
      success: true,
      message: 'Datos actualizados correctamente',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        cpf: user.cpf,
        phone: user.phone
      }
    };

  } catch (error) {
    this.logger.error('Error en updateGoogleData:', error);
    throw error;
  }
}
}

