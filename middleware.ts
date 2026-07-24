import { authMiddleware } from "@clerk/nextjs";
export default authMiddleware({
  publicRoutes: ["/api/webhook", "/meet/:path*"],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
