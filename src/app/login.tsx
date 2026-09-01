// app/login.tsx
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AppLogo from "../components/AppLogo";
import CodigoVerificacao from "../components/CodigoVerificacao";
import ErrorBanner from "../components/ErrorBanner";
import GoogleIcon from "../components/icons/GoogleIcon";
import { api } from "../Services/api";
import { colors } from "../theme/colors";

export default function Login() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showCodigoVerificacao, setShowCodigoVerificacao] = useState(false);

  const [loadingVerificarConta, setLoadingVerificarConta] = useState(false);
  const [erroLogin, setErroLogin] = useState("");

  // Aplica a máscara: 01 23456 7890
  const formatPhone = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    let formatted = cleaned;

    if (cleaned.length > 2) {
      formatted = `${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
    }
    if (cleaned.length > 7) {
      formatted = `${cleaned.slice(0, 2)} ${cleaned.slice(2, 7)} ${cleaned.slice(7, 11)}`;
    }

    setPhone(formatted);
  };

  const verificarSeContaExiste = async () => {
    setErroLogin("");

    try {
      setLoadingVerificarConta(true);

      // remove máscara e espaços
      const telefone = phone.replace(/\D/g, "");

      const response = await api.get("/auth/verifica-se-conta-existe", {
        params: {
          telefone,
        },
      });

      const contaExiste = response.data.contaExiste;

      // se existir conta -> abre modal código
      if (contaExiste) {
        setShowCodigoVerificacao(true);

        return;
      }

      // se não existir -> vai para registro
      router.push({
        pathname: "/register",
        params: {
          telefone,
        },
      });
    } catch (error: any) {
      console.log("Erro ao verificar se conta existe:", error);

      const mensagem = error?.response
        ? "Não foi possível verificar seu número. Tente novamente."
        : "Não foi possível conectar. Verifique sua internet.";

      setErroLogin(mensagem);
    } finally {
      setLoadingVerificarConta(false);
    }
  };

  // Habilita se tiver os 11 dígitos numéricos (que resultam em 13 caracteres com espaços)
  const isButtonEnabled =
    phone.replace(/\D/g, "").length === 11 && acceptedTerms;

  return (
    <>
      <CodigoVerificacao
        visible={showCodigoVerificacao}
        onClose={() => setShowCodigoVerificacao(false)}
        telefone={phone.replace(/\D/g, "")}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header com Logo */}
          <View style={styles.header}>
            <AppLogo />
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>Insira o número de telefone</Text>

            {/* Input de Telefone */}
            <View style={styles.inputWrapper}>
              <View style={styles.countryPicker}>
                <Image
                  source={{ uri: "https://flagcdn.com/w40/br.png" }}
                  style={styles.flag}
                />
                <Text style={styles.countryCode}>+55</Text>
                <Ionicons
                  name="caret-down"
                  size={12}
                  color={colors.textSecondary}
                />
              </View>

              <TextInput
                style={styles.input}
                placeholder="(69) 91234-5678"
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
                maxLength={13} // Limite de caracteres considerando a máscara (2+1+5+1+4)
                value={phone}
                onChangeText={formatPhone}
              />

              {phone.length > 0 && (
                <TouchableOpacity
                  onPress={() => setPhone("")}
                  style={styles.clearButton}
                >
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* Termos e Condições */}
            <TouchableOpacity
              style={styles.termsContainer}
              onPress={() => setAcceptedTerms(!acceptedTerms)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.radioButton,
                  acceptedTerms && styles.radioButtonActive,
                ]}
              >
                {acceptedTerms && (
                  <Ionicons name="checkmark" size={14} color="white" />
                )}
              </View>
              <Text style={styles.termsText}>
                Li e aceito os{" "}
                <Text style={styles.linkText}>
                  Termos de Uso e a Política de Privacidade
                </Text>
              </Text>
            </TouchableOpacity>

            {erroLogin ? <ErrorBanner message={erroLogin} /> : null}

            {/* Botão Próximo */}
            <TouchableOpacity
              onPress={() => verificarSeContaExiste()}
              style={[
                styles.nextButton,
                isButtonEnabled
                  ? styles.nextButtonActive
                  : styles.nextButtonDisabled,
              ]}
              disabled={!isButtonEnabled || loadingVerificarConta}
            >
              {loadingVerificarConta ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text
                  style={[
                    styles.nextButtonText,
                    !isButtonEnabled && styles.nextButtonTextDisabled,
                  ]}
                >
                  Próximo
                </Text>
              )}
            </TouchableOpacity>

            {/* Divisor */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Login Social */}
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => router.push("/loginEmail")}
            >
              <FontAwesome5
                name="envelope"
                size={20}
                color={colors.textSecondary}
                style={styles.socialIcon}
              />
              <Text style={styles.socialButtonText}>Entrar com email</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => setErroLogin("Login com Google em breve.")}
            >
              <View style={styles.socialIcon}>
                <GoogleIcon size={20} />
              </View>
              <Text style={styles.socialButtonText}>Continuar com Google</Text>
            </TouchableOpacity>

            {Platform.OS === "ios" && (
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => setErroLogin("Login com Apple em breve.")}
              >
                <FontAwesome5
                  name="apple"
                  size={20}
                  color={colors.textSecondary}
                  style={styles.socialIcon}
                />
                <Text style={styles.socialButtonText}>Continuar com Apple</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    alignItems: "center",
    paddingTop: 56,
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    marginTop: 36,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 22,
    color: colors.text,
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
    marginBottom: 18,
  },
  countryPicker: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginRight: 12,
  },
  flag: {
    width: 20,
    height: 14,
    marginRight: 5,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: "500",
    marginRight: 5,
    color: colors.text,
  },
  input: {
    flex: 1,
    fontSize: 17,
    color: colors.text,
    fontWeight: "500",
    paddingVertical: 10,
    textAlign: "center",
  },
  clearButton: {
    padding: 5,
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  linkText: {
    textDecorationLine: "underline",
    color: colors.primary,
    fontWeight: "600",
  },
  nextButton: {
    height: 50,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 22,
  },
  nextButtonDisabled: {
    backgroundColor: colors.disabledBg,
  },
  nextButtonActive: {
    backgroundColor: colors.primary,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.white,
  },
  nextButtonTextDisabled: {
    color: colors.disabledText,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    paddingHorizontal: 15,
    color: colors.textMuted,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    height: 48,
    borderRadius: 16,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  socialIcon: {
    width: 20,
    height: 20,
    marginRight: 15,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
});
