// HTML Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Account, sender identity, and access.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Coming in a later phase</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Google sign-in, the login allowlist, sender identity, and Gmail connection land in
          Phase 3.
        </CardContent>
      </Card>
    </main>
  );
}
