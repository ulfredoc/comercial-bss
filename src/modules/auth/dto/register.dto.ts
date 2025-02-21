// src/modules/auth/dto/register.dto.ts
export class RegisterDto {
  // Campos actuales que mantendremos (si los hay)
  username?: string;  // Lo hacemos opcional si queremos usar fullName como principal
  email: string;
  password: string;

  // Nuevos campos para clientes brasileños
  cpf: string;
  fullName: string;
  phone: string;
}