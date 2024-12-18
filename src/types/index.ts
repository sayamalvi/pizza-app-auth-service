import { Request } from 'express';

export interface UserData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
    tenantId?: number;
}
export interface RegisterUserRequest extends Request {
    body: UserData;
}

export interface AuthRequest extends Request {
    auth: {
        sub: string;
        role: string;
        id?: string;
        tenant: string;
    };
}

export type AuthCookie = {
    accessToken: string;
    refreshToken: string;
};

export interface IRefreshTokenPayload {
    id: string;
}

export interface ITenant {
    name: string;
    address: string;
}

export interface CreateUserRequest extends Request {
    body: UserData;
}
export interface CreateTenantRequest extends Request {
    body: ITenant;
}
export interface LimitedUserData {
    firstName: string;
    lastName: string;
    role: string;
    email: string;
    tenantId: number;
}

export interface UpdateUserRequest extends Request {
    body: LimitedUserData;
}

export interface GetUserQueryParams {
    perPage: number;
    currentPage: number;
    searchTerm: string;
    role: string;
}
