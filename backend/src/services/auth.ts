import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User, AuthResponse } from '../types';
import config from '../config';
import { generateToken } from '../utils';

class AuthService {
    constructor() {
        this.initializePassport();
    }

    private initializePassport(): void {
        // Google OAuth2 Strategy
        passport.use(
            new GoogleStrategy(
                {
                    clientID: config.googleClientId,
                    clientSecret: config.googleClientSecret,
                    callbackURL: config.googleCallbackUrl,
                },
                async (accessToken, refreshToken, profile, done) => {
                    try {
                        // Create or find user
                        const user: User = {
                            id: profile.id,
                            email: profile.emails?.[0]?.value || '',
                            name: profile.displayName || '',
                            picture: profile.photos?.[0]?.value,
                            googleId: profile.id,
                        };

                        return done(null, user);
                    } catch (error) {
                        return done(error as Error);
                    }
                }
            )
        );

        // Serialize user for session
        passport.serializeUser((user: any, done) => {
            done(null, user.id);
        });

        // Deserialize user from session
        passport.deserializeUser((id: string, done) => {
            // In a real app, you might want to fetch user from database
            // For now, we'll just pass the ID
            done(null, { id });
        });
    }

    // Generate authentication response
    generateAuthResponse(user: User): AuthResponse {
        const token = generateToken(user);

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
        return passport;
    }
}

export default new AuthService();
