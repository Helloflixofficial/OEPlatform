import { authMiddleware } from "@clerk/nextjs";
export default authMiddleware({ 
  publicRoutes:["/api/uploadthing"]
});
 
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],

};

//error fixed stackoverflow
// https://stackoverflow.com/questions/77549993/how-to-resolve-errors-around-uploadthing-and-nextjs-the-upload-functionality-wo