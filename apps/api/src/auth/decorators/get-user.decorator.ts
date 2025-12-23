import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
    (data: string | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        // Si se pasa data (ej: @GetUser('email')), devolvemos solo ese campo
        if (data) {
            return request.user && request.user[data];
        }
        // Si no, devolvemos todo el usuario
        return request.user;
    },
);
