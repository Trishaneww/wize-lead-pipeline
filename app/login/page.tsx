// Next.js
import type { Metadata } from "next";

// Assets
import WizeStudiosLogo from "@/public/wize-studios-logo.svg";
import GoogleLogo from "@/public/google.svg";

// HTML Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Libs
import { signIn } from "@/auth";

export const runtime = "nodejs";
export const metadata: Metadata = { title: "Sign in · Wize Studios" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  async function signInWithGoogle() {
    "use server";
    await signIn("google", { redirectTo: "/leads" });
  }

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 size-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/25 blur-[130px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-[58%] top-[44%] -z-10 size-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/30 blur-[100px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-[40%] top-[60%] -z-10 size-[20rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-300/40 blur-[100px]"
      />

      <Card className="relative w-full max-w-sm shadow-xl">
        <CardHeader className="flex flex-col items-center gap-2 text-center">
          <div className="mb-1 flex size-14 items-center justify-center rounded-2xl bg-foreground shadow-sm">
            <WizeStudiosLogo className="size-9 text-[#BACDF9]" />
          </div>
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Sign in to access your dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <p className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-center text-sm text-destructive">
              {error === "AccessDenied"
                ? "This account isn't authorized. Contact an administrator."
                : "Something went wrong signing in. Please try again."}
            </p>
          )}
          <form action={signInWithGoogle}>
            <Button
              type="submit"
              variant="outline"
              className="w-full cursor-pointer gap-2"
            >
              <GoogleLogo className="size-[18px] shrink-0" />
              Sign in with Google
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
