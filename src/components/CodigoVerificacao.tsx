// app/components/CodigoVerificacao.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  BackHandler,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

interface props {
  visible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function CodigoVerificacao({
  visible,
  onClose,
  duration = 200,
}: props) {
  const translateX = useRef(new Animated.Value(width)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const [isMounted, setIsMounted] = useState(visible);

  // Estados para os 4 dígitos do código
  const [code, setCode] = useState(["", "", "", ""]);

  // Estado do contador
  const [countdown, setCountdown] = useState(57);

  // Estados de requisição e validação de erro
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  // INPUT INVISÍVEL
  const hiddenInputRef = useRef<TextInput>(null);
// Função de teste para simular recebimento do código do backend
  const receberCodigo = () => {
    console.log("Solicitando/simulando recebimento de código do backend...");
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

  // Limpa os estados de erro e código quando o drawer fechar ou abrir
  useEffect(() => {
    if (!visible) {
      setCode(["", "", "", ""]);
      setHasError(false);
      setIsLoading(false);
    }
  }, [visible]);

  // textInput handler
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
      setIsLoading(true);
      setHasError(false);
      
      hiddenInputRef.current?.blur();

      setTimeout(() => {
        setIsLoading(false);
        setHasError(true);
        setCode(["", "", "", ""]);
        
        setTimeout(() => {
          hiddenInputRef.current?.focus();
        }, 100);
      }, 2000);
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
              <Ionicons name="chevron-back" size={26} color="#000" />
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
            <Text style={styles.logoText}>99</Text>

            {/* Badge */}
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>
                💸 Acelerador de Lucros +40% do CDI
              </Text>
            </View>

            {/* Títulos */}
            <Text style={styles.title}>Insira o código</Text>

            <Text style={styles.subtitle}>
              Código de verificação enviado para SMS
            </Text>

            {/* Texto clicável de Teste abaixo do SMS */}
            <TouchableOpacity 
              onPress={receberCodigo} 
              style={styles.testClickableContainer}
              activeOpacity={0.7}
            >
              <Text style={styles.testClickableText}>Receber código</Text>
            </TouchableOpacity>

            {/* Inputs visuais */}
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
                            color: active ? "#000" : "#D9D9D9",
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
                            ? "#D32F2F"
                            : active
                            ? "#F2A199"
                            : "#E5E5E5",
                        },
                      ]}
                    />
                  </View>
                );
              })}
            </Pressable>

            {/* Texto de Erro de Código Inválido */}
            {hasError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>
                  Código incorreto. Verifique o SMS e tente novamente.
                </Text>
              </View>
            )}

            {/* Reenvio / Botão Dinâmico de Ação */}
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
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <Text
                  style={[
                    styles.resendButtonText,
                    countdown > 0 && styles.resendButtonTextDisabled,
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
    backgroundColor: "#FFF",
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

  logoText: {
    fontSize: 48,
    fontWeight: "900",
    color: "#000",
    textAlign: "center",
  },

  badgeContainer: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 10,
    marginBottom: 40,
  },

  badgeText: {
    color: "#2E7D32",
    fontSize: 12,
    fontWeight: "600",
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
    textAlign: "center",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,
    color: "#333",
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

  errorText: {
    color: "#D32F2F",
    fontSize: 13,
    fontWeight: "500",
    textAlign: "left",
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
    backgroundColor: "#F5F5F5",
  },

  resendButtonActive: {
    backgroundColor: "#FFD200",
  },

  resendButtonLoading: {
    backgroundColor: "#FFD200", // Cor ativa (amarela) definida para o estado de loading
  },

  resendButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },

  resendButtonTextDisabled: {
    fontSize: 16,
    fontWeight: "600",
    color: "#A0A0A0",
  },

   testClickableContainer: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginBottom: 10,
  },

  testClickableText: {
    fontSize: 16,
    color: "#007AFF", // Azul estilo link nativo iOS/Android
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});