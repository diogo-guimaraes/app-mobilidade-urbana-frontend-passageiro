// context/AuthProvider.tsx

import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import * as SecureStore from "expo-secure-store";

import { api } from "../Services/api";

// =========================
// INTERFACES
// =========================

interface Usuario {
  id: string;
  email: string;
  name: string;
  telefone: string;
  cpf: string;
  data_nascimento: string;
  foto: string;
}

interface AuthResponse {
  user: Usuario;
  token: string;
}

interface DadosCadastro {
  email: string;
  name: string;
  cpf: string;
  data_nascimento: string;
  password: string;
}

interface AuthContextType {
  user: Usuario | null;

  loading: boolean;

  login: (email: string, password: string) => Promise<void>;

  logout: () => Promise<void>;

  register: (dados: DadosCadastro) => Promise<void>;
}

// =========================
// CONTEXT
// =========================

const AuthContext = createContext<AuthContextType>({
  user: null,

  loading: true,

  login: async (email: string, password: string) => {},

  logout: async () => {},

  register: async (dados: DadosCadastro) => {},
});

// =========================
// PROVIDER
// =========================

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Usuario | null>(null);

  const [loading, setLoading] = useState(true);

  // =========================
  // RESTAURA SESSÃO
  // =========================

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedUser = await SecureStore.getItemAsync("user");

        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);

          setUser(parsedUser);
        }
      } catch (error) {
        console.error("Erro ao restaurar sessão:", error);

        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // =========================
  // LOGIN
  // =========================

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);

      const response = await api.post<AuthResponse>("/auth/login", {
        email,
        password,
      });

      const { user, token } = response.data;

      setUser(user);

      await SecureStore.setItemAsync("user", JSON.stringify(user));

      await SecureStore.setItemAsync("token", token);
    } catch (error: any) {
      console.error("Erro ao fazer login:", error);

      console.log("Mensagem:", error?.message);

      console.log("Código:", error?.code);

      console.log("Response:", error?.response?.data);

      console.log("Status:", error?.response?.status);

      throw error;
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOGOUT
  // =========================

  const logout = async () => {
    try {
      setUser(null);

      await SecureStore.deleteItemAsync("user");

      await SecureStore.deleteItemAsync("token");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  // =========================
  // REGISTER
  // =========================

  const register = async (dadosCadastro: DadosCadastro) => {
    try {
      setLoading(true);

      console.log("Enviando cadastro:", dadosCadastro);

      const response = await api.post<AuthResponse>(
        "/auth/register",
        dadosCadastro,
      );

      console.log("Resposta da API:", response.data);

      const { user, token } = response.data;

      setUser(user);

      await SecureStore.setItemAsync("user", JSON.stringify(user));

      await SecureStore.setItemAsync("token", token);
    } catch (error: any) {
      console.error("Erro ao registrar:", error);

      console.log("Mensagem:", error?.message);

      console.log("Código:", error?.code);

      console.log("Response:", error?.response?.data);

      console.log("Status:", error?.response?.status);

      throw error;
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // PROVIDER
  // =========================

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// =========================
// HOOK
// =========================

export const useAuth = () => useContext(AuthContext);
