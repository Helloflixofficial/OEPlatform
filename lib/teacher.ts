export const isTeacher = (userId?: string | null) => {
  // Temporarily allow all users for debugging
  return !!userId;
  // return userId === process.env.NEXT_PUBLIC_TEACHER_ID;
}