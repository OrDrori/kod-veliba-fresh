import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  // BYPASSED FOR DEVELOPMENT - Direct access without authentication
  const mockUser = {
    id: 1,
    name: "Or Drori",
    email: "or@kodveliba.com",
    avatar: "",
  };

  const logout = useCallback(async () => {
    console.log("Logout bypassed in development mode");
  }, []);

  const state = useMemo(() => {
    localStorage.setItem(
      "manus-runtime-user-info",
      JSON.stringify(mockUser)
    );
    return {
      user: mockUser,
      loading: false,
      error: null,
      isAuthenticated: true,
    };
  }, []);

  return {
    ...state,
    refresh: () => Promise.resolve({ data: mockUser }),
    logout,
  };
}
