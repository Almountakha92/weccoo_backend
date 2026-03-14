export interface UpdateMeRequestDto {
  whatsappPhone?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface UpdateMeResponseDto {
  id: string;
  fullName: string;
  email: string;
  university: string;
  whatsappPhone: string;
}

