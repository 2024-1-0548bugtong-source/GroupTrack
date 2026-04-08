import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  LogOut, 
  GraduationCap,
  Sun,
  Moon
} from "lucide-react";

export function Layout({ children }: { children: ReactNode }) {
  const { signOut, user, nickname } = useAuth();
  const [location] = useLocation();
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const initials = (nickname || "G").slice(0, 2).toUpperCase();
  const isExtension = import.meta.env.VITE_IS_EXTENSION === "true";

  return (
    <div
      className={`bg-background flex flex-col font-sans text-foreground ${
        isExtension ? "h-full max-h-full overflow-hidden" : "min-h-screen"
      }`}
    >
      {/* Gradient accent stripe */}
      <div className="gradient-stripe h-[3px] w-full shrink-0" />

      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60 border-b border-border/50 shrink-0">
        <div className="container flex h-14 items-center px-4 md:px-8 max-w-7xl mx-auto">
          <Link href="/dashboard" className="mr-6 flex items-center gap-2.5 group">
            <div className="bg-primary/10 p-1.5 rounded-lg group-hover:bg-primary/15 transition-colors">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <span className="hidden font-display font-bold text-lg sm:inline-block gradient-text">
              GroupTrack
            </span>
          </Link>

          <nav className="flex items-center gap-1 text-sm font-medium">
            <Link 
              href="/dashboard" 
              className={`px-3 py-1.5 rounded-md transition-all ${
                location === '/dashboard' 
                  ? 'bg-primary/10 text-primary font-semibold' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              Dashboard
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            {user && (
              <>
                {/* Avatar with initials */}
                <div className="flex items-center gap-2 mr-1 max-w-[150px]">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-[11px] font-bold text-primary-foreground shadow-sm">
                    {initials}
                  </div>
                  <span className="text-xs md:text-sm font-medium truncate max-w-[100px]">{nickname || "Guest"}</span>
                </div>
                <div className="w-px h-6 bg-border" />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDarkMode(!darkMode)}
                  className="rounded-full h-8 w-8 transition-colors"
                  aria-label="Toggle dark mode"
                >
                  {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={signOut}
                  className="rounded-full h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="sr-only">Sign out</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        className={`app-main flex-1 container w-full max-w-full px-3 md:px-8 mx-auto min-h-0 ${
          isExtension
            ? "overflow-y-auto overflow-x-hidden py-4 md:py-4"
            : "py-8 md:py-10"
        }`}
      >
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-4 shrink-0">
        <div className="container flex items-center justify-center px-8 max-w-7xl mx-auto">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} GroupTrack &mdash; Built for academic excellence.
          </p>
        </div>
      </footer>
    </div>
  );
}
