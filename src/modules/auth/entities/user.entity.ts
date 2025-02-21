// src/modules/auth/entities/user.entity.ts
/**
 * @fileoverview Entidad de Usuario para la aplicación
 * @author Ulfredo Carlo Ramos
 * @created 2024-02-21
 * @lastModified 2024-02-21
 * @description Esta entidad define la estructura y propiedades de un usuario en el sistema,
 * incluyendo información personal, credenciales, estado de verificación y datos de autenticación
 * con Google.
 * @repository https://github.com/ulfredoc/comercial-bss
 * @branch main
 * @module auth/entities
 * @since 0.1.0
 * @version 1.0.0
 * @see {@link https://github.com/ulfredoc/comercial-bss/blob/main/README.md|Documentación del proyecto}
 * @license MIT
 * @commits {@link https://github.com/ulfredoc/comercial-bss/commits/main/src/modules/auth/entities/user.entity.ts|Historial de cambios}
 */

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * @class User
 * @description Entidad que representa un usuario en el sistema con todos sus atributos
 * @entity 'users'
 * @schema 'crm'
 */
@Entity('users', { schema: 'crm' })
export class User {
  /**
   * @property {string} id - Identificador único del usuario
   * @primaryKey
   * @generated uuid
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * @property {string} username - Nombre de usuario para inicio de sesión
   * @column user_name
   * @nullable
   */
  @Column({name: 'user_name', nullable: true })
  username: string;

  /**
   * @property {string} cpf - Número de documento CPF (formato brasileño)
   * @column
   * @unique
   */
  @Column({ unique: true })
  cpf: string;

  /**
   * @property {string} fullName - Nombre completo del usuario
   * @column full_name
   */
  @Column({name: 'full_name'})
  fullName: string;

  /**
   * @property {string} email - Correo electrónico del usuario
   * @column
   * @unique
   */
  @Column({ unique: true })
  email: string;

  /**
   * @property {string} phone - Número de teléfono del usuario
   * @column
   */
  @Column()
  phone: string;

  /**
   * @property {string} password - Contraseña del usuario (debe almacenarse hasheada)
   * @column
   */
  @Column()
  password: string;

  /**
   * @property {string|null} verificationCode - Código para verificación de cuenta o restablecimiento de contraseña
   * @column verification_code
   * @nullable
   */
  @Column({ name: 'verification_code',type: 'varchar', nullable: true })
  verificationCode: string | null;

  /**
   * @property {boolean} isVerified - Indica si el usuario ha verificado su cuenta
   * @column is_verified
   * @default false
   */
  @Column({ name: 'is_verified' ,default: false })
  isVerified: boolean;

  /**
   * @property {boolean} isActive - Indica si la cuenta de usuario está activa
   * @column is_active
   * @default true
   */
  @Column({name: 'is_active', default: true })
  isActive: boolean;

  /**
   * @property {Date} createdAt - Fecha de creación del registro
   * @createDate
   * @column create_at
   */
  @CreateDateColumn({name: 'create_at'})
  createdAt: Date;

  /**
   * @property {Date} updatedAt - Fecha de última actualización del registro
   * @updateDate
   * @column update_at
   */
  @UpdateDateColumn({name: 'update_at'})
  updatedAt: Date;
  
  /**
   * @property {Date} lastLogin - Fecha del último inicio de sesión
   * @column last_login
   * @nullable
   */
  @Column({ name: 'last_login' ,type: 'timestamp', nullable: true })
  lastLogin: Date;

  /**
   * @property {string} googleId - Identificador único proporcionado por Google OAuth
   * @column google_id
   * @nullable
   */
  @Column({name: 'google_id', nullable: true })
  googleId: string;

  /**
   * @property {string} picture - URL de la imagen de perfil del usuario
   * @column
   * @nullable
   */
  @Column({ nullable: true })
  picture: string;

  /**
   * @property {boolean} isGoogleUser - Indica si el usuario se registró mediante Google
   * @column is_google_user
   * @default false
   */
  @Column({name: 'is_google_user', default: false })
  isGoogleUser: boolean;
}