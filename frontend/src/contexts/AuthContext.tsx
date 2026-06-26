import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import type { User as FirebaseUser } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

interface AppUser extends FirebaseUser {
  role?: string;
  companyId?: string;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    try {
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          const isDriver = firebaseUser.email?.toLowerCase().includes("driver");
          const defaultRole = isDriver ? "Driver" : "Admin";

          // Set user immediately to unblock the UI (avoids white screen if Firestore hangs)
          setUser({ ...firebaseUser, role: defaultRole, companyId: "c1" } as AppUser);
          setLoading(false);

          try {
            const userDocRef = doc(db, "users", firebaseUser.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              const data = userDoc.data();
              setUser({ ...firebaseUser, role: data.role, companyId: data.companyId } as AppUser);
            } else {
              // First-time login: create user document in Firestore
              const newUserData = {
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || firebaseUser.email,
                role: defaultRole,
                companyId: "c1",
                createdAt: new Date().toISOString(),
              };
              await setDoc(userDocRef, newUserData);
            }
          } catch (error) {
            console.error("Firestore error:", error);
            // Ignore error - we already set a default user state above
          }
        } else {
          // No Firebase user — set demo user so dashboard works
          const mockEmail = sessionStorage.getItem("mock_user_email") || "admin@abc.com";
          setUser({
            uid: "demo-user",
            email: mockEmail,
            displayName: mockEmail.split('@')[0] || "Admin",
            role: "Super Admin",
            companyId: "c1",
          } as AppUser);
          setLoading(false);
        }
      });
    } catch (error) {
      console.error("Auth listener error:", error);
      // Fallback demo user
      const mockEmail = sessionStorage.getItem("mock_user_email") || "admin@abc.com";
      setUser({
        uid: "demo-user",
        email: mockEmail,
        displayName: mockEmail.split('@')[0] || "Admin",
        role: "Super Admin",
        companyId: "c1",
      } as AppUser);
      setLoading(false);
    }

    return () => unsubscribe?.();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
