// components/ParaOndeVamos.tsx

import { InterfaceEndereco } from "@/app/(main)/home";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  BackHandler,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { api } from "@/Services/api";
const CACHE_HISTORICO_KEY = "@historico_enderecos";

// Cache local (persiste entre sessões do app) de buscas de endereço já
// feitas — evita bater na API de novo pro mesmo texto buscado antes.
const CACHE_BUSCA_KEY = "@cache_busca_enderecos";
const CACHE_BUSCA_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const CACHE_BUSCA_MAX_ENTRADAS = 50;

interface ResultadoBuscaCacheado {
  resultado: {
    name: string;
    formattedAddress: string;
    latitude: number;
    longitude: number;
  };
  timestamp: number;
}

const normalizarTextoBusca = (texto: string) => texto.trim().toLowerCase();

const lerCacheBusca = async (): Promise<
  Record<string, ResultadoBuscaCacheado>
> => {
  try {
    const raw = await AsyncStorage.getItem(CACHE_BUSCA_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    console.log("Erro ao ler cache de busca de endereço:", error);
    return {};
  }
};

const salvarNoCacheBusca = async (
  texto: string,
  resultado: ResultadoBuscaCacheado["resultado"],
) => {
  try {
    const cache = await lerCacheBusca();

    cache[normalizarTextoBusca(texto)] = { resultado, timestamp: Date.now() };

    // mantém só as entradas mais recentes, pra não crescer sem limite
    const maisRecentes = Object.entries(cache)
      .sort((a, b) => b[1].timestamp - a[1].timestamp)
      .slice(0, CACHE_BUSCA_MAX_ENTRADAS);

    await AsyncStorage.setItem(
      CACHE_BUSCA_KEY,
      JSON.stringify(Object.fromEntries(maisRecentes)),
    );
  } catch (error) {
    console.log("Erro ao salvar cache de busca de endereço:", error);
  }
};

interface props {
  visible: boolean;
  onClose: () => void;
  duration?: number;
  onAdicionarParada?: () => void;
  // 🔥 NOVAS PROPS CONECTADAS À HOME
  itinerario: InterfaceEndereco[];
  setItinerario: React.Dispatch<React.SetStateAction<InterfaceEndereco[]>>;
  onSucesso?: () => void; // 👈 ADICIONE ESTA LINHA
}

const enderecosPadrao: InterfaceEndereco[] = [];

// 🔥 índice baixo = mais mapa visível, índice alto = foco na busca
const SNAP_POINTS = ["45%", "90%"];

export default function ParaOndeVamos({
  visible,
  onClose,
  onAdicionarParada,
  itinerario,
  setItinerario,
  onSucesso,
}: props) {
  const bottomSheetRef = useRef<BottomSheet>(null);

  const snapPoints = useMemo(() => SNAP_POINTS, []);

  const skeletonOpacity = useRef(new Animated.Value(0.4)).current;

  const [isMounted, setIsMounted] = useState(visible);
  const [listaEnderecos, setListaEnderecos] = useState<InterfaceEndereco[]>([]);
  const [historicoCache, setHistoricoCache] = useState<InterfaceEndereco[]>([]);
  const [loading, setLoading] = useState(false);

  // Controla qual input está ativo (0 para Origem, 1 para Destino)
  const [inputSelecionado, setInputSelecionado] = useState<number>(1);
  const inputRefs = useRef<TextInput[]>([]);

  const listaExibicao =
    listaEnderecos.length > 0 ? listaEnderecos : historicoCache;

  const handleAdicionarParada = () => {
    onClose();
    if (onAdicionarParada) {
      onAdicionarParada();
    }
  };

  // Animação do Skeleton
  useEffect(() => {
    let animationLoop: Animated.CompositeAnimation | null = null;

    if (loading) {
      animationLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(skeletonOpacity, {
            toValue: 0.8,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(skeletonOpacity, {
            toValue: 0.4,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      );
      animationLoop.start();
    } else {
      skeletonOpacity.setValue(0.4);
    }

    return () => {
      if (animationLoop) animationLoop.stop();
    };
  }, [loading]);

  // Histórico em Cache (AsyncStorage)
  const carregarHistoricoCache = async () => {
    try {
      const cachedData = await AsyncStorage.getItem(CACHE_HISTORICO_KEY);
      if (cachedData) {
        const historico: InterfaceEndereco[] = JSON.parse(cachedData);

        setHistoricoCache(
          historico.map((item) => ({
            ...item,
            name: item.name ?? "",
            formattedAddress: item.formattedAddress ?? "",
          })),
        );
      } else {
        setHistoricoCache(enderecosPadrao);
        await AsyncStorage.setItem(
          CACHE_HISTORICO_KEY,
          JSON.stringify(enderecosPadrao),
        );
      }
    } catch (error) {
      console.log("Erro ao carregar histórico do cache:", error);
      setHistoricoCache(enderecosPadrao);
    }
  };

  const salvarEnderecoNoCache = async (novoEndereco: InterfaceEndereco) => {
    try {
      const historicoFiltrado = historicoCache.filter(
        (item) => item.formattedAddress !== novoEndereco.formattedAddress,
      );
      const novoHistorico = [novoEndereco, ...historicoFiltrado];
      const historicoLimitado = novoHistorico.slice(0, 10);

      setHistoricoCache(historicoLimitado);
      await AsyncStorage.setItem(
        CACHE_HISTORICO_KEY,
        JSON.stringify(historicoLimitado),
      );
    } catch (error) {
      console.log("Erro ao salvar endereço no cache:", error);
    }
  };

  const removerEnderecoDoCache = async (
    enderecoParaRemover: InterfaceEndereco,
  ) => {
    try {
      const historicoAtualizado = historicoCache.filter(
        (item) =>
          item.formattedAddress !== enderecoParaRemover.formattedAddress,
      );
      setHistoricoCache(historicoAtualizado);
      await AsyncStorage.setItem(
        CACHE_HISTORICO_KEY,
        JSON.stringify(historicoAtualizado),
      );
    } catch (error) {
      console.log("Erro ao remover endereço do cache:", error);
    }
  };

  // Requisição de busca na API
  const buscarEnderecoApi = async (texto: string) => {
    // menos de 3 caracteres quase nunca traz resultado útil — evita gastar
    // requisição da Places API a cada tecla no início da digitação
    if (!texto || texto.trim().length < 3) {
      setListaEnderecos([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // já buscou esse texto antes (nessa sessão ou numa anterior)? reaproveita
    // sem chamar a API de novo
    const cache = await lerCacheBusca();
    const cacheado = cache[normalizarTextoBusca(texto)];

    if (cacheado && Date.now() - cacheado.timestamp < CACHE_BUSCA_TTL_MS) {
      setListaEnderecos([{ ...cacheado.resultado, distancia: "--" }]);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get("/buscar-endereco", {
        params: { endereco: texto },
      });

      if (response.data) {
        const {
          name = "",
          formattedAddress = "",
          latitude,
          longitude,
        } = response.data;
        const novoEnderecoObjeto = {
          name,
          formattedAddress,
          latitude,
          longitude,
          distancia: "--",
        };
        setListaEnderecos([novoEnderecoObjeto]);

        salvarNoCacheBusca(texto, {
          name,
          formattedAddress,
          latitude,
          longitude,
        });
      }
    } catch (error) {
      setListaEnderecos([]);

      console.log("Erro ao buscar endereço no backend:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarHistoricoCache();
  }, []);

  // Debounce para escutar as mudanças do itinerário global da Home
  useEffect(() => {
    const textoAtual = itinerario[inputSelecionado]?.name || "";
    const itemAtual = itinerario[inputSelecionado];

    if (itemAtual && itemAtual.formattedAddress !== "") {
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      if (visible) {
        buscarEnderecoApi(textoAtual);
      }
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [itinerario, inputSelecionado, visible]);

  // 🔥 Seleção do endereço atualizando o estado global da Home
  const handleSelecionarEndereco = async (item: InterfaceEndereco) => {
    setItinerario((prev) =>
      prev.map((input, index) =>
        index === inputSelecionado
          ? {
              ...input,
              name: item.name,
              formattedAddress: item.formattedAddress,
              latitude: item.latitude,
              longitude: item.longitude,
              order: index,
            }
          : input,
      ),
    );

    await salvarEnderecoNoCache(item);
    setListaEnderecos([]);

    if (inputSelecionado === 1) {
      onClose(); // Fecha o ParaOndeVamos

      // 🔥 DISPARA O CALLBACK DE SUCESSO COORDENANDO AS TELAS
      if (onSucesso) {
        onSucesso();
      }
    } else {
      setTimeout(() => {
        inputRefs.current[1]?.focus();
      }, 150);
    }
  };

  // Botão Voltar Físico do Android
  useEffect(() => {
    const onBackPress = () => {
      if (visible) {
        onClose();
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress,
    );
    return () => subscription.remove();
  }, [visible, onClose]);

  // Controla abertura/fechamento do BottomSheet a partir da prop `visible`
  useEffect(() => {
    if (visible) {
      setIsMounted(true);

      bottomSheetRef.current?.snapToIndex(1);

      setTimeout(() => {
        inputRefs.current[1]?.focus();
      }, 250);
    } else {
      bottomSheetRef.current?.close();
    }
  }, [visible]);

  const handleSheetChange = useCallback(
    (index: number) => {
      if (index === -1) {
        setIsMounted(false);
        setListaEnderecos([]);
        setLoading(false);

        onClose();
      }
    },
    [onClose],
  );

  if (!isMounted) return null;

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <BottomSheet
        ref={bottomSheetRef}
        index={1}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        onChange={handleSheetChange}
        enablePanDownToClose={false}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="black" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <View style={styles.userContainer}>
              <View style={styles.userPill}>
                <Ionicons name="person-circle" size={28} color="#666" />
                <Text style={styles.userName}>Diogo</Text>
                <Ionicons name="chevron-down" size={16} color="#666" />
              </View>
            </View>
          </View>
          <View style={{ width: 24 }} />
        </View>

        <Text style={styles.title}>Para onde vamos?</Text>

        {/* INPUTS MUDADOS PARA ESCUTAR O ITINERÁRIO GLOBAL */}
        <View style={styles.searchContainer}>
          {itinerario.slice(0, 2).map((item, index) => {
            const isOrigem = index === 0;
            const isDestino = index === 1;

            return (
              <View key={index} style={styles.rowContainer}>
                {/* TIMELINE */}
                <View style={styles.lineContainer}>
                  <View style={styles.markerWrapper}>
                    {isOrigem ? (
                      <View style={styles.startOuterCircle}>
                        <View style={styles.startInnerCircle} />
                      </View>
                    ) : (
                      <View style={styles.startOuterSquare}>
                        <View style={styles.startInnerSquare} />
                      </View>
                    )}
                  </View>
                  {isOrigem && <View style={styles.verticalLine} />}
                </View>

                {/* TEXT INPUT CONTROLANDO A HOME */}
                <View
                  style={[
                    styles.searchInput,
                    isDestino && styles.searchInputDestination,
                  ]}
                >
                  <BottomSheetTextInput
                    ref={(ref) => {
                      if (ref) {
                        inputRefs.current[index] = ref;
                      }
                    }}
                    style={styles.input}
                    placeholder={
                      isOrigem ? "Local de partida" : "Para onde você vai?"
                    }
                    placeholderTextColor="#999"
                    value={item.name}
                    onFocus={() => {
                      setInputSelecionado(index);
                      bottomSheetRef.current?.snapToIndex(1);
                    }}
                    onChangeText={(texto) => {
                      setItinerario((prev) =>
                        prev.map((inp, idx) =>
                          idx === index
                            ? { ...inp, name: texto, formattedAddress: "" }
                            : inp,
                        ),
                      );
                    }}
                  />

                  {isDestino && (
                    <TouchableOpacity
                      onPress={handleAdicionarParada}
                      style={styles.addButtonInline}
                    >
                      <Ionicons name="add" size={20} color="#666" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* HISTÓRICO / RESULTADOS */}
        <BottomSheetScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* AÇÕES RÁPIDAS */}
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickButton}>
              <Ionicons name="home" size={16} color="#5F6368" />
              <Text numberOfLines={1} style={styles.quickText}>
                Avenida Bo...
              </Text>
              <Ionicons name="chevron-forward" size={14} color="#B0B0B0" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickButton}>
              <Ionicons name="briefcase" size={16} color="#5F6368" />
              <Text style={styles.quickText}>Trabalho</Text>
              <Ionicons name="chevron-forward" size={14} color="#B0B0B0" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickButton}>
              <Ionicons name="star" size={16} color="#5F6368" />
              <Text style={styles.quickText}>Favoritos</Text>
              <Ionicons name="chevron-forward" size={14} color="#B0B0B0" />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* LISTA DINÂMICA */}
          <View style={styles.list}>
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Animated.View
                    key={i}
                    style={[styles.listItem, { opacity: skeletonOpacity }]}
                  >
                    <View
                      style={[
                        styles.listIconContainer,
                        { backgroundColor: "#EBEBEB" },
                      ]}
                    />
                    <View style={styles.listContent}>
                      <View
                        style={{
                          width: "60%",
                          height: 14,
                          backgroundColor: "#EBEBEB",
                          borderRadius: 4,
                          marginBottom: 8,
                        }}
                      />
                      <View
                        style={{
                          width: "90%",
                          height: 10,
                          backgroundColor: "#EBEBEB",
                          borderRadius: 4,
                        }}
                      />
                    </View>
                  </Animated.View>
                ))
              : listaExibicao.map((endereco, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.listItem}
                    onPress={() => handleSelecionarEndereco(endereco)}
                  >
                    <TouchableOpacity
                      style={styles.listIconContainer}
                      onPress={() => removerEnderecoDoCache(endereco)}
                    >
                      <Ionicons name="close" size={14} color="#111" />
                    </TouchableOpacity>

                    <View style={styles.listContent}>
                      <Text style={styles.listText}>{endereco.name}</Text>
                      <Text style={styles.listSubText}>
                        {endereco.formattedAddress}
                      </Text>
                    </View>

                    <Text style={styles.distanceText}>
                      {endereco.distancia}
                    </Text>
                  </TouchableOpacity>
                ))}
          </View>

          {/* FOOTER */}
          <View style={styles.footerButtonsContainer}>
            <TouchableOpacity style={styles.footerButton}>
              <View
                style={[styles.listIconContainer, styles.footerIconContainer]}
              >
                <Ionicons name="map" size={16} color="#111" />
              </View>
              <Text style={styles.footerButtonText}>Definir local no mapa</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.footerButton}>
              <View
                style={[styles.listIconContainer, styles.footerIconContainer]}
              >
                <Ionicons name="add" size={18} color="#111" />
              </View>
              <Text style={styles.footerButtonText}>Inserir mais tarde</Text>
            </TouchableOpacity>
          </View>
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
}
const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  handleIndicator: {
    backgroundColor: "#DDD",
    width: 40,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 24,
  },

  backButton: {
    marginTop: 10,
  },

  headerCenter: {
    alignItems: "center",
  },

  userContainer: {
    alignItems: "center",
    marginBottom: 12,
  },

  userPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },

  userName: {
    fontSize: 15,
    color: "#111",
    fontWeight: "600",
    marginHorizontal: 8,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000",
    marginBottom: 20,
    paddingHorizontal: 24,
  },

  searchContainer: {
    flexDirection: "column",
    marginBottom: 24,
    paddingHorizontal: 40,
  },

  rowContainer: {
    flexDirection: "row",
    alignItems: "stretch",
  },

  lineContainer: {
    alignItems: "center",
    marginRight: 14,
    width: 24,
    position: "relative",
  },

  markerWrapper: {
    width: 24,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },

  startOuterCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#666",
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
  },

  startInnerCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#111",
  },

  startOuterSquare: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#FF5500",
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
  },

  startInnerSquare: {
    width: 8,
    height: 8,
    borderRadius: 1,
    backgroundColor: "#FF5500",
  },

  verticalLine: {
    position: "absolute",
    width: 2,
    top: 38,
    bottom: -18,
    backgroundColor: "#DDD",
    zIndex: 1,
  },

  searchInput: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    minHeight: 56,
    borderBottomWidth: 1,
    borderBottomColor: "#ECECEC",
  },

  searchInputDestination: {
    borderBottomColor: "#FFD7BF",
  },

  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 17,
    color: "#111",
    fontWeight: "500",
    paddingRight: 10,
  },

  addButtonInline: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },

  container: {
    width: "100%",
    paddingHorizontal: 24,
  },

  quickActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
    paddingTop: 4,
  },

  quickButton: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginHorizontal: 4,
  },

  quickText: {
    flex: 1,
    fontSize: 14,
    color: "#5F6368",
    fontWeight: "600",
    marginLeft: 8,
    marginRight: 4,
  },

  divider: {
    height: 1,
    backgroundColor: "#F1F1F1",
    marginHorizontal: -24,
    marginBottom: 8,
  },

  list: {
    marginTop: 4,
  },

  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 14,
  },

  listIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F3F3F3",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    marginTop: 2,
  },

  listContent: {
    flex: 1,
    paddingRight: 10,
  },

  listText: {
    fontSize: 16,
    color: "#2B2B2B",
    fontWeight: "700",
    marginBottom: 3,
  },

  listSubText: {
    fontSize: 13,
    lineHeight: 18,
    color: "#909090",
    fontWeight: "400",
  },

  distanceText: {
    fontSize: 14,
    color: "#9B9B9B",
    marginTop: 2,
  },

  footerButtonsContainer: {
    marginTop: 8,
    paddingBottom: 24,
  },

  footerButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },

  footerIconContainer: {
    marginTop: 0,
  },

  footerButtonText: {
    fontSize: 16,
    color: "#2B2B2B",
    fontWeight: "700",
  },
});
