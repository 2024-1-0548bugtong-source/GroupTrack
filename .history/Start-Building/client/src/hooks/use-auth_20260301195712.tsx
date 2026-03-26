import { useEffect, useState, createContext, useContext, ReactNode } from "react";
import { User, onAuthStateChanged, signInAnonymously, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useLocation } from "wouter";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  nickname: string;
  signIn: (nickname: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [nickname, setNickname] = useState("");
  const [, setLocation] = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser?.displayName) {
        setNickname(currentUser.displayName);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = async (name: string) => {
    try {
      // If user already has a persisted session, reuse it
      let currentUser = auth.currentUser;
      if (!currentUser) {
        const result = await signInAnonymously(auth);
        currentUser = result.user;
      }
      // Update display name
      await updateProfile(currentUser, { displayName: name });
      setNickname(name);
      // Create/update user profile in Firestore (merge preserves projectIds)
      await setDoc(doc(db, "users", currentUser.uid), {
        displayName: name,
        createdAt: new Date().toISOString(),
      }, { merge: true });
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  };

  // Soft logout: clear UI state but keep the Firebase session alive
  // so the anonymous uid persists and the user doesn't become a duplicate
  const signOut = () => {
    setNickname("");
    setUser(null);
    setLocation("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, nickname, signIn, signOut }}>
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
