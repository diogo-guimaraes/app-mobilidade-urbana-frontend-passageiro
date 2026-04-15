import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Buscando from "./Buscando";

import Preferencias from "./Preferencias";

interface props {
  setSolicitacoesCorrida: () => void;
}

export default function MenuInferiorMotorista({ setSolicitacoesCorrida }: props) {
  // 💡 Estado para rastrear se estamos buscando corridas
  const [buscandoCorrida, setBuscandoCorrida] = useState(false);
  const [dialogPreferenciasVisible, setDialogPreferenciasVisibleLocal] = useState(false);

  // 💡 Lógica para alternar entre "Conectar" (false) e "Buscando" (true)
  const handleConnect = () => {
    if (!buscandoCorrida) {
      setBuscandoCorrida(true);
    }
  };

  // 💡 NOVA FUNÇÃO: Lógica para desconectar/parar a busca, via ícone lateral
  const handleDisconnect = () => {
    if (buscandoCorrida) {
      setBuscandoCorrida(false);
    }
  };

  // Lógica para o botão de Configurações
  const MostrarPreferencias = () => {
    setDialogPreferenciasVisibleLocal(true);
  };

  // 💡 Lógica para definir os estilos do botão com base no estado de busca
  const connectButtonStyle = [
    styles.connectButton,
    buscandoCorrida
      ? {
        backgroundColor: "transparent",
        shadowOpacity: 0,
        elevation: 0,
      }
      : {
        backgroundColor: "#FFD600",
      },
  ];

  return (
    <>
      <Preferencias
        visible={dialogPreferenciasVisible}
        onClose={() => setDialogPreferenciasVisibleLocal(false)}
        onDisconnect={handleDisconnect}
        buscandoCorrida={buscandoCorrida}
      />      

      <SafeAreaView style={styles.bottomMenuWrapper}>
        <View style={styles.bottomMenu}>
          {/* 🔹 Ícone lateral esquerdo (Config/Desconectar) */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={MostrarPreferencias}
            activeOpacity={0.8}
          >
            <Ionicons name="options-outline" size={40} color="#000" />
            {/* 🔴 Pontinho vermelho de status */}
            <View style={[styles.redDot]} />
          </TouchableOpacity>


          {/* 🔹 Botão central "Conectar" / "Buscando" */}
          <TouchableOpacity
            style={connectButtonStyle}
            onPress={handleConnect}
            activeOpacity={0.9}
          >
            {buscandoCorrida ? (
              <Buscando />
            ) : (
              <Text style={styles.connectTextLarge}>Conectar</Text>
            )}
          </TouchableOpacity>

          {/* 🔹 Ícone lateral direito */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={setSolicitacoesCorrida}
            activeOpacity={0.8}
          >
            <Ionicons name="document-text-outline" size={40} color="#000" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  bottomMenuWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  bottomMenu: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  iconButton: {
    position: "relative",
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  redDot: {
    position: "absolute",
    top: 6,
    left: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "red",
  },
  connectButton: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    width: "70%",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    minHeight: 56,
  },
  connectTextLarge: {
    color: "black",
    fontSize: 30,
    fontWeight: "600",
    textAlign: "center",
  },
});
