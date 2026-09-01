// components/corrida/ConfirmarEndereco.tsx
//
// Passo de confirmação entre escolher o destino (ParaOndeVamos) e ver os
// preços (FolhaEscolherOferta). Mapa interativo (o usuário pode mover e
// aproximar pra conferir direitinho) já enquadrando origem+destino, com a
// distância em linha reta entre os dois. Segue o mesmo padrão visual do
// fluxo de login: botão fixo no rodapé (stepContainer), sem espaço
// sobrando, cores consistentes com o resto do app.
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  BackHandler,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";

import { InterfaceEndereco } from "@/app/(main)/home";

interface Props {
  visible: boolean;
  origem: InterfaceEndereco | null;
  endereco: InterfaceEndereco | null;
  onConfirmar: () => void;
  onVoltar: () => void;
}

// Distância em linha reta (haversine) — só pra dar um contexto rápido de
// escala aqui na confirmação; a distância/tempo de rota de verdade (ruas,
// trânsito) é calculada depois, na tela de preços.
const RAIO_TERRA_KM = 6371;

const calcularDistanciaKm = (
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
) => {
  const paraRad = (graus: number) => (graus * Math.PI) / 180;

  const dLat = paraRad(b.latitude - a.latitude);
  const dLon = paraRad(b.longitude - a.longitude);

  const lat1 = paraRad(a.latitude);
  const lat2 = paraRad(b.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return RAIO_TERRA_KM * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

export default function ConfirmarEndereco({
  visible,
  origem,
  endereco,
  onConfirmar,
  onVoltar,
}: Props) {
  const [isMounted, setIsMounted] = useState(visible);

  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    setIsMounted(visible);
  }, [visible]);

  useEffect(() => {
    const onBackPress = () => {
      if (visible) {
        onVoltar();

        return true;
      }

      return false;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress,
    );

    return () => subscription.remove();
  }, [visible, onVoltar]);

  // 🔥 enquadra origem+destino toda vez que a tela abre com um endereço novo
  useEffect(() => {
    if (!visible || !endereco || !origem) return;

    const coordenadas = [
      { latitude: origem.latitude, longitude: origem.longitude },
      { latitude: endereco.latitude, longitude: endereco.longitude },
    ];

    const id = setTimeout(() => {
      mapRef.current?.fitToCoordinates(coordenadas, {
        edgePadding: { top: 100, right: 60, bottom: 60, left: 60 },
        animated: true,
      });
    }, 300);

    return () => clearTimeout(id);
  }, [visible, origem, endereco]);

  if (!isMounted || !endereco) return null;

  const distanciaKm =
    origem && endereco ? calcularDistanciaKm(origem, endereco) : null;

  return (
    <View style={[StyleSheet.absoluteFill, styles.container]}>
      <View style={styles.mapaContainer}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={StyleSheet.absoluteFill}
          initialRegion={{
            latitude: endereco.latitude,
            longitude: endereco.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
        >
          {/* 🔥 marker de origem com conteúdo customizado — o `pinColor`
              do Marker padrão não funciona de forma confiável no Android
              (só aceita hue, não hex), por isso os dois pinos apareciam
              idênticos (vermelho) antes */}
          {origem && (
            <Marker
              coordinate={{
                latitude: origem.latitude,
                longitude: origem.longitude,
              }}
              anchor={{ x: 0.5, y: 0.5 }}
              title="Partida"
              tracksViewChanges={true}
            >
              <View style={styles.origemMarker}>
                <View style={styles.origemMarkerPonto} />
              </View>
            </Marker>
          )}

          <Marker
            coordinate={{
              latitude: endereco.latitude,
              longitude: endereco.longitude,
            }}
            anchor={{ x: 0.5, y: 0.5 }}
            title="Destino"
            tracksViewChanges={true}
          >
            <View style={styles.destinoMarker}>
              <View style={styles.destinoMarkerPonto} />
            </View>
          </Marker>

          {/* 🔥 tracejado ligando origem ao destino */}
          {origem && (
            <Polyline
              coordinates={[
                { latitude: origem.latitude, longitude: origem.longitude },
                {
                  latitude: endereco.latitude,
                  longitude: endereco.longitude,
                },
              ]}
              strokeColor="#111"
              strokeWidth={3}
              lineDashPattern={[8, 8]}
            />
          )}
        </MapView>

        <TouchableOpacity
          onPress={onVoltar}
          activeOpacity={0.8}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={26} color="#000" />
        </TouchableOpacity>

        {distanciaKm !== null && (
          <View style={styles.distanciaBadge}>
            <Ionicons name="navigate" size={14} color="#000" />

            <Text style={styles.distanciaText}>
              ≈ {distanciaKm.toFixed(1)} km em linha reta
            </Text>
          </View>
        )}
      </View>

      <View style={styles.stepContainer}>
        <View>
          <Text style={styles.title}>Confirme o destino</Text>

          <View style={styles.enderecoCard}>
            <View style={styles.pinBadge}>
              <Ionicons name="location" size={18} color="#FFF" />
            </View>

            <View style={styles.enderecoTexto}>
              <Text style={styles.enderecoNome} numberOfLines={1}>
                {endereco.name || "Destino selecionado"}
              </Text>

              <Text style={styles.enderecoFormatado} numberOfLines={2}>
                {endereco.formattedAddress}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.confirmButton}
          onPress={onConfirmar}
          activeOpacity={0.8}
        >
          <Text style={styles.confirmButtonText}>Confirmar destino</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 30,
    backgroundColor: "#FFF",
  },

  mapaContainer: {
    flex: 1,
  },

  // 🔥 origem: bolinha branca com centro preto (mesmo visual do Map.tsx)
  origemMarker: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#666",
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
  },

  origemMarkerPonto: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: "#111",
  },

  // 🔥 destino: bolinha laranja com centro branco — mesmo padrão visual
  // da origem (círculo + pontinho), só invertendo as cores, pra ficar
  // simétrico igual à origem (um ícone de pin fica "torto" no centro,
  // porque o formato de gota do ícone não é simétrico)
  destinoMarker: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: "#FFF",
    backgroundColor: "#FF5500",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },

  destinoMarkerPonto: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: "#FFF",
  },

  backButton: {
    position: "absolute",
    top: 56,
    left: 18,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
  },

  distanciaBadge: {
    position: "absolute",
    top: 56,
    right: 18,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
  },

  distanciaText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: "600",
    color: "#000",
  },

  // 🔥 mesmo padrão do fluxo de login: o mapa (flex:1) empurra esse bloco
  // pro rodapé, o botão fica sempre colado embaixo, sem espaço sobrando
  stepContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000",
    marginBottom: 20,
  },

  enderecoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F7F7F7",
    borderRadius: 14,
    padding: 16,
  },

  pinBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FF5500",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  enderecoTexto: {
    flex: 1,
  },

  enderecoNome: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
    marginBottom: 4,
  },

  enderecoFormatado: {
    fontSize: 14,
    color: "#666",
  },

  confirmButton: {
    backgroundColor: "#FFD200",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 24,
  },

  confirmButtonText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "700",
  },
});
