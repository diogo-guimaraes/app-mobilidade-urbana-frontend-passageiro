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

import { StatusBar } from "expo-status-bar";

import { useAuth } from "../context/AuthProvider";

export default function Login() {
  const router = useRouter();

  const colorScheme = useColorScheme();

  const { user, loading, login } = useAuth();

  // =========================
  // STATES
  // =========================

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  // =========================
  // REDIRECT
  // =========================

  useEffect(() => {
    if (user && !loading) {
      router.replace("/home");
    }
  }, [user, loading]);

  // =========================
  // LOGIN
  // =========================

  const handleLogin = async () => {
    try {
      await login(email.trim(), password);
    } catch (error: any) {
      console.log(error);

      alert("E-mail ou senha inválidos");
    }
  };

  // =========================
  // REGISTER
  // =========================

  const handleRegister = () => {
    router.push("/register");
  };

  // =========================
  // BUTTON ENABLE
  // =========================

  const buttonDisabled = !email.trim() || !password.trim() || loading;

  // =========================
  // LOADING SCREEN
  // =========================

  if (loading && !user) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-black">
        <ActivityIndicator size="large" color="#007AFF" />

        <Text className="mt-4 text-gray-600 dark:text-gray-300">
          Verificando autenticação...
        </Text>
      </View>
    );
  }

  // =========================
  // SCREEN
  // =========================

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        className="flex-1"
      >
        <View className="flex-1 justify-center items-center px-6">
          {/* TÍTULO */}

          <Text className="text-3xl font-bold text-black dark:text-white mb-10">
            Fazer login
          </Text>

          {/* EMAIL */}

          <TextInput
            className="
              w-full
              bg-gray-200
              dark:bg-gray-800
              border
              border-gray-300
              dark:border-gray-700
              rounded-2xl
              px-5
              py-4
              text-black
              dark:text-white
              mb-4
            "
            placeholder="Digite seu e-mail"
            placeholderTextColor={
              colorScheme === "dark" ? "#9CA3AF" : "#6B7280"
            }
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />

          {/* SENHA */}

          <TextInput
            className="
              w-full
              bg-gray-200
              dark:bg-gray-800
              border
              border-gray-300
              dark:border-gray-700
              rounded-2xl
              px-5
              py-4
              text-black
              dark:text-white
              mb-6
            "
            placeholder="Digite sua senha"
            placeholderTextColor={
              colorScheme === "dark" ? "#9CA3AF" : "#6B7280"
            }
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            editable={!loading}
          />

          {/* BOTÃO LOGIN */}

          <TouchableOpacity
            className={`
              w-full
              py-4
              rounded-2xl
              mb-5
              ${buttonDisabled ? "bg-gray-400" : "bg-green-600"}
            `}
            onPress={handleLogin}
            disabled={buttonDisabled}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white text-center font-bold text-lg">
                Fazer login
              </Text>
            )}
          </TouchableOpacity>

          {/* CADASTRO */}

          <TouchableOpacity onPress={handleRegister} disabled={loading}>
            <Text className="text-green-600 text-base font-medium">
              Não tem conta? Cadastre-se
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
