export interface VerifyUniversityEmailRequestDto {
  email: string;
  university: string;
}

export interface VerifyUniversityEmailResponseDto {
  exists: boolean;
}

