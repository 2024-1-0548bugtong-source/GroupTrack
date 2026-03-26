import { useEffect, useState, createContext, useContext, ReactNode } from "react";
import { User, onAuthStateChanged, signInAnonymously, signOut as firebaseSignOut, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useLocation } from "wouter";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  nickname: string;
  signIn: (nickname: string) => Promise<void>;
  signOut: () => Promise<void>;
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
      const result = await signInAnonymously(auth);
      await updateProfile(result.user, { displayName: name });
      setNickname(name);
      // Create/update user profile in Firestore (merge preserves projectIds)
      await setDoc(doc(db, "users", result.user.uid), {
        displayName: name,
        createdAt: new Date().toISOString(),
      }, { merge: true });
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setNickname("");
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
