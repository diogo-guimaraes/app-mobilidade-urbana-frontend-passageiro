// app/components/CodigoVerificacao.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  BackHandler,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { api } from "../Services/api";
import { useAuth } from "../context/AuthProvider";
import { colors } from "../theme/colors";
import AppLogo from "./AppLogo";
import ErrorBanner from "./ErrorBanner";

interface props {
  visible: boolean;
  onClose: () => void;
  telefone: string;
  duration?: number;
}

export default function CodigoVerificacao({
  visible,
  onClose,
  telefone,
  duration = 200,
}: props) {
  const { width } = useWindowDimensions();
  const translateX = useRef(new Animated.Value(width)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const [isMounted, setIsMounted] = useState(visible);
  const { loginComToken } = useAuth();

  // Estados para os 4 dígitos do código
  const [code, setCode] = useState(["", "", "", ""]);

  // Estado do contador
  const [countdown, setCountdown] = useState(57);

  // Estados de requisição e validação de erro
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  // INPUT INVISÍVEL
  const hiddenInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (user && !loading) {
      router.replace("/home");
    }
  }, [user, loading]);

  // Confere o código digitado contra o backend e autentica o usuário
  const verificarCodigo = async (codigo: string) => {
    setIsLoading(true);

    try {
      const response = await api.post("auth/verificar-codigo", {
        telefone,
        codigo,
      });

      const { user, token } = response.data;

      await loginComToken(user, token);
    } catch (error) {
      console.log("Erro ao verificar código:", error);

      setHasError(true);
      setCode(["", "", "", ""]);

      hiddenInputRef.current?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  // Botão de apoio (dev): busca o código gerado pelo backend e preenche sozinho
  const receberCodigo = async () => {
    try {
      const response = await api.post("auth/enviar-codigo", { telefone });

      const codigo = String(response.data.codigo || "")
        .replace(/\D/g, "")
        .slice(0, 4);

      if (codigo.length !== 4) {
        return;
      }

      setHasError(false);

      const newCode = ["", "", "", ""];

      codigo.split("").forEach((digit, index) => {
        newCode[index] = digit;
      });

      // anima preenchendo os inputs
      newCode.forEach((digit, index) => {
        setTimeout(() => {
          setCode((prev) => {
            const updated = [...prev];
            updated[index] = digit;
            return updated;
          });
        }, index * 180);
      });

      // aguarda animação terminar antes de confirmar
      setTimeout(() => verificarCodigo(codigo), 1000);
    } catch (error) {
      console.log("Erro ao receber código:", error);
    }
  };

  // Timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (visible && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [visible, countdown]);

  // Voltar Android
  useEffect(() => {
    const onBackPress = () => {
      if (visible) {
        onClose();
        return true;
      }

      return false;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress,
    );

    return () => subscription.remove();
  }, [visible, onClose]);

  // Animação
  useEffect(() => {
    if (visible) {
      setIsMounted(true);

      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),

        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: duration * 0.8,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setTimeout(() => {
          hiddenInputRef.current?.focus();
        }, 100);
      });
    } else {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: width,
          duration,
          useNativeDriver: true,
        }),

        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: duration * 0.8,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => finished && setIsMounted(false));
    }
  }, [visible, translateX, overlayOpacity, duration]);

  // Limpa estados
  useEffect(() => {
    if (!visible) {
      setCode(["", "", "", ""]);
      setHasError(false);
      setIsLoading(false);
    }
  }, [visible]);

  // Handler digitação
  const handleChangeText = (text: string) => {
    const cleaned = text.replace(/\D/g, "").slice(0, 4);

    if (hasError) {
      setHasError(false);
    }

    const newCode = ["", "", "", ""];

    cleaned.split("").forEach((digit, index) => {
      newCode[index] = digit;
    });

    setCode(newCode);

    if (cleaned.length === 4) {
      hiddenInputRef.current?.blur();

      verificarCodigo(cleaned);
    }
  };

  const isInputActive = (index: number) => {
    if (index === 0) return true;

    return code[index - 1] !== "";
  };

  if (!isMounted) return null;

  return (
    <>
      <View style={[StyleSheet.absoluteFill, { zIndex: 30 }]}>
        {/* Fundo */}
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: "rgba(0,0,0,0.25)",
                opacity: overlayOpacity,
              },
            ]}
          />
        </Pressable>

        {/* Drawer */}
        <Animated.View
          style={[
            styles.drawer,
            {
              transform: [{ translateX }],
            },
          ]}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <Ionicons name="chevron-back" size={26} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* BODY */}
          <View style={styles.body}>
            {/* INPUT INVISÍVEL */}
            <TextInput
              ref={hiddenInputRef}
              value={code.join("")}
              onChangeText={handleChangeText}
              keyboardType="number-pad"
              maxLength={4}
              autoFocus
              caretHidden
              blurOnSubmit={false}
              contextMenuHidden
              editable={!isLoading}
              style={styles.hiddenInput}
            />

            {/* Logo */}
            <View style={styles.logoWrapper}>
              <AppLogo />
            </View>

            {/* Títulos */}
            <Text style={styles.title}>Insira o código</Text>

            <Text style={styles.subtitle}>
              Código de verificação enviado para SMS
            </Text>

            {/* Receber código */}
            <TouchableOpacity
              onPress={receberCodigo}
              style={styles.testClickableContainer}
              activeOpacity={0.7}
            >
              <Text style={styles.testClickableText}>Receber código</Text>
            </TouchableOpacity>

            {/* Inputs */}
            <Pressable
              style={styles.codeContainer}
              disabled={isLoading}
              onPress={() => {
                hiddenInputRef.current?.blur();

                setTimeout(() => {
                  hiddenInputRef.current?.focus();
                }, 50);
              }}
            >
              {code.map((digit, index) => {
                const active = isInputActive(index);

                return (
                  <View key={index} style={styles.inputWrapper}>
                    <View style={styles.codeInput}>
                      <Text
                        style={[
                          styles.codeText,
                          {
                            color: active ? colors.text : colors.disabledText,
                          },
                        ]}
                      >
                        {digit || "0"}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.inputLine,
                        {
                          backgroundColor: hasError
                            ? colors.error
                            : active
                              ? colors.primary
                              : colors.border,
                        },
                      ]}
                    />
                  </View>
                );
              })}
            </Pressable>

            {/* erro */}
            {hasError && (
              <View style={styles.errorContainer}>
                <ErrorBanner message="Código incorreto. Verifique o SMS e tente novamente." />
              </View>
            )}

            {/* botão */}
            <TouchableOpacity
              style={[
                styles.resendButton,
                isLoading
                  ? styles.resendButtonLoading
                  : countdown > 0
                    ? styles.resendButtonDisabled
                    : styles.resendButtonActive,
              ]}
              disabled={countdown > 0 || isLoading}
              onPress={() => {
                setCountdown(60);
                setHasError(false);
              }}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text
                  style={[
                    styles.resendButtonText,
                    countdown > 0
                      ? styles.resendButtonTextDisabled
                      : styles.resendButtonTextActive,
                  ]}
                >
                  {countdown > 0
                    ? `Reenviar em ${countdown} s`
                    : "Reenviar código"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  drawer: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: "100%",
    backgroundColor: colors.background,
  },

  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    padding: 4,
  },

  body: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 30,
    marginTop: 20,
  },

  hiddenInput: {
    position: "absolute",
    opacity: 0,
    width: 20,
    height: 20,
  },

  logoWrapper: {
    marginBottom: 24,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 3,
  },

  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 10,
    marginBottom: 20,
  },

  inputWrapper: {
    alignItems: "center",
    width: "20%",
  },

  codeInput: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    width: "100%",
  },

  codeText: {
    fontSize: 36,
    fontWeight: "400",
    textAlign: "center",
  },

  inputLine: {
    height: 1.5,
    width: "100%",
  },

  errorContainer: {
    width: "100%",
    paddingHorizontal: 10,
    alignItems: "flex-start",
    marginBottom: 20,
  },

  resendButton: {
    width: "100%",
    height: 55,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 40,
  },

  resendButtonDisabled: {
    backgroundColor: colors.disabledBg,
  },

  resendButtonActive: {
    backgroundColor: colors.primary,
  },

  resendButtonLoading: {
    backgroundColor: colors.primary,
  },

  resendButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },

  resendButtonTextDisabled: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.disabledText,
  },

  resendButtonTextActive: {
    color: colors.white,
  },

  testClickableContainer: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginBottom: 10,
  },

  testClickableText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
