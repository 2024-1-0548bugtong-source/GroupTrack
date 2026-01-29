import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  LogOut, 
  LayoutGrid, 
  Plus, 
  User,
  GraduationCap
} from "lucide-react";

export function Layout({ children }: { children: ReactNode }) {
  const { signOut, user } = useAuth();
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans text-foreground">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center px-4 md:px-8">
          <Link href="/dashboard" className="mr-8 flex items-center space-x-2 transition-opacity hover:opacity-80">
            <div className="bg-primary/10 p-2 rounded-lg">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <span className="hidden font-display font-bold text-xl sm:inline-block tracking-tight text-primary">
              GroupTrack
            </span>
          </Link>

          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link 
              href="/dashboard" 
              className={`transition-colors hover:text-primary ${location === '/dashboard' ? 'text-foreground' : 'text-muted-foreground'}`}
            >
              Dashboard
            </Link>
          </nav>

          <div className="ml-auto flex items-center space-x-4">
            {user && (
              <div className="flex items-center gap-4">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-sm font-medium leading-none">Guest User</span>
                  <span className="text-xs text-muted-foreground mt-1">uid: {user.uid.slice(0, 6)}...</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={signOut}
                  className="rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="sr-only">Sign out</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container py-8 md:py-12 px-4 md:px-8 mx-auto max-w-7xl animate-in fade-in duration-500">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row px-8">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built for academic excellence. &copy; {new Date().getFullYear()} GroupTrack.
          </p>
        </div>
      </footer>
    </div>
  );
}
