import { login, logout, refresh } from "@/services/authService";
import { ACCESS, REFRESH, tokenStorage } from "@/utils/tokenStorage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface User {
  id?: string;
  email?: string;
  name?: string;
  contractorId?: string;
  role?: string;
  authenticated?: boolean;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// JWT decoding utility - only extract what you need for UI
const extractUserFromToken = (token: string): User | null => {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));

    return {
      id: decoded.sub,
      email: decoded.email || decoded.unique_name,
      contractorId: decoded.contractorId,
      role: decoded[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
      ],
    };
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user?.authenticated;

  // Initialize auth state on app start
  useEffect(() => {
    const initAuth = async () => {
      try {
        const accessToken = await tokenStorage.getItem(ACCESS);
        const refreshToken = await tokenStorage.getItem(REFRESH);

        if (accessToken && refreshToken) {
          // Try to refresh token to validate current session
          const refreshResult = await refresh();
          if (refreshResult.ok) {
            const userData = extractUserFromToken(accessToken);
            if (userData) {
              setUser(userData);
            }
            //setUser({ authenticated: true });
          } else {
            // Clear invalid tokens
            await tokenStorage.multiRemove([ACCESS, REFRESH]);
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await login(email, password);

      if (result.ok) {
        // Set user data from login response
        const userData = result.value.user || { email, authenticated: true };
        setUser(userData);
        console.log("User data after login:", userData);
        return { success: true };
      }

      // Handle login failure - we know result.ok is false here
      return {
        success: false,
        error: (result as any).error?.message || "Login failed",
      };
    } catch (error) {
      return {
        success: false,
        error: "An unexpected error occurred",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      // Even if logout fails, clear local state
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshToken = async (): Promise<boolean> => {
    try {
      const result = await refresh();
      return result.ok;
    } catch (error) {
      console.error("Token refresh error:", error);
      return false;
    }
  };

  const hasRole = (role: string): boolean => {
    return user?.role === role;
  };
  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login: handleLogin,
    logout: handleLogout,
    refreshToken: handleRefreshToken,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
