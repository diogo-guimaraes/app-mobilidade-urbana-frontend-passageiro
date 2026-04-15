// context/AuthProvider.tsx
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface Usuario {
  id: string;
  email: string;
  nome: string;
  sobrenome: string;
  tipoUsuario: string;
}

interface AuthContextType {
  user: string | null;
  loading: boolean;
  usuario: Usuario | null;
  login: (username: string) => void;
  logout: () => void;
  register: (usuario: any) => void; // Adicione esta linha
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  usuario: null,
  login: () => {},
  logout: () => {},
  register: () => {}, // Adicione esta linha
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  // Simula busca do usuário do storage
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Simulando busca de usuário no AsyncStorage
        const storedUser = await new Promise<string | null>((resolve) =>
          setTimeout(() => {
            // Aqui você pode verificar se há um usuário salvo
            // Por enquanto, sempre retorna null para forçar login
            resolve(null);
          }, 500)
        );
        setUser(storedUser);
      } catch (error) {
        console.error("Erro ao buscar usuário:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = (username: string) => {
    setLoading(true);
    setTimeout(() => {
      setUser(username);
      setLoading(false);
      // Aqui você salvaria o usuário no AsyncStorage
    }, 1000);
  };

  const logout = () => {
    setUser(null);
    // Aqui você limparia o AsyncStorage
  };

  const register = (novoUsuario: Usuario) => {
    setLoading(true);
    setTimeout(() => {
      // Aqui você poderia salvar no AsyncStorage
      setUsuario(novoUsuario);
      setUser(novoUsuario.email);
      setLoading(false);
    }, 1000);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, register, usuario }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
