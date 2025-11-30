import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";

export const DarkModeToggle = () => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="relative h-9 w-9 rounded-lg border border-border bg-background hover:bg-accent transition-all duration-200"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 absolute" />
      <Moon className="h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 absolute" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

