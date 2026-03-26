import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const { user, signIn, signUp, resetPassword, loading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      setLocation("/dashboard");
    }
  }, [user, loading, setLocation]);

  const handleSubmit = async () => {
    if (!email.trim()) {
      toast({ title: "Please enter your email", variant: "destructive" });
      return;
    }

    if (mode === "forgot") {
      setSubmitting(true);
      try {
        await resetPassword(email.trim());
        toast({ title: "Reset email sent!", description: "Check your inbox for a password reset link." });
        setMode("login");
      } catch (error: any) {
        toast({ title: "Failed", description: error.message, variant: "destructive" });
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (!password || password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }

    if (mode === "signup" && !nickname.trim()) {
      toast({ title: "Please choose a nickname", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "signup") {
        await signUp(email.trim(), password, nickname.trim());
        toast({ title: `Welcome, ${nickname.trim()}!` });
      } else {
        await signIn(email.trim(), password);
        toast({ title: "Welcome back!" });
      }
    } catch (error: any) {
      let msg = error.message;
      if (msg.includes("auth/email-already-in-use")) msg = "This email is already registered. Try logging in.";
      else if (msg.includes("auth/invalid-credential") || msg.includes("auth/wrong-password")) msg = "Invalid email or password.";
      else if (msg.includes("auth/user-not-found")) msg = "No account found with this email. Sign up first.";
      else if (msg.includes("auth/invalid-email")) msg = "Please enter a valid email address.";
      else if (msg.includes("auth/weak-password")) msg = "Password is too weak. Use at least 6 characters.";
      toast({ title: mode === "signup" ? "Sign up failed" : "Login failed", description: msg, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
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

      <Card className="w-full max-w-md border-0 shadow-2xl bg-white/80 dark:bg-card/80 backdrop-blur-xl relative z-10">
        <CardHeader className="text-center space-y-4 pb-6 pt-10">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-2">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-display font-bold tracking-tight text-primary">
              GroupTrack
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground max-w-xs mx-auto">
              {mode === "forgot"
                ? "Enter your email to reset your password."
                : mode === "signup"
                ? "Create your account to start collaborating."
                : "Sign in to manage your group projects."}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <div className="space-y-4">
            {/* Nickname — only on sign up */}
            {mode === "signup" && (
              <div className="space-y-1.5">
                <label htmlFor="nickname" className="text-sm font-medium text-foreground">
                  Nickname
                </label>
                <input
                  id="nickname"
                  type="text"
                  placeholder="e.g. Alex, StudyBuddy"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  onKeyDown={handleKeyDown}
                  maxLength={20}
                  className="w-full h-11 px-4 rounded-lg border border-input bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground"
                  autoFocus
                />
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full h-11 px-4 rounded-lg border border-input bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground"
                autoFocus={mode !== "signup"}
              />
            </div>

            {/* Password — not on forgot */}
            {mode !== "forgot" && (
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full h-11 px-4 pr-11 rounded-lg border border-input bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => setMode("forgot")}
                    className="text-xs text-primary hover:underline mt-1"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
            )}

            {/* Submit Button */}
            <Button
              className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
              size="lg"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {mode === "forgot" ? "Send Reset Email" : mode === "signup" ? "Create Account" : "Sign In"}
              {!submitting && <ArrowRight className="ml-2 h-5 w-5" />}
            </Button>
          </div>

          {/* Mode Toggle */}
          <div className="mt-6 text-center space-y-2">
            {mode === "forgot" ? (
              <button
                type="button"
                onClick={() => setMode("login")}
                className="text-sm text-primary hover:underline"
              >
                Back to sign in
              </button>
            ) : (
              <p className="text-sm text-muted-foreground">
                {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => setMode(mode === "login" ? "signup" : "login")}
                  className="text-primary font-medium hover:underline"
                >
                  {mode === "login" ? "Sign up" : "Sign in"}
                </button>
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Your email is only used for login. Privacy-first collaboration.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
