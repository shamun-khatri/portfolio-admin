import { hkdf } from "crypto";
import { EncryptJWT, jwtDecrypt } from "jose";
import { AuthOptions } from "next-auth";
import { JWT, JWTDecodeParams, JWTEncodeParams } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import { v4 as uuid } from "uuid";

const DEFAULT_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

const now = () => (Date.now() / 1000) | 0;

const authOptions: AuthOptions = {
  // Configure one or more authentication providers
  providers: [
    // !!! Should be stored in .env file.
    GoogleProvider({
      clientId: `1041339102270-e1fpe2b6v6u1didfndh7jkjmpcashs4f.apps.googleusercontent.com`,
      clientSecret: `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`,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt", // Enable JWT-based sessions
  },
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: false,
        sameSite: "lax",
        path: '/',
        secure: false,
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: '/',
        secure: false
      }
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: '/',
        secure: false
      }
    },
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.token_id = account.id_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.token_id = token.token_id;
      session.fullToken = token;
      return session;
    },
  },
  // jwt: {
  //   encode: async (params: JWTEncodeParams) => {
  //     console.log("params", params);
  //     const {
  //       token = {},
  //       secret,
  //       maxAge = DEFAULT_MAX_AGE,
  //       salt = "",
  //     } = params;
  //     const encryptionSecret = await getDerivedEncryptionKey(secret, salt);
  //     const encres =await new EncryptJWT(token)
  //     .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
  //     .setIssuedAt()
  //     .setExpirationTime(now() + maxAge)
  //     .setJti(uuid())
  //     .encrypt(encryptionSecret);

  //     console.log("encres", encres);
  //     return encres;
  //   },

  //   decode: async (params: JWTDecodeParams): Promise<JWT | null> => {
  //     const { token, secret, salt = "" } = params;
  //     if (!token) return null;
  //     const encryptionSecret = await getDerivedEncryptionKey(secret, salt);
  //     const { payload } = await jwtDecrypt(token, encryptionSecret, {
  //       clockTolerance: 15,
  //     });
  //     console.log("payload", payload);
  //     return payload;
  //   },
  // },
};

async function getDerivedEncryptionKey(
  keyMaterial: string | Buffer,
  salt: string
) {
  return await hkdf(
    "sha256",
    keyMaterial,
    salt,
    `NextAuth.js Generated Encryption Key${salt ? ` (${salt})` : ""}`,
    32
  );
}

export default authOptions;
