declare module "speakeasy" {
  export interface Secret {
    ascii: string;
    hex: string;
    base32: string;
    otpauth_url?: string;
  }

  export interface GenerateSecretOptions {
    length?: number;
    name?: string;
    issuer?: string;
  }

  export interface TotpOptions {
    secret: string;
    encoding?: "ascii" | "hex" | "base32";
    token: string;
    window?: number;
  }

  export function generateSecret(options?: GenerateSecretOptions): Secret;

  export namespace totp {
    function verify(options: TotpOptions): boolean;
  }
}
