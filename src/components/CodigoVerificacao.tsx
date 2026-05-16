// app/components/CodigoVerificacao.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
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

  // Estados para os 4 dígitos do código de verificação
  const [code, setCode] = useState(["", "", "", ""]);

  // Estado para o contador do reenvio de SMS
  const [countdown, setCountdown] = useState(57);

  // Input invisível responsável por receber toda a digitação
  const hiddenInputRef = useRef<TextInput>(null);

  // Regressão do contador corrigida para evitar conflito de tipos
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (visible && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [visible, countdown]);

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
        // Mantém teclado aberto focando no input invisível
        setTimeout(() => hiddenInputRef.current?.focus(), 100);
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

  const handleChangeText = (text: string) => {
    const cleaned = text.replace(/\D/g, "").slice(0, 4);

    const newCode = ["", "", "", ""];

    cleaned.split("").forEach((digit, index) => {
      newCode[index] = digit;
    });

    setCode(newCode);
  };

  if (!isMounted) return null;

  return (
    <>
      <View style={[StyleSheet.absoluteFill, { zIndex: 30 }]}>
        {/* Fundo escurecido */}
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

        {/* Drawer deslizante */}
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
            {/* Input invisível */}
            <TextInput
              ref={hiddenInputRef}
              value={code.join("")}
              onChangeText={handleChangeText}
              keyboardType="numeric"
              maxLength={4}
              autoFocus
              caretHidden
              style={styles.hiddenInput}
            />

            {/* Logo 99 */}
            <Text style={styles.logoText}>99</Text>

            {/* Badge de Lucros */}
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>
                💸 Acelerador de Lucros +40% do CDI
              </Text>
            </View>

            {/* Títulos centrais */}
            <Text style={styles.title}>Insira o código</Text>

            <Text style={styles.subtitle}>
              Código de verificação enviado para SMS
            </Text>

            {/* Grid visual dos 4 dígitos */}
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => hiddenInputRef.current?.focus()}
              style={styles.codeContainer}
            >
              {code.map((digit, index) => (
                <View key={index} style={styles.inputWrapper}>
                  <View style={styles.codeInput}>
                    <Text style={styles.codeText}>
                      {digit || "0"}
                    </Text>
                  </View>

                  <View style={styles.inputLine} />
                </View>
              ))}
            </TouchableOpacity>

            {/* Botão de Reenvio */}
            <TouchableOpacity
              style={[
                styles.resendButton,
                countdown > 0
                  ? styles.resendButtonDisabled
                  : styles.resendButtonActive,
              ]}
              disabled={countdown > 0}
              onPress={() => setCountdown(60)}
            >
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
    width: 1,
    height: 1,
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
    marginBottom: 40,
  },

  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 10,
    marginBottom: 50,
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
    color: "#000",
    textAlign: "center",
  },

  inputLine: {
    height: 1.5,
    backgroundColor: "#F2A199",
    width: "100%",
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

  resendButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },

  resendButtonTextDisabled: {
    color: "#A0A0A0",
  },
});