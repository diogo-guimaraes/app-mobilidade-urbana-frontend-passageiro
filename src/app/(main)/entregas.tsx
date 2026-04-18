import InformacoesDestinario from "@/components/InformacoesDestinario";
import InformacoesRemetente from "@/components/InformacoesRemetente";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Entregas() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<"Enviar" | "Receber">("Enviar");
  const [showInformacoesRemetente, setShowInformacoesRemetente] = useState(false);
  const [showInformacoesDestinario, setShowInformacoesDestinario] = useState(false);

  return (
    <>
      <InformacoesRemetente
        visible={showInformacoesRemetente}
        onClose={() => setShowInformacoesRemetente(false)}
      />
      <InformacoesDestinario
        visible={showInformacoesDestinario}
        onClose={() => setShowInformacoesDestinario(false)}
      />
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header de Navegação */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.headerBtn}
          >
            <Ionicons name="chevron-back" size={28} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.headerBtn}
          >
            <Ionicons name="close" size={28} color="#000" />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Título da Marca */}
          <View style={styles.brandContainer}>
            <Text style={styles.brandSubTitle}>VOCÊ PRECISA,</Text>
            <View style={styles.brandTitleRow}>
              <View style={styles.arrowBadge}>
                <Ionicons name="arrow-forward" size={22} color="white" />
              </View>
              <Text style={styles.brandTitleBold}>99</Text>
              <Text style={styles.brandTitleLight}>Entrega</Text>
            </View>
          </View>

          {/* Ilustrações de Veículos */}
          <View style={styles.illustrationContainer}>
            <Image
              source={{
                uri: "https://cdn-icons-png.flaticon.com/512/744/744465.png",
              }}
              style={styles.imageMoto}
            />
            <Image
              source={{
                uri: "https://cdn-icons-png.flaticon.com/512/1986/1986937.png",
              }}
              style={styles.imageCarro}
            />
          </View>

          {/* Card com Afastamento Lateral */}
          <View style={[styles.card, { marginBottom: insets.bottom + 20 }]}>
            {/* Tabs */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                onPress={() => setActiveTab("Enviar")}
                style={styles.tabItem}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "Enviar"
                      ? styles.tabTextActive
                      : styles.tabTextInactive,
                  ]}
                >
                  Enviar
                </Text>
                {activeTab === "Enviar" && <View style={styles.tabIndicator} />}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveTab("Receber")}
                style={styles.tabItem}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "Receber"
                      ? styles.tabTextActive
                      : styles.tabTextInactive,
                  ]}
                >
                  Receber
                </Text>
                {activeTab === "Receber" && <View style={styles.tabIndicator} />}
              </TouchableOpacity>
            </View>

            {/* Conteúdo Dinâmico */}
            <View style={styles.dynamicContent}>
              {activeTab === "Enviar" ? (
                <>
                  <TouchableOpacity onPress={() => setShowInformacoesRemetente(true)}>
                    <View style={styles.addressRow}>
                      <View style={[styles.dot, styles.dotTeal]} />
                      <View style={styles.addressInfo}>
                        <Text style={styles.addressTitle} numberOfLines={1}>
                          Rua Brasília, 2930 - Pen6 Marketing
                        </Text>
                        <Text style={styles.addressSub}>Diogo • 69981400661</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#E0E0E0" />
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => setShowInformacoesDestinario(true)} style={styles.inputButton}>
                    <View style={[styles.dot, styles.dotOrange]} />
                    <Text style={styles.inputButtonText}>Entregar para</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    onPress={() => setShowInformacoesRemetente(true)}
                    style={[styles.inputButton, { marginBottom: 16 }]}
                  >
                    <View style={[styles.dot, styles.dotTeal]} />
                    <Text style={styles.inputButtonText}>Enviar de</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowInformacoesDestinario(true)}>
                    <View style={styles.addressRow}>
                      <View style={[styles.dot, styles.dotOrange]} />
                      <View style={styles.addressInfo}>
                        <Text style={styles.addressTitle} numberOfLines={1}>
                          Rua Brasília, 2930 - Pen6 Marketing
                        </Text>
                        <Text style={styles.addressSub}>Diogo • 69981400661</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#E0E0E0" />
                    </View>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </ScrollView>
      </View></>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerBtn: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  brandContainer: {
    alignItems: "center",
    marginTop: 86,
  },
  brandSubTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  brandTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  arrowBadge: {
    backgroundColor: "#FFD700",
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  brandTitleBold: {
    fontSize: 40,
    fontWeight: "900",
    color: "#000",
  },
  brandTitleLight: {
    fontSize: 40,
    fontWeight: "300",
    color: "#000",
    marginLeft: 8,
  },
  illustrationContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    marginVertical: 40,
  },
  imageMoto: {
    width: 130,
    height: 90,
    resizeMode: "contain",
  },
  imageCarro: {
    width: 140,
    height: 90,
    resizeMode: "contain",
  },
  card: {
    backgroundColor: "#F8F8F8",
    // Afastamento das laterais
    marginHorizontal: 16,
    // Bordas arredondadas em cima
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    // Preenchimento interno
    paddingHorizontal: 24,
    paddingTop: 32,
    flex: 1,
    // Sombra suave
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 30,
  },
  tabItem: {
    marginRight: 35,
    alignItems: "center",
  },
  tabText: {
    fontSize: 22,
    fontWeight: "bold",
  },
  tabTextActive: {
    color: "#000",
  },
  tabTextInactive: {
    color: "#BBB",
  },
  tabIndicator: {
    height: 4,
    width: "100%",
    backgroundColor: "#FF6600",
    borderRadius: 2,
    marginTop: 4,
  },
  dynamicContent: {
    gap: 10,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2.5,
    marginRight: 14,
  },
  dotTeal: {
    borderColor: "#2DD4BF",
  },
  dotOrange: {
    borderColor: "#FF6600",
  },
  addressInfo: {
    flex: 1,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  addressSub: {
    fontSize: 14,
    color: "#999",
    marginTop: 2,
  },
  inputButton: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F0F0F0",
    marginTop: 8,
  },
  inputButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
});
