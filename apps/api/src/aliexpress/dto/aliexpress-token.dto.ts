export class TokenResponseDto {
    access_token!: string;
    refresh_token?: string;
    expires_in?: number;
    refresh_expires_in?: number;
    user_id?: string;
    user_nick?: string;
}

export class CallbackQueryDto {
    code!: string;
    state?: string;
}
