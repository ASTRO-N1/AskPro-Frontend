"use client";

import { useState, useEffect, useCallback } from "react";
import { getUser, saveUser, clearUser } from "@/lib/auth";
import { logoutUser } from "@/lib/api";
import type { User } from "@/types/auth";

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User) => void;
  logout: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUserState(getUser());
    setIsLoading(false);
  }, []);

  const setUser = useCallback((u: User) => {
    saveUser(u);
    setUserState(u);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } finally {
      clearUser();
      setUserState(null);
    }
  }, []);

  return { user, isLoading, setUser, logout };
}
