import axios from "axios";
import * as SecureStore from "expo-secure-store";

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Chamado pelo AuthProvider assim que monta, pra permitir deslogar
// automaticamente quando qualquer requisição voltar 401 (token expirado/inválido).
type UnauthorizedHandler = () => void;
let onUnauthorized: UnauthorizedHandler | null = null;

export const setUnauthorizedHandler = (handler: UnauthorizedHandler) => {
  onUnauthorized = handler;
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 🔥 só desloga de verdade se a chamada que falhou ERA autenticada
    // (mandava um Bearer token). Endpoints públicos também podem responder
    // 401 por motivos que nada têm a ver com sessão — ex: código de
    // verificação errado em `verificar-codigo`, senha errada em `login`.
    // Sem essa checagem, QUALQUER 401 (mesmo de uma tela pública) derrubava
    // a sessão de um usuário já logado em outra aba/tela.
    const tinhaToken = Boolean(error?.config?.headers?.Authorization);

    if (error?.response?.status === 401 && tinhaToken) {
      onUnauthorized?.();
    }

    return Promise.reject(error);
  },
);
