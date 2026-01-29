import { useEffect, useState, createContext, useContext, ReactNode } from "react";
import { User, onAuthStateChanged, signInAnonymously, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useLocation } from "wouter";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      await signInAnonymously(auth);
      // Optional: Add a display name update here if needed in future
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setLocation("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
