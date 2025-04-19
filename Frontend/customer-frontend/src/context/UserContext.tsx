import { createContext, useContext, useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export interface User {
  _id: string;
  name: string;
  username: string;
  email: string;
  profilePicture?: string;
  loyaltyPoints: number;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // fetches fresh customer data from the backend
  const refreshUser = async () => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsed = JSON.parse(userData);
      try {
        const res = await fetch(
          `${API_URL}/api/customers/${parsed.customer._id}`,
          {
            headers: {
              Authorization: parsed.tokens.token,
            },
          }
        );
        const data = await res.json();
        if (res.ok) {
          setUser(data);
        } else {
          console.error("Failed to fetch user:", data);
        }
      } catch (err) {
        console.error("Error refreshing user data:", err);
      }
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};

// custom hook to use the user context
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
