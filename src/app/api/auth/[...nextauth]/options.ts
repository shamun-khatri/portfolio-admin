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
        hostOnly: false,
        httpOnly: true,
        sameSite: "none",
        path: "/",
        secure: true,
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: false,
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: false,
      },
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          // Check if the user already exists in your database
          console.log("account login");
          const existingUser = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/user/getuser?email=${user.email}`
          ).then((res) => res.json());
          console.log("existingUser", existingUser);
          if (existingUser.length === 0) {
            // If the user doesn't exist, create a new user in your database
            const newUser = {
              id: user.id,
              email: user.email,
              name: user.name,
              avatar: user.image,
              googleId: user.id,
              // Add any other fields you want to store
            };

            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(newUser),
            }).catch((error) => {
              console.error("Error creating new user:", error);
              return false;
            });

            console.log("New user created:", newUser);
          } else {
            console.log("Existing user logged in:", existingUser[0]);
          }
        } catch (error) {
          console.error("Error during sign in:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ user, token }) {
      if (user) {
        token.id = user.id; // Example: Add user role // Example: Add other custom data
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        if (session && session.user) {
          session.user.id = token.id; // Example: Add user ID to session
        }
      }
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
  //     ("payload", payload);
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
