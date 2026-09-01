// app/home.tsx
import ConfirmarEndereco from "@/components/corrida/ConfirmarEndereco";
import FolhaEscolherOferta from "@/components/corrida/FolhaEscolherOferta";
import ViagemComParada from "@/components/corrida/ViagemComParada";
import FolhaInferior from "@/components/corrida/FolhaInferior";
import Map from "@/components/corrida/Map";
import ParaOndeVamos from "@/components/corrida/ParaOndeVamos";

import { useAuth } from "@/context/AuthProvider";
import { useUi } from "@/context/UiContext";

import { Ionicons } from "@expo/vector-icons";

import { useRouter } from "expo-router";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Region } from "react-native-maps";

export interface InterfaceEndereco {
  name: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  distancia: string;
  order?: number; // 👈 Adicione a "?" aqui para torná-lo opcional!
}

const itinerarioInicial: InterfaceEndereco[] = [
  {
    name: "",
    formattedAddress: "",
    latitude: 0,
    longitude: 0,
    distancia: "0km",
    order: 0,
  },

  {
    name: "",
    formattedAddress: "",
    latitude: 0,
    longitude: 0,
    distancia: "0km",
    order: 1,
  },
];

export default function Home() {
  const [showBuscarEndereco, setShowBuscarEndereco] = useState(false);

  const { user, loading: authLoading } = useAuth();

  const { setModalVisible } = useUi();

  const router = useRouter();

  const [region, setRegion] = useState<Region | null>(null);

  // 🔥 NOVO
  const [showParaOndeVamos, setShowParaOndeVamos] = useState(false);

  const [showViagemComParada, setShowViagemComParada] = useState(false);

  // 🔥 passo de confirmação entre escolher endereço e ver preços
  const [showConfirmarEndereco, setShowConfirmarEndereco] = useState(false);

  // 🔥 pra "voltar" da confirmação saber pra qual tela reabrir
  const [origemConfirmacao, setOrigemConfirmacao] = useState<
    "para-onde-vamos" | "viagem-com-parada"
  >("para-onde-vamos");

  const [showFolhaEscolherOferta, setShowFolhaEscolherOferta] = useState(false);
  const [showFolhaInferior, setShowFolhaInferior] = useState(true);
  const [progesseguirParaOferta, setProgesseguirParaOferta] = useState(false);
  const userInitialRegion = useRef<Region | null>(null);

  const [bottomSheetIndex, setBottomSheetIndex] = useState<number>(0);

  const [mapBottomPadding, setMapBottomPadding] = useState(320);

  // 🔥 Estado global do itinerário
  const [itinerario, setItinerario] =
    useState<InterfaceEndereco[]>(itinerarioInicial);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  // 🔥 sincroniza modal global
  useEffect(() => {
    setModalVisible(
      showParaOndeVamos ||
        showViagemComParada ||
        showConfirmarEndereco ||
        showFolhaEscolherOferta,
    );
  }, [
    showParaOndeVamos,
    showViagemComParada,
    showConfirmarEndereco,
    showFolhaEscolherOferta,
    setModalVisible,
  ]);

  // 🔥 recentraliza mapa
  useEffect(() => {
    if (showViagemComParada && userInitialRegion.current) {
      setRegion({
        ...userInitialRegion.current,

        latitude: userInitialRegion.current.latitude,

        latitudeDelta: 0.01,

        longitudeDelta: 0.01,
      });
    }
  }, [showViagemComParada]);

  const handleUserLocationFound = useCallback(
    (userRegion: Region, addressName?: string) => {
      userInitialRegion.current = {
        ...userRegion,

        latitudeDelta: 0.01,

        longitudeDelta: 0.01,
      };

      const adjustedRegion: Region = {
        ...userRegion,

        latitude: userRegion.latitude,

        latitudeDelta: 0.01,

        longitudeDelta: 0.01,
      };

      setRegion(adjustedRegion);

      // 🔥 injeta origem automaticamente
      if (addressName) {
        setItinerario((prev) =>
          prev.map((item, index) =>
            index === 0
              ? {
                  ...item,

                  name: addressName,

                  formattedAddress: addressName,

                  latitude: userRegion.latitude,

                  longitude: userRegion.longitude,
                }
              : item,
          ),
        );
      }
    },
    [],
  );

  const handleSheetStateChange = useCallback((index: number) => {
    setBottomSheetIndex(index);
  }, []);

  // 🔥 abre ParaOndeVamos
  const handleAbrirParaOndeVamos = useCallback(() => {
    // 🔥 Garante que o destino comece sempre zerado/vazio ao abrir
    setItinerario((prev) => [
      prev[0], // Mantém o local de partida/origem atual
      {
        name: "",
        formattedAddress: "",
        latitude: 0,
        longitude: 0,
        distancia: "0km",
        order: 1,
      },
    ]);

    setShowParaOndeVamos(true);
  }, []);

  // 🔥 fecha ParaOndeVamos
  const handleCloseParaOndeVamos = useCallback(() => {
    setShowParaOndeVamos(false);
  }, []);

  // 🔥 abre ViagemComParada
  const handleAdicionarParada = useCallback(() => {
    setShowParaOndeVamos(false);
    setShowViagemComParada(true);
  }, []);

  // 🔥 CANCELA CORRIDA
  const handleCancelarViagem = useCallback(() => {
    setShowFolhaInferior(true);
    setShowViagemComParada(false);

    setShowFolhaEscolherOferta(false);
    console.log(showFolhaInferior, " showFolhaInferior handleCancelarViagem");
    // 🔥 limpa rota mantendo origem
    setItinerario((prev) => [
      prev[0],

      {
        name: "",
        formattedAddress: "",
        latitude: 0,
        longitude: 0,
        distancia: "0km",
        order: 1,
      },
    ]);

    // 🔥 recentraliza usuário
    if (userInitialRegion.current) {
      setRegion({
        ...userInitialRegion.current,

        latitude: userInitialRegion.current.latitude,

        latitudeDelta: 0.01,

        longitudeDelta: 0.01,
      });
    }
  }, []);

  // 🔥 voltar oferta → home (cancela a corrida, igual handleCancelarViagem —
  // sem isso a rota ficava "fantasma" desenhada no mapa depois de voltar)
  const handleVoltarParaHome = useCallback(() => {
    setShowFolhaInferior(true);
    setProgesseguirParaOferta(false);
    setShowFolhaEscolherOferta(false);

    // 🔥 limpa rota mantendo origem
    setItinerario((prev) => [
      prev[0],

      {
        name: "",
        formattedAddress: "",
        latitude: 0,
        longitude: 0,
        distancia: "0km",
        order: 1,
      },
    ]);

    // 🔥 recentraliza usuário
    if (userInitialRegion.current) {
      setRegion({
        ...userInitialRegion.current,

        latitude: userInitialRegion.current.latitude,

        latitudeDelta: 0.01,

        longitudeDelta: 0.01,
      });
    }
  }, []);

  // 🔥 lista operacional mapa
  const itinerarioMapa = useMemo(() => {
    return itinerario.filter(
      (item) => item.name && item.latitude && item.longitude,
    );
  }, [itinerario]);

  const partida = itinerarioMapa.length > 0 ? itinerarioMapa[0] : null;

  const destino =
    itinerarioMapa.length > 1
      ? itinerarioMapa[itinerarioMapa.length - 1]
      : null;

  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />

        <Text style={styles.loadingText}>Verificando autenticação...</Text>
      </View>
    );
  }

  if (!user) return null;

  return (
    <View style={styles.container}>
      {/* 🔥 mapa reduzido, em cartão com margem e cantos arredondados
          (igual ao 99) + "Para onde vamos?" sempre visível por completo
          abaixo, sem ser um sheet colapsável */}
      <View style={styles.corpoPrincipal}>
        <View
          // 🔥 cartão pequeno só na home "parada"; assim que entra em
          // qualquer etapa de planejar a corrida, o mapa volta a ocupar a
          // tela toda (precisa de espaço de verdade pra rota/paradas)
          style={
            showFolhaInferior ? styles.mapaCardWrapper : styles.mapaTelaCheia
          }
          collapsable={false}
        >
          <Map
            mapBottomPadding={mapBottomPadding}
            region={region}
            onRegionChange={setRegion}
            onUserLocationFound={handleUserLocationFound}
            bottomSheetIndex={bottomSheetIndex}
            itinerario={itinerarioMapa}
          />
        </View>

        {/* 🔥 FolhaInferior — painel estático, não colapsa mais */}
        {showFolhaInferior && (
          <View style={styles.folhaInferiorWrapper}>
            <FolhaInferior onPressParaOndeVamos={handleAbrirParaOndeVamos} />
          </View>
        )}
      </View>

      {/* 🔥 botão voltar */}
      {/* {(showViagemComParada || showFolhaEscolherOferta) &&
        !showBuscarEndereco && (
          <TouchableOpacity
            onPress={
              showFolhaEscolherOferta
                ? handleVoltarParaHome
                : handleCancelarViagem
            }
            activeOpacity={0.8}
            style={styles.backFloatingButton}
          >
            <Ionicons name="chevron-back" size={26} color="#000" />
          </TouchableOpacity>
        )} */}

      {showViagemComParada && !showBuscarEndereco && (
        <TouchableOpacity
          onPress={handleCancelarViagem}
          activeOpacity={0.8}
          style={styles.backFloatingButton}
        >
          <Ionicons name="chevron-back" size={26} color="#000" />
        </TouchableOpacity>
      )}

      {/* 🔥 ParaOndeVamos */}
      <ParaOndeVamos
        visible={showParaOndeVamos}
        onClose={handleCloseParaOndeVamos}
        onAdicionarParada={() => {
          setShowFolhaInferior(false);
          setShowParaOndeVamos(false);
          setShowViagemComParada(true);
        }}
        itinerario={itinerario}
        setItinerario={setItinerario}
        onSucesso={() => {
          setOrigemConfirmacao("para-onde-vamos");
          setShowFolhaInferior(false);
          setShowConfirmarEndereco(true);
        }}
      />

      {/* 🔥 ViagemComParada */}
      <ViagemComParada
        onMapPaddingChange={setMapBottomPadding}
        onShowBuscarEndereco={setShowBuscarEndereco}
        visible={showViagemComParada}
        onClose={handleCancelarViagem}
        onConfirmar={() => {
          setOrigemConfirmacao("viagem-com-parada");
          setShowFolhaInferior(false);
          setShowViagemComParada(false);
          setShowConfirmarEndereco(true);
        }}
        itinerario={itinerario}
        setItinerario={setItinerario}
      />

      {/* 🔥 ConfirmarEndereco — passo entre escolher o destino e ver preços */}
      <ConfirmarEndereco
        visible={showConfirmarEndereco}
        origem={partida}
        endereco={destino}
        onVoltar={() => {
          setShowConfirmarEndereco(false);

          if (origemConfirmacao === "viagem-com-parada") {
            setShowViagemComParada(true);
          } else {
            setShowParaOndeVamos(true);
          }
        }}
        onConfirmar={() => {
          setShowConfirmarEndereco(false);
          setShowFolhaEscolherOferta(true);
        }}
      />

      {/* 🔥 FolhaEscolherOferta */}
      {showFolhaEscolherOferta && (
        <FolhaEscolherOferta
          itinerario={itinerarioMapa}
          onSheetChange={handleSheetStateChange}
          partida={partida}
          destino={destino}
          onClose={handleVoltarParaHome}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  corpoPrincipal: {
    flex: 1,
    backgroundColor: "#FFF",
  },

  // 🔥 mapa vira um cartão com margem e cantos arredondados — não é mais
  // edge-to-edge (igual ao 99), deixa de respiro logo abaixo do header.
  // `collapsable={false}` (no View, ver JSX) é obrigatório: o RN às vezes
  // "achata" (view flattening) esse wrapper por otimização, e aí o
  // MapView nativo do Android ignora margem/borda arredondada do pai.
  // 🔥 NOTA: margem lateral/superior (left/right/top) do cartão do mapa
  // não está tendo efeito visual no dispositivo testado apesar de várias
  // abordagens tentadas (margin, width explícito, position:absolute,
  // renderToHardwareTextureAndroid) — o MapView nativo do Android parece
  // ignorar esses eixos especificamente, mesmo quando a altura (via flex
  // ou height explícito) é respeitada corretamente. Documentado em
  // problemas-conhecidos.md. Mantido `left`/`right`/`top` no style porque
  // não fazem mal e podem passar a funcionar com uma atualização da lib.
  mapaCardWrapper: {
    position: "absolute",
    top: 100,
    left: 16,
    right: 16,
    height: 320,
    borderRadius: 24,
    overflow: "hidden",
  },

  // 🔥 durante o planejamento da corrida (ParaOndeVamos/ViagemComParada/
  // FolhaEscolherOferta), o mapa volta a ocupar a tela toda
  mapaTelaCheia: {
    flex: 1,
  },

  // 🔥 o mapa agora é posicionado absoluto (ver mapaCardWrapper), então
  // essa folha fica em fluxo normal por baixo dele — marginTop soma
  // top+height+respiro do card do mapa pra não ficar por baixo dele
  folhaInferiorWrapper: {
    flex: 1,
    marginTop: 432,
    paddingBottom: 90,
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

  backFloatingButton: {
    position: "absolute",
    top: 40,
    left: 18,
    width: 48,
    height: 48,
    borderRadius: 28,
    backgroundColor: "#FFF",

    justifyContent: "center",
    alignItems: "center",

    zIndex: 1,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.18,
    shadowRadius: 6,

    elevation: 1,
  },
});
