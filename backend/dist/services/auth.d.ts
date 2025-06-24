import passport from 'passport';
import { User, AuthResponse } from '../types';
declare class AuthService {
    constructor();
    private initializePassport;
    generateAuthResponse(user: User): AuthResponse;
    getPassport(): passport.PassportStatic;
}
declare const _default: AuthService;
export default _default;
//# sourceMappingURL=auth.d.ts.map