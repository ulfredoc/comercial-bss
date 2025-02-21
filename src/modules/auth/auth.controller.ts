// src/modules/auth/auth.controller.ts
/**
 * @fileoverview Controlador para manejo de autenticación
 * @author Ulfredo Carlo Ramos
 * @created 2024-02-21
 * @lastModified 2024-02-21
 * @description Este controlador maneja las operaciones relacionadas con la autenticación,
 * incluido el registro, inicio de sesión, verificación, restablecimiento de contraseña
 * y autenticación con Google OAuth.
 * @repository https://github.com/ulfredoc/comercial-bss
 * @branch main
 * @module auth
 * @since 0.1.0
 * @version 1.0.0
 * @see {@link https://github.com/ulfredoc/comercial-bss/blob/main/README.md|Documentación del proyecto}
 * @license MIT
 * @commits {@link https://github.com/ulfredoc/comercial-bss/commits/main/src/modules/auth/auth.controller.ts|Historial de cambios}
 */

import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Req, Get, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { AuthGuard } from '@nestjs/passport';
import { PreRegisterGoogleDto } from './dto/pre-register-google.dto';

/**
 * @class AuthController
 * @description Controlador que maneja todas las rutas relacionadas con la autenticación
 */
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  /**
   * @constructor
   * @param {AuthService} authService - Servicio de autenticación inyectado
   */
  constructor(private readonly authService: AuthService) {}

  /**
   * @method register
   * @description Registra un nuevo usuario en el sistema
   * @param {RegisterDto} registerDto - Datos de registro del usuario
   * @returns {Promise<Object>} Objeto con token de acceso y datos del usuario
   */
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * @method login
   * @description Autentica a un usuario existente
   * @param {LoginDto} loginDto - Credenciales de inicio de sesión
   * @returns {Promise<Object>} Objeto con token de acceso y datos del usuario
   */
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * @method verifyCode
   * @description Verifica el código de confirmación enviado al usuario
   * @param {string} email - Correo electrónico del usuario
   * @param {string} code - Código de verificación
   * @returns {Promise<Object>} Objeto con resultado de la verificación
   */
  @Post('verify-code')
  @HttpCode(HttpStatus.OK)
  async verifyCode(
    @Body('email') email: string,
    @Body('code') code: string,
  ) {
    return await this.authService.verifyCode(email, code);
  }

  /**
   * @method forgotPassword
   * @description Inicia el proceso de recuperación de contraseña
   * @param {ForgotPasswordDto} forgotPasswordDto - DTO con el email del usuario
   * @returns {Promise<Object>} Objeto con mensaje de confirmación
   */
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return await this.authService.forgotPassword(forgotPasswordDto.email);
  }

  /**
   * @method resetPassword
   * @description Restablece la contraseña del usuario
   * @param {ResetPasswordDto} resetPasswordDto - DTO con token y nueva contraseña
   * @returns {Promise<Object>} Objeto con mensaje de confirmación
   */
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return await this.authService.resetPassword(resetPasswordDto);
  }

  /**
   * @method googleAuth
   * @description Inicia el proceso de autenticación con Google OAuth
   * @returns {void} No retorna valor, redirecciona a Google
   */
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Este endpoint iniciará el proceso de autenticación de Google
  }

  /**
   * @method googleAuthRedirect
   * @description Maneja la redirección después de la autenticación de Google
   * @param {Request} req - Objeto de solicitud que contiene datos del usuario de Google
   * @returns {Promise<Object>} Objeto con token de acceso y datos del usuario
   */
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req) {
    this.logger.log('Google callback recibido');
    
    // Simplificar - ya no necesitamos manejar state para CPF y teléfono
    try {
      // Simplemente pasamos el perfil de usuario de Google
      return this.authService.validateGoogleUser(req.user);
    } catch (error) {
      this.logger.error('Error en googleAuthRedirect:', error);
      throw error;
    }
  }

  /**
   * @method updateGoogleData
   * @description Actualiza información adicional para usuarios registrados con Google
   * @param {PreRegisterGoogleDto} preRegisterDto - Datos adicionales del usuario
   * @param {string} email - Correo electrónico del usuario de Google
   * @returns {Promise<Object>} Objeto con resultado de la actualización
   */
  @Post('update-google-data')
  async updateGoogleData(
    @Body() preRegisterDto: PreRegisterGoogleDto,
    @Body('email') email: string
  ) {
    this.logger.log('Actualizando datos de usuario de Google:', {
      email,
      data: preRegisterDto
    });
    return this.authService.updateGoogleData(email, preRegisterDto);
  }
}