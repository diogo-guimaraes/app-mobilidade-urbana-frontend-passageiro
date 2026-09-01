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
import AppLogo from "@/components/common/AppLogo";
import CarrosAleatorios from "@/components/auth/CarrosAleatorios";
import CodigoVerificacao from "@/components/auth/CodigoVerificacao";
import ErrorBanner from "@/components/common/ErrorBanner";
import GoogleIcon from "../components/icons/GoogleIcon";
import { api } from "../Services/api";

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
        <CarrosAleatorios />
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
                <Ionicons name="caret-down" size={12} color="#666" />
              </View>

              <TextInput
                style={styles.input}
                placeholder="(69) 91234-5678"
                placeholderTextColor="#CCC"
                keyboardType="phone-pad"
                maxLength={13} // Limite de caracteres considerando a máscara (2+1+5+1+4)
                value={phone}
                onChangeText={formatPhone}
                returnKeyType={isButtonEnabled ? "go" : "done"}
                onSubmitEditing={() =>
                  isButtonEnabled && verificarSeContaExiste()
                }
              />

              {phone.length > 0 && (
                <TouchableOpacity
                  onPress={() => setPhone("")}
                  style={styles.clearButton}
                >
                  <Ionicons name="close-circle" size={20} color="#CCC" />
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.inputUnderline} />

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
                <ActivityIndicator color="black" />
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
                color="grey"
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
                  color="grey"
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
    backgroundColor: "#FFF",
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
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 30,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  countryPicker: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 15,
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
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: "#000",
    fontWeight: "400",
  },
  inputUnderline: {
    height: 1,
    backgroundColor: "#FF5500",
    width: "100%",
    marginBottom: 25,
  },
  clearButton: {
    padding: 5,
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 30,
  },
  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#CCC",
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonActive: {
    backgroundColor: "#FF5500",
    borderColor: "#FF5500",
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  linkText: {
    textDecorationLine: "underline",
  },
  nextButton: {
    height: 55,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  nextButtonDisabled: {
    backgroundColor: "#F5F5F5",
  },
  nextButtonActive: {
    backgroundColor: "#FFD200",
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  nextButtonTextDisabled: {
    color: "#CCC",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#EEE",
  },
  dividerText: {
    paddingHorizontal: 15,
    color: "#AAA",
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    height: 55,
    borderRadius: 10,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  socialIcon: {
    width: 20,
    height: 20,
    marginRight: 15,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
});
