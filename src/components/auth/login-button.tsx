"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function LoginButton() {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  if (session) {
    return (
      <Button onClick={() => signOut()} disabled={isLoading}>
        Sign Out
      </Button>
    );
  }

  return (
    <Button onClick={() => signIn("azure-ad")} disabled={isLoading}>
      Sign in with Azure AD
    </Button>
  );
}
