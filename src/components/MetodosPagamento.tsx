import { FontAwesome, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  BackHandler,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const { width } = Dimensions.get("window");

interface props {
  visible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function MetodosPagamento({
  visible,
  onClose,
  duration = 200,
}: props) {
  const translateX = useRef(new Animated.Value(width)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const [isMounted, setIsMounted] = useState(visible);
  
  // Estado para controlar o método selecionado
  const [selectedMethod, setSelectedMethod] = useState("card_3048");

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

  const RadioButton = ({ active }: { active: boolean }) => (
    <View style={[styles.radioOuter, active && styles.radioOuterActive]}>
      {active && <View style={styles.radioInner} />}
    </View>
  );

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
            <Text style={styles.headerTitle}>Métodos de pagamento</Text>
            <View style={{ width: 26 }} />
          </View>
        </View>

        <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
          
          {/* SEÇÃO 99PAY */}
          <View style={styles.pay99Card}>
            <View style={styles.pay99Header}>
              <Text style={styles.pay99HeaderText}>99Pay</Text>
            </View>
            <View style={styles.pay99Content}>
              <View style={styles.pay99Row}>
                <View style={styles.pay99IconBg}>
                    <Text style={styles.pay99IconText}>99Pay</Text>
                </View>
                <View style={styles.payTextContainer}>
                  <Text style={styles.methodTitle}>Saldo na 99</Text>
                  <Text style={styles.balanceText}>R$ 0,30</Text>
                  <Text style={styles.subtext}>Saldo insuficiente</Text>
                </View>
                <TouchableOpacity style={styles.depositBtn}>
                    <Text style={styles.depositBtnText}>Depositar via Pix</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* CARTÕES SALVOS */}
          <View style={styles.sectionCard}>
            <TouchableOpacity 
              style={styles.methodItem} 
              onPress={() => setSelectedMethod("card_3048")}
            >
              <View style={styles.iconContainer}>
                <FontAwesome name="cc-mastercard" size={20} color="#eb001b" />
              </View>
              <Text style={styles.methodMainText}>3048</Text>
              <RadioButton active={selectedMethod === "card_3048"} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.methodItem}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons name="credit-card-plus-outline" size={24} color="#666" />
              </View>
              <Text style={styles.methodMainText}>Ad. cartão crédito/débito</Text>
              <Ionicons name="chevron-forward" size={18} color="#CCC" />
            </TouchableOpacity>
          </View>

          {/* OUTROS MÉTODOS */}
          <View style={styles.sectionCard}>
            <TouchableOpacity 
              style={styles.methodItem}
              onPress={() => setSelectedMethod("money")}
            >
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons name="cash" size={24} color="#f5a623" />
              </View>
              <Text style={styles.methodMainText}>Dinheiro</Text>
              <RadioButton active={selectedMethod === "money"} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity 
              style={styles.methodItem}
              onPress={() => setSelectedMethod("machine")}
            >
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons name="cellphone-nfc" size={24} color="#f5a623" />
              </View>
              <Text style={styles.methodMainText}>Maquininha de cartão</Text>
              <RadioButton active={selectedMethod === "machine"} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity 
              style={styles.methodItem}
              onPress={() => setSelectedMethod("pix")}
            >
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons name="pix" size={24} color="#00bdae" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.methodMainText}>Pix (pré-pago)</Text>
                <Text style={styles.subtextInfo}>Para esta opção, é necessário pagar antecipadamente</Text>
              </View>
              <RadioButton active={selectedMethod === "pix"} />
            </TouchableOpacity>
          </View>

        </ScrollView>
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
    backgroundColor: "#F4F4F4",
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
    paddingHorizontal: 12,
  },
  // CARD 99PAY
  pay99Card: {
    backgroundColor: "#FFD100",
    borderRadius: 20,
    marginTop: 15,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#FFD100",
  },
  pay99Header: {
    paddingHorizontal: 15,
    paddingVertical: 4,
  },
  pay99HeaderText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#000",
  },
  pay99Content: {
    backgroundColor: "#FFF",
    margin: 2,
    borderRadius: 18,
    padding: 15,
  },
  pay99Row: {
    flexDirection: "row",
    alignItems: "center",
  },
  pay99IconBg: {
    backgroundColor: "#FFD100",
    padding: 4,
    borderRadius: 4,
  },
  pay99IconText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  payTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  methodTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#000",
  },
  balanceText: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  subtext: {
    fontSize: 12,
    color: "#999",
  },
  depositBtn: {
    backgroundColor: "#FFD100",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  depositBtnText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#000",
  },
  // SEÇÕES DE MÉTODOS
  sectionCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    marginTop: 15,
    paddingHorizontal: 15,
  },
  methodItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
  },
  iconContainer: {
    width: 35,
    alignItems: "flex-start",
  },
  methodMainText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
  },
  subtextInfo: {
    fontSize: 11,
    color: "#999",
    marginTop: 2,
    paddingRight: 10,
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
  },
  // RADIO BUTTON
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CCC",
    justifyContent: "center",
    alignItems: "center",
  },
  radioOuterActive: {
    borderColor: "#000",
    backgroundColor: "#000",
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFF",
  },
});