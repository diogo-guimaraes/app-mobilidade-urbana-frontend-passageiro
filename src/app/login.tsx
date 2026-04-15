// app/login.tsx
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthProvider";

import { StatusBar } from "expo-status-bar";

export default function Login() {
  const [username, setUsername] = useState("");
  const { user, loading, login } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();

  // 🔹 Redireciona automaticamente quando o usuário é definido
  useEffect(() => {
    if (user && !loading) {
      router.replace("/home");
    }
  }, [user, loading, router]);

  const handleLogin = () => {
    if (username.trim().length > 0) {
      login(username);
    } else {
      alert("Digite um usuário");
    }
  };

  const handleRegister = () => {
    router.push("/register");
  };

  // 🔹 Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-black">
        <ActivityIndicator size="large" color="#007AFF" />
        <Text className="mt-4 text-gray-600 dark:text-gray-300">
          Verificando autenticação...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 p-4 bg-white dark:bg-black">
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        className="flex-1"
      >
        <View className="flex-1 justify-center items-center">
          <Text className="text-2xl text-black dark:text-white mb-8">
            Login
          </Text>

          <TextInput
            className="w-full bg-gray-200 dark:bg-gray-700 border-2 border-green-500 dark:border-green-600 rounded-full m-4 p-4 text-black dark:text-white"
            placeholder="Digite seu usuário"
            placeholderTextColor={
              colorScheme === "dark" ? "#9CA3AF" : "#6B7280"
            }
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />

          <TouchableOpacity
            className="bg-blue-500 w-48 p-4 rounded-full mb-4"
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white text-center font-semibold">
                Login
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={handleRegister} disabled={loading}>
            <Text className="text-blue-500 text-lg text-center">
              Não tem conta? Cadastre-se
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
