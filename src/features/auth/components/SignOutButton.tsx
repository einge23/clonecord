"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

export function SignOutButton() {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  const navigate = useNavigate();

  const handleSignOut = () => {
    void signOut();
    navigate("/auth");
  };

  return (
    <>
      {isAuthenticated && (
        <Button size="sm" onClick={handleSignOut} className="ml-4">
          Sign out
        </Button>
      )}
    </>
  );
}
