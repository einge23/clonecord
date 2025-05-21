"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordReset } from "./PasswordReset";
import { useNavigate } from "react-router";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  if (showPasswordReset) {
    return <PasswordReset onCancel={() => setShowPasswordReset(false)} />;
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    const formData = new FormData(e.target as HTMLFormElement);
    signIn("password", formData)
      .then(() => {
        navigate("/");
      })
      .catch((error) => {
        setError(
          error.data?.message || error.message || "An unknown error occurred",
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="flex flex-col gap-4 w-96 mx-auto bg-card text-card-foreground border border-border rounded-lg p-6">
      <h2 className="text-2xl font-bold text-center text-primary">
        {flow === "signIn" ? "Sign In" : "Sign Up"}
      </h2>
      <p className="text-sm text-center text-muted-foreground">
        {flow === "signIn"
          ? "Log in to see the numbers"
          : "Create an account to get started"}
      </p>
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-2">
          <Label htmlFor="email" className="text-muted-foreground">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="m@example.com"
            required
            disabled={isLoading}
            className="bg-input text-foreground border border-border"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password" className="text-muted-foreground">
            Password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            disabled={isLoading}
            className="bg-input text-foreground border border-border"
          />
        </div>
        <input name="flow" type="hidden" value={flow} />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading
            ? "Processing..."
            : flow === "signIn"
              ? "Sign In"
              : "Sign Up"}
        </Button>
      </form>
      <div className="mt-2 text-center text-sm text-muted-foreground">
        {flow === "signIn"
          ? "Don't have an account?"
          : "Already have an account?"}{" "}
        <button
          onClick={() => {
            setFlow(flow === "signIn" ? "signUp" : "signIn");
            setError(null);
          }}
          className="underline disabled:opacity-50 text-primary"
          disabled={isLoading}
        >
          {flow === "signIn" ? "Sign up" : "Sign in"}
        </button>
      </div>
      <div className="mt-1 text-center text-sm">
        <button
          onClick={() => setShowPasswordReset(true)}
          className="underline disabled:opacity-50 text-primary"
          disabled={isLoading}
        >
          Forgot Password?
        </button>
      </div>
      {error && (
        <div className="mt-2 bg-destructive/10 text-destructive p-3 rounded-md border border-destructive/30">
          <p className="text-sm font-medium text-center">{error}</p>
        </div>
      )}
    </div>
  );
}
