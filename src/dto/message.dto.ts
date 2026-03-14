export interface SendMessageRequestDto {
  text: string;
}

export interface MessageResponseDto {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  sentAt: string;
}
