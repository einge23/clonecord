import { ThemeToggle } from "./ThemeToggle";
import { SignOutButton } from "@/features/auth/components/SignOutButton";
export default function Navbar() {
  return (
    <header className="sticky top-0 z-30 bg-background backdrop-blur-md p-4 border-b border-border">
      <div className="w-full flex justify-between items-center px-4">
        <span className="text-lg font-semibold text-primary">Clonecord</span>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
