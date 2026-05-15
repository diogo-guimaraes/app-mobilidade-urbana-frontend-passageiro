import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const { height } = Dimensions.get("window");

interface Props {
  visible: boolean;
  onClose: () => void;
  headerHeight: number;
}

export default function AlterarFoto({
  visible,
  onClose,
  headerHeight,
}: Props) {
  const slideAnim = useRef(new Animated.Value(height)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const [isMounted, setIsMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      setIsMounted(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsMounted(false);
      });
    }
  }, [visible]);

  if (!isMounted) return null;

  return (
    <>
      <Pressable
        style={[StyleSheet.absoluteFill, { zIndex: 10 }]}
        onPress={onClose}
      >
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: "rgba(0,0,0,0.45)",
              opacity: overlayOpacity,
            },
          ]}
        />
      </Pressable>

      <Animated.View
        style={[styles.modal, { transform: [{ translateY: slideAnim }] }]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#999" />
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          <Text style={styles.title}>Foto de perfil</Text>
          <Text style={styles.subtitle}>
            Carregar uma foto verdadeira sua pode ajudar você a conseguir uma corrida mais rápido. Agradecemos por ajudar a construir uma comunidade mais segura conosco!
          </Text>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity onPress={onClose} style={styles.button}>
            <Text style={styles.buttonText}>Tirar foto</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={onClose} style={[styles.button, { marginTop: 12 }]}>
            <Text style={styles.buttonText}>Selecionar da galeria</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  modal: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 30, // Cantos bem arredondados conforme a imagem
    borderTopRightRadius: 30,
    zIndex: 20,
    paddingBottom: 40, // Espaçamento inferior para dispositivos sem home bar
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  closeButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    padding: 4,
  },
  body: {
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 16,
    color: "#333",
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: 24,
  },
  button: {
    backgroundColor: "#f0f0f0", // Cinza claro conforme a imagem
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
});