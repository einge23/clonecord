"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PasswordResetStep = "enterEmail" | "enterCode" | "success";

export function PasswordReset({ onCancel }: { onCancel: () => void }) {
  const { signIn } = useAuthActions();
  const [currentStep, setCurrentStep] =
    useState<PasswordResetStep>("enterEmail");
  const [emailForDisplay, setEmailForDisplay] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendResetCode = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    try {
      await signIn("password", formData);
      setEmailForDisplay(email);
      setCurrentStep("enterCode");
      setMessage(`A password reset code has been sent to ${email}.`);
    } catch (err: any) {
      console.error("Password reset request failed", err);
      setError(
        err.data?.message ||
          err.message ||
          "Failed to send password reset code. Please check the email and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetNewPassword = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);
    const formData = new FormData(event.currentTarget);
    try {
      await signIn("password", formData); // flow="reset-verification" is set in hidden input
      setCurrentStep("success");
      setMessage(
        "Password has been reset successfully! You will be redirected shortly.",
      );
      setTimeout(() => {
        onCancel(); // Go back to sign-in form
      }, 3000);
    } catch (err: any) {
      console.error("Password reset failed", err);
      setError(
        err.data?.message ||
          err.message ||
          "Failed to reset password. The code might be invalid, expired, or the password doesn\'t meet requirements.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderEnterEmailStep = () => (
    <form className="grid gap-4" onSubmit={handleSendResetCode}>
      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold">Reset Password</h2>
        <p className="text-sm text-muted-foreground">
          Enter your email, and we'll send you a code.
        </p>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email-reset">Email</Label>
        <Input
          id="email-reset"
          name="email"
          placeholder="m@example.com"
          type="email"
          required
          disabled={isLoading}
        />
      </div>
      <input name="flow" type="hidden" value="reset" />
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Sending..." : "Send Reset Code"}
      </Button>
      <Button
        variant="link"
        type="button"
        onClick={onCancel}
        disabled={isLoading}
        className="w-full"
      >
        Cancel
      </Button>
    </form>
  );

  const renderEnterCodeStep = () => (
    <form className="grid gap-4" onSubmit={handleSetNewPassword}>
      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold">Enter Code</h2>
        <p className="text-sm text-muted-foreground">
          Code sent to <strong>{emailForDisplay}</strong>. Enter it below with
          your new password.
        </p>
      </div>
      {message && !error && currentStep === "enterCode" && (
        <p className="text-center text-sm text-green-600 dark:text-green-400 mb-2">
          {message}
        </p>
      )}
      <div className="grid gap-2">
        <Label htmlFor="code">Verification Code</Label>
        <Input
          id="code"
          name="code"
          type="text"
          required
          disabled={isLoading}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="newPassword">New Password</Label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          required
          disabled={isLoading}
        />
      </div>
      <input name="email" value={emailForDisplay} type="hidden" />
      <input name="flow" value="reset-verification" type="hidden" />
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Resetting..." : "Set New Password"}
      </Button>
      <Button
        variant="link"
        type="button"
        onClick={() => {
          setCurrentStep("enterEmail");
          setError(null);
          setMessage(null);
        }}
        disabled={isLoading}
        className="w-full"
      >
        Use a different email
      </Button>
    </form>
  );

  const renderSuccessStep = () => (
    <div className="flex flex-col items-center gap-3 text-center">
      <h2 className="text-2xl font-bold">Password Reset!</h2>
      {/* The success message is set in handleSetNewPassword and displayed by the main message area */}
    </div>
  );

  return (
    <div className="flex flex-col gap-4 w-96 mx-auto bg-card text-card-foreground border border-border rounded-lg p-6">
      <div key={currentStep} className="animate-step-transition">
        {currentStep === "enterEmail" && renderEnterEmailStep()}
        {currentStep === "enterCode" && renderEnterCodeStep()}
        {currentStep === "success" && renderSuccessStep()}
      </div>

      {error && (
        <div className="mt-2 bg-destructive/10 text-destructive p-3 rounded-md border border-destructive/30 text-center">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}
      {message && currentStep === "success" && !error && (
        <div className="mt-2 bg-primary/10 text-primary p-3 rounded-md border border-primary/30 text-center">
          <p className="text-sm font-medium">{message}</p>
        </div>
      )}
    </div>
  );
}
