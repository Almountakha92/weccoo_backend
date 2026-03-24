export interface CreateCampusRequestDto {
  name: string;
}

export interface CreateCampusAdminRequestDto {
  fullName: string;
  university: string;
  email: string;
  whatsappPhone?: string;
  password: string;
  campusId: string;
}

