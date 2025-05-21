import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
// If you have lucide-react installed, use these icons:
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [dark, setDark] = useState(
    () =>
      typeof window !== "undefined" &&
      document.documentElement.classList.contains("dark"),
  );

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  return (
    <Button
      variant="default"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setDark((d) => !d)}
      className="ml-2"
    >
      {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </Button>
  );
}
