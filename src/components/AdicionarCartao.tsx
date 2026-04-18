import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  BackHandler,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

const { width } = Dimensions.get("window");

interface props {
  visible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function AdicionarCartao({
  visible,
  onClose,
  duration = 200,
}: props) {
  const translateX = useRef(new Animated.Value(width)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const [isMounted, setIsMounted] = useState(visible);

  // Estados para os inputs
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  useEffect(() => {
    const onBackPress = () => {
      if (visible) {
        onClose();
        return true;
      }
      return false;
    };
    const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
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
      ]).start();
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

  if (!isMounted) return null;

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 30 }]}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: "rgba(0,0,0,0.25)", opacity: overlayOpacity },
          ]}
        />
      </Pressable>

      <Animated.View style={[styles.drawer, { transform: [{ translateX }] }]}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="chevron-back" size={26} color="#111" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Adicionar cartão</Text>
            <View style={{ width: 26 }} />
          </View>
        </View>

        {/* BODY */}
        <View style={styles.body}>
          {/* NÚMERO DO CARTÃO */}
          <Text style={styles.label}>Número do cartão</Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="credit-card-outline" size={22} color="#999" style={styles.inputIconLeft} />
            <TextInput
              style={styles.input}
              placeholder="Cartão de crédito / déb"
              placeholderTextColor="#BBB"
              keyboardType="numeric"
              value={cardNumber}
              onChangeText={setCardNumber}
            />
            <TouchableOpacity>
              <Ionicons name="camera-outline" size={24} color="#111" />
            </TouchableOpacity>
          </View>

          {/* DATA E CVV */}
          <View style={styles.row}>
            <View style={styles.column}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Data de validade</Text>
                <Ionicons name="help-circle-outline" size={16} color="#999" />
              </View>
              <TextInput
                style={styles.inputSmall}
                placeholder="MM/AA"
                placeholderTextColor="#BBB"
                keyboardType="numeric"
                maxLength={5}
                value={expiry}
                onChangeText={setExpiry}
              />
            </View>

            <View style={styles.column}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Código de segurança</Text>
                <Ionicons name="help-circle-outline" size={16} color="#999" />
              </View>
              <TextInput
                style={styles.inputSmall}
                placeholder="CVV"
                placeholderTextColor="#BBB"
                keyboardType="numeric"
                maxLength={4}
                value={cvv}
                onChangeText={setCvv}
              />
            </View>
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.btnAdd, { opacity: (cardNumber && expiry && cvv) ? 1 : 0.4 }]} 
            disabled={!(cardNumber && expiry && cvv)}
          >
            <Text style={styles.btnAddText}>Adicionar</Text>
          </TouchableOpacity>

          <View style={styles.securityRow}>
            <MaterialCommunityIcons name="shield-check" size={16} color="#999" />
            <Text style={styles.securityText}>
              As informações do seu cartão serão armazenadas com segurança
            </Text>
          </View>
        </View>
      </Animated.View>
    </View>
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
    backgroundColor: "#fff",
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111",
  },
  body: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 20,
    height: 55,
  },
  inputIconLeft: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 15,
  },
  column: {
    flex: 1,
  },
  inputSmall: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: 15,
    height: 55,
    fontSize: 16,
    color: "#000",
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  btnAdd: {
    backgroundColor: "#E0E0E0", // Cor desativada na imagem
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 15,
  },
  btnAddText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#888",
  },
  securityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  securityText: {
    fontSize: 12,
    color: "#999",
    marginLeft: 6,
    textAlign: "center",
    lineHeight: 16,
  },
});