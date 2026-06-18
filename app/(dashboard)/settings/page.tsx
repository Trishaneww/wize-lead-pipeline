// HTML Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Libs
import { auth, signIn, signOut } from "@/auth";
import { getGoogleAccountByEmail } from "@/lib/queries/accounts";
import { deleteGoogleAccountByUserId } from "@/lib/queries/accounts";

export const runtime = "nodejs";

export default async function SettingsPage() {
  const session = await auth();
  const user = session?.user;
  const account = user?.email
    ? await getGoogleAccountByEmail(user.email)
    : undefined;
  const gmailConnected = !!account?.refresh_token;

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  async function reconnectGmail() {
    "use server";
    if (user?.id) await deleteGoogleAccountByUserId(user.id);
    await signIn("google", { redirectTo: "/settings" });
  }

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Account, sender identity, and access.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Avatar className="size-10">
              {user?.image && <AvatarImage src={user.image} alt="" />}
              <AvatarFallback>
                {user?.name?.[0] ?? user?.email?.[0] ?? "?"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">
                {user?.name ?? "Operator"}
              </p>
              <p className="truncate text-sm text-muted-foreground">
                {user?.email}
              </p>
            </div>
            <form action={signOutAction} className="ml-auto">
              <Button type="submit" variant="outline" size="sm" className="cursor-pointer">
                Sign out
              </Button>
            </form>
          </div>

          <div className="flex items-center gap-3 border-t border-border pt-4">
            <span className="text-sm text-foreground">Gmail</span>
            {gmailConnected ? (
              <Badge variant="secondary">Connected</Badge>
            ) : (
              <Badge variant="outline">Not connected</Badge>
            )}
            <form action={reconnectGmail} className="ml-auto">
              <Button type="submit" variant="ghost" size="sm" className="cursor-pointer">
                {gmailConnected ? "Reconnect Gmail" : "Connect Gmail"}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
