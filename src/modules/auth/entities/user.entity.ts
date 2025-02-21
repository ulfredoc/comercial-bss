// src/modules/auth/entities/user.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users', { schema: 'crm' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({name: 'user_name', nullable: true })
  username: string;

  @Column({ unique: true })
  cpf: string;

  @Column({name: 'full_name'})
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  phone: string;

  @Column()
  password: string;

  @Column({ name: 'verification_code',type: 'varchar', nullable: true })  // Especificamos el tipo explícitamente
  verificationCode: string | null;  // Permitimos explícitamente null como tipo

  @Column({ name: 'is_verified' ,default: false })
  isVerified: boolean;

  @Column({name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({name: 'create_at'})
  createdAt: Date;

  @UpdateDateColumn({name: 'update_at'})
  updatedAt: Date;
  
  @Column({ name: 'last_login' ,type: 'timestamp', nullable: true })
  lastLogin: Date;
  @Column({name: 'google_id', nullable: true })
  googleId: string;

  @Column({ nullable: true })
  picture: string;

  @Column({name: 'is_google_user', default: false })
  isGoogleUser: boolean;
}