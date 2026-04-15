// app/home.tsx
import FolhaInferiorPassageiro from "@/components/FolhaInferiorPassageiro";
import Map from "@/components/Map";
import MenuInferiorPassageiro from "@/components/MenuInferiorPassageiro";
import SideMenu from "@/components/SideMenu";
import SolicitarCorrida from "@/components/SolicitarCorrida";
import TopMenu from "@/components/TopMenu";
import { useAuth } from "@/context/AuthProvider";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { Region } from "react-native-maps";

export default function Home() {
  const { user, loading: authLoading, usuario } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState("corrida");
  const [region, setRegion] = useState<Region | null>(null);
  const [destinationModalVisible, setDestinationModalVisible] = useState(false);
  const [solicitacoesCorrida, setSolicitacoesCorrida] = useState(false);

  // ✨ NOVO ESTADO: Armazena a região inicial do usuário (sem o ajuste de offset)
  const userInitialRegion = useRef<Region | null>(null);

  // ✨ NOVO: Estado para armazenar o índice do BottomSheet
  const [bottomSheetIndex, setBottomSheetIndex] = useState<number>(0);

  // ✨ NOVO: Estado do modal de ganhos foi elevado para cá
  const [ganhoModalVisivel, setGanhoModalVisivel] = useState(false);

  const drawerWidth = Math.round(Dimensions.get("window").width * 0.78);
  const translateX = useRef(new Animated.Value(-drawerWidth)).current;

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: menuVisible ? 0 : -drawerWidth,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [menuVisible, drawerWidth, translateX]);

  // 🔹 Função para fechar o menu
  const closeMenu = useCallback(() => {
    setMenuVisible(false);
  }, []);

  // ✨ NOVA FUNÇÃO: Coordena abertura do menu e fechamento do modal
  const handleMenuOpen = () => {
    if (ganhoModalVisivel) {
      // Pequeno delay para deixar a animação do modal acontecer antes do SideMenu
      setMenuVisible(true);
      setGanhoModalVisivel(false);
      // setTimeout(() => setGanhoModalVisivel(false), 500); // mesmo tempo da animação
      return;
    }
    setMenuVisible(true);
  };

  // 🔹 Redirecionar para login se não estiver autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  const handleUserLocationFound = useCallback((userRegion: Region) => {
    console.log("handleUserLocationFound teste:");

    userInitialRegion.current = {
      ...userRegion,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };

    // 🔹 Ajuste de deslocamento vertical inicial (para o snap point 0)
    const offsetLatitude = 0.0064;
    const adjustedRegion: Region = {
      ...userRegion,
      latitude: userRegion.latitude - offsetLatitude, // 🔹 Move o mapa para cima
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    setRegion(adjustedRegion);
  }, []);

  // ✨ NOVO: Função para ajustar o mapa quando o BottomSheet muda de estado
  const handleSheetStateChange = useCallback((index: number) => {
    console.log(usuario, "BottomSheet Index1:", index);
    // 🔹 Atualiza o estado que será passado para o Map
    setBottomSheetIndex(index);
    if (!userInitialRegion.current) {
      // Garante que temos a localização do usuário antes de ajustar
      return;
    }
  }, []);

  const onChangeBottomSheetMotorista = useCallback((index: number) => {
    console.log(usuario, "onChangeBottomSheetMotorista Index:", index);
    console.log(user, "user home:");

    setBottomSheetIndex(index);
    if (!userInitialRegion.current) {
      return;
    }
  }, []);

  // 🔹 Mostrar loading enquanto verifica autenticação
  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Verificando autenticação...</Text>
      </View>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* <StatusBar style={colorScheme === "dark" ? "light" : "dark"} /> */}

      {/* 🔹 Mapa com ajuste de posicionamento */}
      <Map
        region={region}
        onRegionChange={setRegion}
        onUserLocationFound={handleUserLocationFound}
        bottomSheetIndex={bottomSheetIndex}
        isGanhoModalVisible={ganhoModalVisivel}
      />

      {/* Exibe o card se estiver recebendo chamada */}

      <TopMenu onMenuPress={handleMenuOpen} />

      {/* Backdrop para SideMenu */}
      {menuVisible && (
        <Pressable
          style={styles.backdrop}
          onPress={() => setMenuVisible(false)}
        />
      )}

      {/* Side Menu - zIndex menor */}
      <SideMenu visible={menuVisible} onClose={closeMenu} drawerWidth={280} />

      {/* FolhaInferior */}
      <>
        {menuVisible && (
          <Pressable
            style={styles.backdrop}
            onPress={() => setMenuVisible(false)}
          />
        )}

        <FolhaInferiorPassageiro
          onPressInput={() => setDestinationModalVisible(true)}
          onSheetChange={handleSheetStateChange}
        />

        <SolicitarCorrida
          visible={destinationModalVisible}
          onClose={() => setDestinationModalVisible(false)}
        />

        <MenuInferiorPassageiro
          selectedTab={selectedTab}
          onTabPress={setSelectedTab}
        />
      </>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.28)",
    zIndex: 18, // zIndex para o backdrop do SideMenu
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
});
