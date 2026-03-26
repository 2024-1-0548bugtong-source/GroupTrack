import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { auth } from "@/lib/firebase";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, ArrowRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const { user, signIn, loading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [nickname, setNickname] = useState("");

  // Check for a persisted Firebase session (from soft logout)
  const existingUser = auth.currentUser;
  const existingName = existingUser?.displayName || "";

  useEffect(() => {
    if (user && !loading) {
      setLocation("/dashboard");
    }
  }, [user, loading, setLocation]);

  // Quick "Continue as..." for returning users
  const handleContinue = async () => {
    try {
      await signIn(existingName);
    } catch (error: any) {
      toast({ title: "Failed to continue session", description: error.message, variant: "destructive" });
    }
  };

  const handleLogin = async () => {
    if (!nickname.trim()) {
      toast({ title: "Please enter a nickname", variant: "destructive" });
      return;
    }
    try {
      await signIn(nickname.trim());
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-pink-100 dark:bg-pink-950/30 rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-fuchsia-100 dark:bg-fuchsia-950/30 rounded-full blur-3xl opacity-50 pointer-events-none" />

      <Card className="w-full max-w-md border-0 shadow-2xl bg-white/80 backdrop-blur-xl relative z-10">
        <CardHeader className="text-center space-y-4 pb-10 pt-12">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-2">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-display font-bold tracking-tight text-primary">
              GroupTrack
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground max-w-xs mx-auto">
              Streamline your academic group projects. Collaborate, track tasks, and succeed together.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          {existingName ? (
            // Returning user — show quick continue
            <div className="space-y-4">
              <div className="text-center p-4 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-sm text-muted-foreground mb-1">Welcome back!</p>
                <p className="text-lg font-semibold text-foreground">{existingName}</p>
              </div>
              <Button 
                className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-0.5" 
                size="lg"
                onClick={handleContinue}
              >
                Continue as {existingName}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">or use a different name</span></div>
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="New nickname..."
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && nickname.trim() && handleLogin()}
                  maxLength={20}
                  className="w-full h-10 px-4 rounded-lg border border-input bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground"
                />
                {nickname.trim() && (
                  <Button variant="outline" className="w-full" onClick={handleLogin}>
                    Continue as {nickname.trim()}
                  </Button>
                )}
              </div>
            </div>
          ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="nickname" className="text-sm font-medium text-foreground">
                Choose a Nickname
              </label>
              <input
                id="nickname"
                type="text"
                placeholder="e.g. Alex, StudyBuddy"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                maxLength={20}
                className="w-full h-12 px-4 rounded-lg border border-input bg-background text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground"
                autoFocus
              />
            </div>
            <Button 
              className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-0.5" 
              size="lg"
              onClick={handleLogin}
              disabled={!nickname.trim()}
            >
              Continue
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
          )}
          
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              No email needed. Your nickname is your identity.
              Privacy-first, simple collaboration.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
