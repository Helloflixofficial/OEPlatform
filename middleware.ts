import { authMiddleware } from "@clerk/nextjs";
///////////////
export default authMiddleware({
  publicRoutes: ["/Help"]
});
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};