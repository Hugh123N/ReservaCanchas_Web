
export interface OAuthProvider {
    provider: 'google' | 'apple' | 'facebook';
    userType?: string;
}