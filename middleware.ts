/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import { authMiddleware, clerkClient } from "@clerk/nextjs/server";
import { NextFetchEvent, NextRequest } from "next/server";
export default authMiddleware({
  async afterAuth(auth: any, req: NextRequest, evt: NextFetchEvent) {
    // Country-based access control
    let country = req.geo?.country;
    if (country === "RU") {
      return NextResponse.json({ error: "Access Denied" }, { status: 403 });
    }

    // If the user is logged in and trying to access a protected route
    if (auth.userId && auth.isPublicRoute) {
      const user = await clerkClient.users.getUser(auth.userId);
      // Perform any additional checks or logic here
    }

    // Allow the request to proceed
    return NextResponse.next();
  },
});

// Update the config to use Clerk's matcher
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
