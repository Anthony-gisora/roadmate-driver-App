import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { AxiosError } from "axios";
import {apiClient} from "@/hooks/api-client";

type User = {
    id: string;
    email: string;
    name: string;
    phone: string;
    location?: string;
    role: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelationship?: string;
};

type AuthContextType = {
    authenticated: boolean;
    user: User | null;
    loading: boolean;
    logout: () => Promise<void>;
    refreshAuth: () => Promise<void>;
};


const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [authenticated, setAuthenticated] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
                setToken(storedToken ?? null);

                if (!storedToken) {
                    setAuthenticated(false);
                    setUser(null);
                } else {
                    setAuthenticated(true);
                    try {
                        await validateToken(storedToken);
                    } catch {
                        setAuthenticated(false);
                        setUser(null);
                    }
                }
            } catch (err) {
                console.error("AuthProvider init error:", err);
                setAuthenticated(false);
                setUser(null);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const validateToken = async (token: string) => {
        try {
            const res = await apiClient.get("/auth", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const userData: User = res.data;
            setUser(userData);
            await SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData));
        } catch (err) {
            const error = err as AxiosError;
            if (!error.response) {
                const userD = await SecureStore.getItemAsync(USER_KEY);
                if (typeof userD === "string") {
                    setUser(JSON.parse(userD));
                }
                console.warn("Network unavailable, staying authenticated");
                return;
            }
            if (error.response.status === 403) {
                await logout();
            }
        }
    };

    const logout = async () => {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(USER_KEY);
        setAuthenticated(false);
        setUser(null);
    };

    const refreshAuth = async () => {
        const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
        if (storedToken) await validateToken(storedToken);
    };

    return (
        <AuthContext.Provider
            value={{
                authenticated,
                user,
                loading,
                logout,
                refreshAuth,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Hook
 */
export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
};
