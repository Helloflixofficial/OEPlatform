import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <SignUp
      path="/sign-up"
      routing="path"
      signInUrl="/sign-in"
      appearance={{
        elements: {
          socialButtonsBlockButton: "py-3.5 px-4 font-semibold text-sm rounded-xl border border-zinc-200/90 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 transition-all shadow-2xs min-h-[48px] flex items-center justify-center gap-3",
          socialButtonsBlockButtonText: "font-semibold text-sm text-zinc-800 dark:text-zinc-200",
          formButtonPrimary: "py-3.5 px-4 font-bold text-sm rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 text-white transition-all shadow-sm min-h-[48px]",
          formFieldInput: "py-3 px-4 text-sm rounded-xl border-zinc-200 dark:border-zinc-800 min-h-[44px]",
          footerActionLink: "font-bold text-zinc-900 dark:text-zinc-100 hover:underline text-sm",
        },
      }}
    />
  );
}