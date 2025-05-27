"use client";
import { createContext, useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import apiClient from "../clients/apiClient";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth musi być użyty z authContext");
  }
  return context
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  const isAdmin = () => {
    if (!user || !user.roles) return false;
    return user.roles.includes("admin");
  };

  const login = async (email, password) => {
    try {
      const response = await apiClient.post("/auth/login", { email, password });
      const { accessToken, refreshToken } = response.data;
      const decodedToken = jwtDecode(accessToken);
      const userData = {
        id: decodedToken.sub,
        email: decodedToken.email,
        firstName: decodedToken.given_name,
        lastName: decodedToken.family_name,
        username: decodedToken.preferred_username,
        roles: decodedToken.realm_access?.roles || ["user"],
      };
      Cookies.set("accessToken", accessToken, { expires: 1 });
      Cookies.set("refreshToken", refreshToken, { expires: 7 });
      setUser(userData);
      setIsAuthenticated(true);
      return { success: true, user: userData };
    } catch (error) {
      console.error("login error", error);
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      };
    }
  };
  const register = async (userData) => {
    try {
      const response = await apiClient.post("/auth/register", userData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Registration failed",
      };
    }
  };
  const logout = async () => {
    try {
      const refreshToken = Cookies.get("refreshToken");
      if (refreshToken) {
        await apiClient.post("/auth/logout", { refreshToken });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
      setUser(null);
      setIsAuthenticated(false);
      router.push("/login");
    }
  };
  const checkAuth = async () => {
    try {
      const token = Cookies.get("accessToken");
      if (!token) {
        setIsLoading(false);
        return;
      }

      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      if (decodedToken.exp < currentTime) {
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        setIsLoading(false);
        return;
      }
      const response = await apiClient.get("/auth/me");
      const userData = {
        ...response.data,
        roles: decodedToken.realm_access?.roles || ["user"],
      };
      
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Auth check error:", error);
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);
  const values = {
    user,
    isAuthenticated,
    isLoading,
    isAdmin,
    login,
    register,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
};
