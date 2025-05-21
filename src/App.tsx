"use client";

import { Authenticated, Unauthenticated } from "convex/react";
import { Routes, Route, Navigate } from "react-router";
import { SignInForm } from "@/features/auth/components/SignInForm";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import DashboardContent from "./features/dashboard/components/DashboardContent";
import Conversation from "./features/conversation/components/Conversation";

export default function App() {
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <main className="p-4">
          <Routes>
            <Route
              path="/"
              element={
                <Authenticated>
                  <DashboardContent />
                </Authenticated>
              }
            />
            <Route
              path="/auth"
              element={
                <Unauthenticated>
                  <SignInForm />
                </Unauthenticated>
              }
            />
            <Route
              path="/chat/new"
              element={
                <Authenticated>
                  <Conversation />
                </Authenticated>
              }
            />
            <Route
              path="/chat/:chatId"
              element={
                <Authenticated>
                  <Conversation />
                </Authenticated>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
