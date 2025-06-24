"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const config_1 = __importDefault(require("../config"));
const utils_1 = require("../utils");
class AuthService {
    constructor() {
        this.initializePassport();
    }
    initializePassport() {
        // Google OAuth2 Strategy
        passport_1.default.use(new passport_google_oauth20_1.Strategy({
            clientID: config_1.default.googleClientId,
            clientSecret: config_1.default.googleClientSecret,
            callbackURL: config_1.default.googleCallbackUrl,
        }, async (accessToken, refreshToken, profile, done) => {
            try {
                // Create or find user
                const user = {
                    id: profile.id,
                    email: profile.emails?.[0]?.value || '',
                    name: profile.displayName || '',
                    picture: profile.photos?.[0]?.value,
                    googleId: profile.id,
                };
                return done(null, user);
            }
            catch (error) {
                return done(error);
            }
        }));
        // Serialize user for session
        passport_1.default.serializeUser((user, done) => {
            done(null, user.id);
        });
        // Deserialize user from session
        passport_1.default.deserializeUser((id, done) => {
            // In a real app, you might want to fetch user from database
            // For now, we'll just pass the ID
            done(null, { id });
        });
    }
    // Generate authentication response
    generateAuthResponse(user) {
        const token = (0, utils_1.generateToken)(user);
        return {
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                picture: user.picture,
                googleId: user.googleId,
            },
            token,
        };
    }
    // Get passport instance
    getPassport() {
        return passport_1.default;
    }
}
exports.default = new AuthService();
//# sourceMappingURL=auth.js.map