

import DetalhesItem from "@/components/DetalhesItem";
import MetodosPagamento from "@/components/MetodosPagamento";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  BackHandler,
  Dimensions,
  Image,
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

export default function DetalhesEntrega({
  visible,
  onClose,
  duration = 200,
}: props) {
  const translateX = useRef(new Animated.Value(width)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const [isMounted, setIsMounted] = useState(visible);
  const [veiculo, setVeiculo] = useState<'moto' | 'carro'>('moto');
  const [showDetalhesItem, setShowDetalhesItem] = useState(false);
  const [showMetodosPagamento, setShowMetodosPagamento] = useState(false);

  useEffect(() => {
    const onBackPress = () => {
      if (showDetalhesItem) {
        setShowDetalhesItem(false);
        return true;
      }
      if (showMetodosPagamento) {
        setShowMetodosPagamento(false);
        return true;
      }
      if (visible) {
        onClose();
        return true;
      }
      return false;
    };
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
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
    <>
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
              <Text style={styles.headerTitle}>Detalhes da entrega</Text>
              <View style={{ width: 26 }} />
            </View>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* CARD DE ROTA */}
            <View style={styles.card}>
              <View style={styles.routeContainer}>
                <View style={styles.routeLineContainer}>
                  <View style={[styles.dot, { borderColor: '#00C4A1' }]} />
                  <View style={styles.line} />
                  <View style={[styles.dot, { borderColor: '#FF7A00' }]} />
                </View>
                <View style={styles.routeTextContainer}>
                  <View style={styles.locationItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.locationTitle}>Ac. Publico, 603</Text>
                      <Text style={styles.locationSubtitle}>Diogo • 69981400661</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#CCC" />
                  </View>

                  <View style={styles.routeDivider} />

                  <View style={styles.locationItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.locationTitle}>Avenida Bosque Mamoré - casa</Text>
                      <Text style={styles.locationSubtitle}>Deivison • +5569992198545</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#CCC" />
                  </View>
                </View>
              </View>
            </View>

            {/* INSERIR DETALHES */}
            <TouchableOpacity onPress={() => setShowDetalhesItem(true)} style={[styles.card, styles.rowBetween, { paddingVertical: 18 }]}>
              <View style={styles.row}>
                <MaterialCommunityIcons name="package-variant" size={22} color="#666" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.infoTitle}>Inserir detalhes do item</Text>
                  <Text style={styles.infoSubtitle}>Adicionar uma observação na entrega</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CCC" />
            </TouchableOpacity>

            {/* SELEÇÃO DE VEÍCULO */}
            <View style={styles.card}>
              <TouchableOpacity
                style={[styles.vehicleItem, veiculo === 'moto' && styles.vehicleActive]}
                onPress={() => setVeiculo('moto')}
              >
                <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3194/3194510.png' }} style={styles.vehicleImg} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={styles.row}>
                    <Text style={styles.vehicleTitle}>Entrega Moto</Text>
                    <Ionicons name="information-circle" size={16} color="#CCC" style={{ marginLeft: 4 }} />
                  </View>
                  <Text style={styles.vehicleSubtitle}>12:28 • 7 min</Text>
                  <Text style={styles.vehicleSubtitle}>40x44x38cm • 10kg</Text>
                </View>
                <View style={styles.priceContainer}>
                  <Text style={styles.priceText}>R$3,36</Text>
                  <View style={styles.promoBadge}>
                    <MaterialCommunityIcons name="ticket-percent" size={14} color="#00C4A1" />
                    <Text style={styles.promoText}>R$4,20</Text>
                  </View>
                </View>
                <View style={[styles.radio, veiculo === 'moto' && styles.radioActive]}>
                  {veiculo === 'moto' && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity
                style={[styles.vehicleItem, veiculo === 'carro' && styles.vehicleActive]}
                onPress={() => setVeiculo('carro')}
              >
                <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/743/743822.png' }} style={styles.vehicleImg} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={styles.row}>
                    <Text style={styles.vehicleTitle}>Entrega Carro</Text>
                    <Ionicons name="information-circle" size={16} color="#CCC" style={{ marginLeft: 4 }} />
                  </View>
                  <Text style={styles.vehicleSubtitle}>12:28 • 5 min</Text>
                  <Text style={styles.vehicleSubtitle}>100x70x60cm • 30kg</Text>
                </View>
                <View style={styles.priceContainer}>
                  <Text style={styles.priceText}>R$6,30</Text>
                </View>
                <View style={[styles.radio, veiculo === 'carro' && styles.radioActive]}>
                  {veiculo === 'carro' && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            </View>

            {/* VERIFICAR COM PIN */}
            <View style={styles.card}>
              <View style={[styles.rowBetween, { marginBottom: 15 }]}>
                <View style={styles.row}>
                  <Text style={styles.infoTitle}>Verificar com PIN</Text>
                  <Ionicons name="information-circle" size={16} color="#CCC" style={{ marginLeft: 4 }} />
                </View>
              </View>

              <View style={styles.rowBetween}>
                <Text style={styles.checkboxLabel}>Usar código de coleta</Text>
                <Ionicons name="checkbox" size={24} color="#111" />
              </View>
              <View style={[styles.rowBetween, { marginTop: 15 }]}>
                <Text style={styles.checkboxLabel}>Usar código de entrega</Text>
                <Ionicons name="checkbox" size={24} color="#111" />
              </View>
            </View>
          </ScrollView>

          {/* FOOTER FIXO */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={() => setShowMetodosPagamento(true)}>
              <View style={styles.paymentInfo}>
                <View style={styles.row}>
                  <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/196/196561.png' }} style={styles.cardBrand} />
                  <Text style={styles.cardNumber}>3048</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.balanceText}>Saldo disponível: </Text>
                  <Text style={[styles.balanceText, { color: '#00C4A1', fontWeight: 'bold' }]}>R$0,30</Text>
                  <Ionicons name="chevron-forward" size={14} color="#CCC" />
                </View>
              </View>
            </TouchableOpacity>
            <View style={styles.actionRow}>
              <View>
                <View style={styles.row}>
                  <Text style={styles.finalPrice}>R$3,36</Text>
                  <Ionicons name="information-circle" size={16} color="#CCC" style={{ marginLeft: 4 }} />
                </View>
                <View style={styles.footerPromoBadge}>
                  <Text style={styles.footerPromoText}>Até -R$0.84</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.btnConfirm}>
                <Text style={styles.btnConfirmText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
      <DetalhesItem
        visible={showDetalhesItem}
        onClose={() => setShowDetalhesItem(false)}
      />
      <MetodosPagamento
        visible={showMetodosPagamento}
        onClose={() => setShowMetodosPagamento(false)}
      />

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
    backgroundColor: "#F2F2F2",
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
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  // Rota
  routeContainer: { flexDirection: 'row' },
  routeLineContainer: { alignItems: 'center', width: 20, marginRight: 12, paddingVertical: 5 },
  dot: { width: 10, height: 10, borderRadius: 5, borderWidth: 2, backgroundColor: '#FFF' },
  line: { width: 1, flex: 1, backgroundColor: '#EEE', marginVertical: 4 },
  routeTextContainer: { flex: 1 },
  locationItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  locationTitle: { fontSize: 15, fontWeight: '600', color: '#111' },
  locationSubtitle: { fontSize: 13, color: '#999', marginTop: 2 },
  routeDivider: { height: 1, backgroundColor: '#F8F8F8', marginVertical: 12 },

  // Info
  infoTitle: { fontSize: 15, fontWeight: 'bold', color: '#111' },
  infoSubtitle: { fontSize: 12, color: '#AAA' },

  // Veículos
  vehicleItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  vehicleActive: { opacity: 1 },
  vehicleImg: { width: 45, height: 45, resizeMode: 'contain' },
  vehicleTitle: { fontSize: 15, fontWeight: 'bold' },
  vehicleSubtitle: { fontSize: 12, color: '#999' },
  priceContainer: { alignItems: 'flex-end', marginRight: 12 },
  priceText: { fontSize: 16, fontWeight: 'bold' },
  promoBadge: { flexDirection: 'row', alignItems: 'center' },
  promoText: { fontSize: 12, color: '#CCC', textDecorationLine: 'line-through', marginLeft: 2 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#DDD', justifyContent: 'center', alignItems: 'center' },
  radioActive: { borderColor: '#111' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#111' },
  divider: { height: 1, backgroundColor: '#F8F8F8', marginVertical: 10 },

  // Checkbox
  checkboxLabel: { fontSize: 15, color: '#555' },

  // Footer
  footer: {
    backgroundColor: '#FFF',
    padding: 16,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  paymentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  cardBrand: { width: 24, height: 15, resizeMode: 'contain' },
  cardNumber: { fontSize: 14, color: '#333', marginLeft: 8 },
  balanceText: { fontSize: 12, color: '#999' },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  finalPrice: { fontSize: 22, fontWeight: 'bold' },
  footerPromoBadge: { backgroundColor: '#00C4A1', paddingHorizontal: 6, borderRadius: 4, marginTop: 2 },
  footerPromoText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
  btnConfirm: {
    backgroundColor: '#FFD100',
    paddingVertical: 14,
    paddingHorizontal: 45,
    borderRadius: 12,
  },
  btnConfirmText: { fontSize: 18, fontWeight: 'bold', color: '#111' },
});