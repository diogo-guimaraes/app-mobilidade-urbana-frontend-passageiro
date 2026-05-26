import { useAuth } from "@/context/AuthProvider";
import { AnimationConfig, useSlideAnimation } from "@/hooks/useSlideAnimation";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  BackHandler,
  Image,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import CentralAjuda from "./CentralAjuda";
import CentralGanhos from "./CentralGanhos";
import ConvidarMotorista from "./ConvidarMotorista";
import HistoricoMensagens from "./HistoricoMensagens";
import Preferencias from "./Preferencias";
import HorasDirigindo from "./usuario/HorasDirigindo";
import MeusVeiculos from "./usuario/MeusVeiculos";
import PerfilUsuario from "./usuario/PerfilUsuario";
interface SideMenuProps {
  visible: boolean;
  onClose: () => void;
  drawerWidth: number;
  animationConfig?: AnimationConfig;
  menuItems?: MenuItem[];
  showOverlay?: boolean;
  enableSwipeGesture?: boolean;
}

interface MenuItem {
  icon: string;
  label: string;
  onPress?: () => void;
  color?: string;
}

const defaultMenuItems: MenuItem[] = [
  { icon: "time-outline", label: "Ganhos" },
  { icon: "time-outline", label: "Indique um amigo" },
  { icon: "chatbubble-outline", label: "Notificações" },
  { icon: "shield-checkmark-outline", label: "Central de Ajuda" },
  { icon: "card-outline", label: "Veículo" },
  { icon: "card-outline", label: "Horas dirigindo" },
  { icon: "settings-outline", label: "Preferências" },
];

export default function SideMenu({
  visible,
  onClose,
  drawerWidth,
  animationConfig = {},
  menuItems = defaultMenuItems,
  showOverlay = true,
  enableSwipeGesture = true,
}: SideMenuProps) {
  const { user, logout } = useAuth();
  const { translateX, overlayOpacity, closeAnimation } = useSlideAnimation(
    visible,
    drawerWidth,
    animationConfig,
  );

  const [isMounted, setIsMounted] = useState(visible);
  const [showHistoricoMensagens, setShowHistoricoMensagens] = useState(false);
  const [showCentralAjuda, setShowCentralAjuda] = useState(false);
  const [showPefilUsuario, setShowPerfilUsuario] = useState(false);
  const [showMeusVeiculos, setShowMeusVeiculos] = useState(false);
  const [showConvidarMotorista, setShowConvidarMotorista] = useState(false);
  const [showHorasDirigindo, setShowHorasDirigindo] = useState(false);
  const [showCentralGannhos, setShowCentralGannhos] = useState(false);
  const [showPreferencias, setShowPreferencias] = useState(false);

  const handleDisconnect = () => {};

  const closeMenu = useCallback(() => {
    closeAnimation(onClose);
  }, [closeAnimation, onClose]);

  useEffect(() => {
    // Se o dialog estiver aberto, fecha
    const onBackPress = () => {
      if (showPreferencias) {
        setShowPreferencias(false);
        return true;
      }
      if (showCentralGannhos) {
        setShowCentralGannhos(false);
        return true;
      }
      if (showPefilUsuario) {
        setShowPerfilUsuario(false);
        return true;
      }
      if (showConvidarMotorista) {
        setShowConvidarMotorista(false);
        return true;
      }
      if (showHorasDirigindo) {
        setShowHorasDirigindo(false);
        return true;
      }
      if (showHistoricoMensagens) {
        setShowHistoricoMensagens(false);
        return true;
      }
      if (showCentralAjuda) {
        setShowCentralAjuda(false);
        return true;
      }
      if (showMeusVeiculos) {
        setShowMeusVeiculos(false);
        return true;
      }
      if (visible) {
        closeMenu();
        return true;
      }
      return false;
    };
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress,
    );
    return () => subscription.remove();
  }, [visible, closeMenu]);

  useEffect(() => {
    if (visible) {
      setIsMounted(true);
    } else {
      const closeDelay = animationConfig?.duration ?? 300;
      const t = setTimeout(() => setIsMounted(false), closeDelay + 20);
      return () => clearTimeout(t);
    }
  }, [visible, animationConfig?.duration]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => enableSwipeGesture,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return enableSwipeGesture && Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) translateX.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -50 || gestureState.vx < -0.5) {
          closeMenu();
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            damping: animationConfig.damping || 20,
            stiffness: animationConfig.stiffness || 90,
          }).start();
        }
      },
    }),
  ).current;

  const handleLogout = () => {
    closeMenu();
    setTimeout(() => logout(), 300);
  };

  const menuSelecionado = (item: MenuItem) => {
    if (item.label === "Indique um amigo") {
      setShowConvidarMotorista(true);
    }
    if (item.label === "Notificações") {
      setShowHistoricoMensagens(true);
    }
    if (item.label === "Central de Ajuda") {
      setShowCentralAjuda(true);
    }
    if (item.label === "Veículo") {
      setShowMeusVeiculos(true);
    }
    if (item.label === "Horas dirigindo") {
      setShowHorasDirigindo(true);
    }
    if (item.label === "Ganhos") {
      setShowCentralGannhos(true);
    }
    if (item.label === "Preferências") {
      setShowPreferencias(true);
    }
  };

  if (!isMounted) return null;

  return (
    <>
      <HistoricoMensagens
        visible={showHistoricoMensagens}
        onClose={() => setShowHistoricoMensagens(false)}
      />
      <CentralAjuda
        visible={showCentralAjuda}
        onClose={() => setShowCentralAjuda(false)}
      />
      <PerfilUsuario
        visible={showPefilUsuario}
        onClose={() => setShowPerfilUsuario(false)}
      />
      <MeusVeiculos
        visible={showMeusVeiculos}
        onClose={() => setShowMeusVeiculos(false)}
      />
      <ConvidarMotorista
        visible={showConvidarMotorista}
        onClose={() => setShowConvidarMotorista(false)}
      />
      <HorasDirigindo
        visible={showHorasDirigindo}
        onClose={() => setShowHorasDirigindo(false)}
      />
      <CentralGanhos
        visible={showCentralGannhos}
        onClose={() => setShowCentralGannhos(false)}
      />

      <Preferencias
        visible={showPreferencias}
        onClose={() => setShowPreferencias(false)}
        onDisconnect={handleDisconnect}
        buscandoCorrida={false}
      />

      <View style={[StyleSheet.absoluteFill, { zIndex: 20 }]}>
        {showOverlay && (
          <TouchableWithoutFeedback onPress={closeMenu}>
            <Animated.View
              style={[styles.overlay, { opacity: overlayOpacity }]}
            />
          </TouchableWithoutFeedback>
        )}

        <Animated.View
          style={[
            styles.sideMenu,
            {
              width: drawerWidth,
              transform: [{ translateX }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          {/* HEADER DE PERFIL */}
          <View style={styles.profileSection}>
            <TouchableOpacity onPress={() => setShowPerfilUsuario(true)}>
              {/* <Image
                source={{ uri: "https://i.pravatar.cc/150?img=2" }}
                style={styles.avatar}
              /> */}
              <View style={styles.avatarWrapper}>
                  {user?.foto ? (
                    <Image
                      source={{
                        uri: user.foto,
                      }}
                      style={styles.avatar}
                    />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Ionicons
                        name="person-circle-outline"
                        size={110}
                        color="#c4c4c4"
                      />
                    </View>
                  )}

                  
                </View>
            </TouchableOpacity>

            <View style={styles.nameRow}>
              <Text style={styles.userName}>{user?.name.split(" ")[0]}</Text>
              <Text style={styles.ratingText}> · 4,82 ★</Text>
            </View>
            <View style={styles.separator} />
            {/* <View style={styles.statDivider} /> */}
          </View>
          <View style={styles.menuList}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={() => menuSelecionado(item)}
              >
                <Text
                  style={[styles.menuText, item.color && { color: item.color }]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}

            {user && (
              <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                <Text style={[styles.menuText, styles.logoutText]}>Sair</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
  },
  sideMenu: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#fff",
    paddingTop: 40,
    elevation: 8,
  },
  profileSection: {
    alignItems: "center",
    paddingHorizontal: 18,
    marginBottom: 20,
  },
  // avatar: {
  //   width: 85,
  //   height: 85,
  //   borderRadius: 42.5,
  //   marginBottom: 15,
  // },
    avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#f0f0f0",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  userName: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#111",
  },
  ratingText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111",
  },
  separator: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  // LISTA DE ITENS
  menuList: {
    paddingHorizontal: 18,
    marginTop: 10,
  },
  menuItem: {
    paddingVertical: 12,
  },
  menuText: {
    fontSize: 22,
    color: "#111",
    fontWeight: "500",
  },
  logoutText: {
    color: "#FF4D4D",
  },
  avatarPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f3f3",
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 15,
  },
});
