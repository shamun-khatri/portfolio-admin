import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    // Add your providers here
    Google,
  ],
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "none",
        path: "/",
        secure: true,
        domain: process.env.NODE_ENV === "production" ? ".shamunkhatri.me" : undefined,
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: false,
        domain: process.env.NODE_ENV === "production" ? ".shamunkhatri.me" : undefined,
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: false,
        domain: process.env.NODE_ENV === "production" ? ".shamunkhatri.me" : undefined,
      },
    },
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;

      // API routes should be accessible or handle their own auth
      if (pathname.startsWith("/api")) return true;

      // Redirect logged-in users away from the login page
      if (pathname.startsWith("/login")) {
        if (isLoggedIn) return Response.redirect(new URL("/dashboard", nextUrl));
        return true;
      }

      // Root path is the public landing page and should be accessible to everyone.
      if (pathname === "/") {
        return true;
      }

      return isLoggedIn;
    },
    async signIn({ user, account }) {
      console.log("signIn callback Use", user);
      console.log("signIn callback Account", account);
      if (account?.provider === "google") {
        try {
          // Check if the user already exists in your database
          console.log("account login");
          const existingUser = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/users/getuser?email=${user.email}`
          ).then((res) => res.json());
          console.log("existingUser", existingUser);
          if (existingUser.length === 0) {
            // If the user doesn't exist, create a new user in your database
            const newUser = {
              id: account?.providerAccountId,
              email: user?.email,
              name: user?.name,
              avatar: user?.image,
              googleId: account?.providerAccountId,
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
    async jwt({ token, account }) {
      if (account) {
        console.log("JWT callback Account", account);
      }
      if (account) {
        token.id = account.providerAccountId; // Example: Add user role // Example: Add other custom data
      }
      return token;
    },
    async session({ session, token }) {
      if (token && typeof token.id === "string") {
        if (session && session.user) {
          session.user.id = token.id;
        }
      }
      return session;
    },
  },
});
