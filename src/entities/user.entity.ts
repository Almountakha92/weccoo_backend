export interface UserEntity {
  id: string;
  fullName: string;
  university: string;
  email: string;
  whatsappPhone: string;
  password: string;
  role?: 'student' | 'campus_admin' | 'super_admin';
  campusId?: string | null;
  suspendedAt?: string | null;
  mfaEnabled?: boolean;
  mfaSecret?: string | null;
  mfaTempSecret?: string | null;
  createdAt: string;
}
