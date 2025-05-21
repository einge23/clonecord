import Resend from "@auth/core/providers/resend";
import { Resend as ResendAPI } from "resend";
import { alphabet, generateRandomString } from "oslo/crypto";

export const ResendOTPPasswordReset = Resend({
  id: "resend-otp",
  apiKey: process.env.AUTH_RESEND_KEY!,
  async generateVerificationToken() {
    return generateRandomString(8, alphabet("0-9"));
  },
  async sendVerificationRequest({ identifier: email, provider, token }) {
    const resend = new ResendAPI(provider.apiKey);
    const { error } = await resend.emails.send({
      from: "Clonecord <onboarding@resend.dev>",
      to: [email],
      subject: `Reset your password for Clonecord`,
      text: "Your password reset code is " + token,
    });

    if (error) {
      // Log the error for debugging
      console.error("Failed to send password reset email:", error);
      throw new Error(
        "Could not send password reset email. Please try again later.",
      );
    }
  },
});
