import MenuInferior from "@/components/MenuInferior";
import SideMenu from "@/components/SideMenu";
import { useAuth } from "@/context/AuthProvider";
import { Ionicons } from "@expo/vector-icons";
import { Slot, useRouter, useSegments } from "expo-router";
import React, { useEffect, useRef, useState } from "react";

import {
  Animated,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function MainLayout() {
  const { user } = useAuth();
  const [showSideMenu, setShowSideMenu] = useState(false);
  const drawerWidth = Math.round(Dimensions.get("window").width * 0.78);
  const translateX = useRef(new Animated.Value(-drawerWidth)).current;

  React.useEffect(() => {
    Animated.timing(translateX, {
      toValue: showSideMenu ? 0 : -drawerWidth,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [showSideMenu, drawerWidth, translateX]);

  const closeMenu = React.useCallback(() => {
    setShowSideMenu(false);
  }, []);

  const handleMenuOpen = () => {
    setShowSideMenu(true);
  };

  const router = useRouter();
  const segments = useSegments();
  const [abaSelecionanda, setAbaSelecionada] = useState("corrida");

  useEffect(() => {
    const currentSegment = segments[segments.length - 1];

    if (currentSegment === "entregas") {
      setAbaSelecionada("entrega");
    } else if (currentSegment === "pay") {
      setAbaSelecionada("pay");
    } else {
      setAbaSelecionada("corrida");
    }
  }, [segments]);

  const handleTabPress = (tabKey: string) => {
    if (tabKey === "entrega") {
      router.push("/entregas");
      return;
    }

    if (tabKey === "corrida") {
      router.push("/home");
      return;
    }

    if (tabKey === "pay") {
      router.push("/(payment)/pay");
      return;
    }

    // Adicione outras rotas aqui no inferior
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerFloating}>
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <Pressable onPress={handleMenuOpen} style={styles.avatarContainer}>
              <View style={styles.avatarPlaceholder}>
                {user?.foto ? (
                  <Image
                    source={{
                      uri: user.foto,
                    }}
                    style={styles.avatarBadge}
                  />
                ) : (
                  <View style={styles.avatarBadge}>
                    <Ionicons
                      name="person-circle-outline"
                      size={58}
                      color="#c4c4c4"
                    />
                  </View>
                )}
              </View>
              <View style={styles.notificationDot} />
            </Pressable>
            <Text style={styles.greetingText}>
              Olá, {user?.name?.split(" ")[0] || "Usuário"}!
            </Text>
          </View>

          <Pressable style={styles.scanButton}>
            <Ionicons name="scan-outline" size={28} color="#000" />
          </Pressable>
        </View>
      </View>

      {showSideMenu && (
        <Pressable
          style={styles.backdrop}
          onPress={() => setShowSideMenu(false)}
        />
      )}

      <SideMenu visible={showSideMenu} onClose={closeMenu} drawerWidth={280} />

      <Slot />

      <MenuInferior
        abaSelecionanda={abaSelecionanda}
        setAbaSelecionada={setAbaSelecionada}
        onPressTab={handleTabPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerFloating: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: "#fff",
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
    // backgroundColor: "#BDC3C7",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  notificationDot: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: "#FF3B30",
    borderWidth: 2,
    borderColor: "#fff",
  },
  greetingText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
  },
  scanButton: {
    padding: 8,
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.28)",
    zIndex: 18,
  },
  avatarBadge: {
    width: 40,
    height: 40,
    borderRadius: 24,
  },
});
