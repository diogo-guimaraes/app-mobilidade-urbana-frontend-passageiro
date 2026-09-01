import { useAuth } from "@/context/AuthProvider";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppLogo from "../components/AppLogo";
import ErrorBanner from "../components/ErrorBanner";
import { colors } from "../theme/colors";

export default function LoginEmail() {
  const router = useRouter();

  const { user, loading, login } = useAuth();

  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const [erroLogin, setErroLogin] = useState("");
  const [erroEmail, setErroEmail] = useState("");

  useEffect(() => {
    if (user && !loading) {
      router.replace("/home");
    }
  }, [user, loading]);

  const validarEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return regex.test(email.trim());
  };

  const handleAvancar = () => {
    if (!validarEmail(email)) {
      setErroEmail("Digite um e-mail válido");
      return;
    }

    setErroEmail("");
    setStep(2);
  };

  const handleLogin = async () => {
    try {
      setErroLogin("");

      await login(email.trim(), senha);

      router.replace("/home");
    } catch (error: any) {
      console.log(error);

      setErroLogin("E-mail ou senha inválidos");
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboard}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* HEADER */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backButton}
              >
                <Ionicons name="chevron-back" size={24} color={colors.text} />
              </TouchableOpacity>

              <AppLogo />

              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>
                  🔐 Acesse sua conta com segurança
                </Text>
              </View>
            </View>

            <View style={styles.content}>
              {/* STEP 1 */}
              {step === 1 && (
                <View style={styles.stepContainer}>
                  <View>
                    <Text style={styles.title}>
                      Qual é o seu endereço de e-mail?
                    </Text>

                    <View
                      style={[
                        styles.inputWrapper,
                        erroEmail && styles.inputWrapperError,
                      ]}
                    >
                      <TextInput
                        placeholder="nome@exemplo.com"
                        placeholderTextColor={colors.textMuted}
                        style={styles.input}
                        value={email}
                        onChangeText={(text) => {
                          setEmail(text);

                          if (erroEmail) {
                            setErroEmail("");
                          }
                        }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={!loading}
                      />
                    </View>

                    {!!erroEmail && <ErrorBanner message={erroEmail} />}
                  </View>

                  <View style={styles.footerButtons}>
                    <TouchableOpacity
                      style={styles.roundedButton}
                      onPress={() => router.back()}
                    >
                      <Feather
                        name="arrow-left"
                        size={22}
                        color={colors.text}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      disabled={!email.trim()}
                      style={[
                        styles.nextButton,
                        email.trim()
                          ? styles.nextButtonActive
                          : styles.nextButtonDisabled,
                      ]}
                      onPress={handleAvancar}
                    >
                      <Text
                        style={[
                          styles.nextButtonText,
                          !email.trim() && styles.nextButtonTextDisabled,
                        ]}
                      >
                        Avançar
                      </Text>

                      <Feather
                        name="arrow-right"
                        size={18}
                        color={
                          email.trim() ? colors.white : colors.disabledText
                        }
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <View style={styles.stepContainer}>
                  <View>
                    <Text style={styles.title}>Informe sua senha</Text>

                    <Text style={styles.highlightText}>{email}</Text>

                    <View
                      style={[
                        styles.inputWrapper,
                        erroLogin && styles.inputWrapperError,
                      ]}
                    >
                      <TextInput
                        placeholder="Digite sua senha"
                        placeholderTextColor={colors.textMuted}
                        secureTextEntry
                        style={styles.input}
                        value={senha}
                        onChangeText={(text) => {
                          setSenha(text);

                          if (erroLogin) {
                            setErroLogin("");
                          }
                        }}
                        autoCapitalize="none"
                        editable={!loading}
                      />
                    </View>

                    {!!erroLogin && <ErrorBanner message={erroLogin} />}
                  </View>

                  <View style={styles.footerButtons}>
                    <TouchableOpacity
                      style={styles.roundedButton}
                      onPress={() => setStep(1)}
                      disabled={loading}
                    >
                      <Feather
                        name="arrow-left"
                        size={22}
                        color={colors.text}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      disabled={!senha || loading}
                      onPress={handleLogin}
                      style={[
                        styles.nextButton,
                        senha && !loading
                          ? styles.nextButtonActive
                          : styles.nextButtonDisabled,
                      ]}
                    >
                      {loading ? (
                        <ActivityIndicator color={colors.white} />
                      ) : (
                        <>
                          <Text
                            style={[
                              styles.nextButtonText,
                              (!senha || loading) &&
                                styles.nextButtonTextDisabled,
                            ]}
                          >
                            Entrar
                          </Text>

                          <Feather
                            name="arrow-right"
                            size={18}
                            color={
                              senha && !loading
                                ? colors.white
                                : colors.disabledText
                            }
                          />
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  keyboard: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
  },

  header: {
    alignItems: "center",
    paddingTop: 36,
    paddingHorizontal: 20,
  },

  backButton: {
    position: "absolute",
    left: 20,
    top: 36,
  },

  badgeContainer: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 10,
  },

  badgeText: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: "600",
  },

  content: {
    flex: 1,
    paddingHorizontal: 30,
    marginTop: 40,
    paddingBottom: 30,
  },

  stepContainer: {
    flex: 1,
    justifyContent: "space-between",
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 24,
  },

  highlightText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 24,
    color: colors.primary,
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },

  inputWrapperError: {
    borderColor: colors.error,
  },

  input: {
    flex: 1,
    fontSize: 17,
    color: colors.text,
    fontWeight: "500",
    paddingVertical: 10,
  },

  footerButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 40,
  },

  roundedButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.disabledBg,
    justifyContent: "center",
    alignItems: "center",
  },

  nextButton: {
    height: 50,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 24,
  },

  nextButtonDisabled: {
    backgroundColor: colors.disabledBg,
  },

  nextButtonActive: {
    backgroundColor: colors.primary,
  },

  nextButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.white,
    marginRight: 8,
  },

  nextButtonTextDisabled: {
    color: colors.disabledText,
  },
});
