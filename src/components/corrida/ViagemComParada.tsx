// components/ViagemComParada.tsx
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { InterfaceEndereco } from "@/app/(main)/home";
import {
  BackHandler,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DraggableFlatList, {
  RenderItemParams,
} from "react-native-draggable-flatlist";

import FolhaBuscarEndereco from "@/components/corrida/FolhaBuscarEndereco";

const MAX_PARADAS = 4;
interface props {
  visible: boolean;

  onClose: () => void;

  // 🔥 NOVO
  onConfirmar?: () => void;

  duration?: number;

  onShowBuscarEndereco?: (visible: boolean) => void;

  itinerario: InterfaceEndereco[];

  setItinerario: React.Dispatch<React.SetStateAction<InterfaceEndereco[]>>;

  onMapPaddingChange?: (padding: number) => void;
}

export default function ViagemComParada({
  onMapPaddingChange,
  visible,
  onClose,

  // 🔥 NOVO
  onConfirmar,
  onShowBuscarEndereco,

  itinerario,
  setItinerario,
}: props) {
  const [isMounted, setIsMounted] = useState(visible);

  // 🔥 desliga o gesto de arrastar do BottomSheet enquanto uma parada está
  // sendo arrastada — sem isso os dois gestos brigam entre si
  const [arrastandoParada, setArrastandoParada] = useState(false);

  const [showFolhaBuscarEndereco, setShowFolhaBuscarEndereco] = useState(false);

  const [inputSelecionadoIndex, setInputSelecionadoIndex] = useState<
    number | null
  >(null);

  const bottomSheetRef = useRef<BottomSheet>(null);

  const snapPoints = useMemo(() => {
    const baseHeight = 40;

    const additionalHeight = (itinerario.length - 2) * 5;

    const totalHeight = Math.min(baseHeight + additionalHeight, 85);

    return [`${totalHeight}%`];
  }, [itinerario.length]);

  const podeConfirmar = itinerario.some(
    (item, index) => index !== 0 && (item.name ?? "").trim() !== "",
  );

  const reorganizarOrders = (lista: InterfaceEndereco[]) => {
    return lista.map((item, index) => ({
      ...item,
      order: index,
    }));
  };

  const handleSheetStateChange = useCallback((index: number) => {
    if (index === -1) {
      setShowFolhaBuscarEndereco(false);
    }
  }, []);

  const handleInputClick = (index: number) => {
    setInputSelecionadoIndex(index);

    setShowFolhaBuscarEndereco(true);

    onShowBuscarEndereco?.(true);
  };

  const handleSelecionarEndereco = (endereco: InterfaceEndereco) => {
    if (inputSelecionadoIndex === null) {
      return;
    }

    setItinerario((prev) => {
      let novaLista = prev.map((item, index) =>
        index === inputSelecionadoIndex
          ? {
              ...item,
              ...endereco,
              order: index,
            }
          : item,
      );

      const ultimoItem = novaLista[novaLista.length - 1];

      const possuiInputVazio = novaLista.some((item) => !item.name);

      // 🔥 mantém sempre um input vazio
      if (
        ultimoItem.name &&
        !possuiInputVazio &&
        novaLista.length < MAX_PARADAS + 1
      ) {
        novaLista.push({
          name: "",
          formattedAddress: "",
          latitude: 0,
          longitude: 0,
          distancia: "0km",
          order: 0,
        });
      }

      return reorganizarOrders(novaLista);
    });

    setShowFolhaBuscarEndereco(false);

    onShowBuscarEndereco?.(false);
  };

  // 🔥 recebe a lista de paradas já na nova ordem (arrastar-e-soltar) e
  // remonta o itinerário completo: origem primeiro, depois as paradas
  // reordenadas, depois o slot vazio de "adicionar parada" (se existir)
  const finalizarArraste = ({ data }: { data: InterfaceEndereco[] }) => {
    setArrastandoParada(false);

    setItinerario((prev) => {
      const origem = prev[0];

      const ultimoItem = prev[prev.length - 1];

      const temPlaceholderVazio = prev.length > 1 && !ultimoItem.name;

      const nova = [
        origem,
        ...data,
        ...(temPlaceholderVazio ? [ultimoItem] : []),
      ];

      return reorganizarOrders(nova);
    });
  };

  // 🔥 true quando não há mais slot vazio pra adicionar parada — já
  // atingiu o limite de MAX_PARADAS
  const limiteDeParadasAtingido =
    itinerario.length >= MAX_PARADAS + 1 &&
    itinerario.every((item) => item.name);

  const removerParada = (index: number) => {
    if (index === 0) return;

    setItinerario((prev) => {
      let novaLista = prev.filter((_, i) => i !== index);

      // garante mínimo
      if (novaLista.length === 1) {
        novaLista.push({
          name: "",
          formattedAddress: "",
          latitude: 0,
          longitude: 0,
          distancia: "0km",
          order: 1,
        });
      }

      const possuiInputVazio = novaLista.some((item) => !item.name);

      // 🔥 mantém placeholder
      if (novaLista.length < MAX_PARADAS + 1 && !possuiInputVazio) {
        novaLista.push({
          name: "",
          formattedAddress: "",
          latitude: 0,
          longitude: 0,
          distancia: "0km",
          order: 0,
        });
      }

      return reorganizarOrders(novaLista);
    });
  };

  // 🔥 NOVO
  const handleConfirmar = () => {
    if (!podeConfirmar) return;

    onConfirmar?.();
  };

  useEffect(() => {
    const padding = 360 + itinerario.length * 45;

    onMapPaddingChange?.(padding);
  }, [itinerario.length]);

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

  // 🔥 IMPORTANTE:
  // não reseta mais itinerário
  useEffect(() => {
    if (visible) {
      setIsMounted(true);

      bottomSheetRef.current?.snapToIndex(0);
    } else {
      setIsMounted(false);

      bottomSheetRef.current?.close();
    }
  }, [visible]);

  const handleSheetChange = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose],
  );

  // 🔥 origem sempre fixa no topo; o slot vazio de "adicionar parada" (se
  // existir) sempre fixo no fim; só o que sobra no meio é arrastável
  const origem = itinerario[0];

  const ultimoItemGeral = itinerario[itinerario.length - 1];

  const temPlaceholderVazio = itinerario.length > 1 && !ultimoItemGeral.name;

  const paradasReais = itinerario.slice(
    1,
    temPlaceholderVazio ? -1 : undefined,
  );

  const renderLinha = ({
    item,
    index,
    isOrigem,
    isDestino,
    isUltimaLinha,
    onIniciarArraste,
  }: {
    item: InterfaceEndereco;
    index: number;
    isOrigem: boolean;
    isDestino: boolean;
    isUltimaLinha: boolean;
    onIniciarArraste?: () => void;
  }) => (
    <View style={styles.rowContainer}>
      <View style={styles.lineContainer}>
        <View style={styles.markerWrapper}>
          {isOrigem ? (
            <View style={styles.startOuterCircle}>
              <View style={styles.startInnerCircle} />
            </View>
          ) : isDestino && !item.name ? (
            <View style={[styles.numberBox, styles.lastNumberBoxHighlight]}>
              <Ionicons name="add" size={18} color="#FFF" />
            </View>
          ) : (
            <View
              style={[
                styles.numberBox,
                isDestino ? styles.lastNumberBoxHighlight : null,
              ]}
            >
              <Text
                style={[
                  styles.numberText,
                  isDestino ? styles.lastNumberTextHighlight : null,
                ]}
              >
                {index}
              </Text>
            </View>
          )}
        </View>

        {!isUltimaLinha && <View style={styles.verticalLine} />}
      </View>

      <View
        style={[styles.searchInput, isDestino && styles.searchInputDestination]}
      >
        <TouchableOpacity
          style={styles.inputTouchable}
          onPress={() => handleInputClick(index)}
          activeOpacity={0.7}
        >
          <Text
            style={[styles.inputText, !item.name && styles.placeholderText]}
            numberOfLines={1}
          >
            {item.name || "Adicionar parada"}
          </Text>
        </TouchableOpacity>

        {!isOrigem && item.name && (
          <View style={styles.actionButtons}>
            {onIniciarArraste && (
              <TouchableOpacity
                // 🔥 onPressIn (não onLongPress) — arrasta assim que
                // encosta na alcinha, sem precisar segurar
                onPressIn={onIniciarArraste}
                style={styles.reorderButtonInline}
                hitSlop={8}
              >
                <Ionicons name="reorder-three" size={22} color="#999" />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => removerParada(index)}
              style={styles.removeButtonInline}
              hitSlop={6}
            >
              <Ionicons name="close" size={20} color="#777" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  if (!isMounted) return null;

  return (
    <View
      pointerEvents="box-none"
      style={[StyleSheet.absoluteFill, { zIndex: 30 }]}
    >
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        onChange={handleSheetChange}
        overDragResistanceFactor={13}
        enablePanDownToClose={false}
        // 🔥 desliga o gesto do sheet enquanto arrasta uma parada — os dois
        // gestos de pan competindo faziam o sheet fechar/arrastar sozinho
        enableContentPanningGesture={!arrastandoParada}
        enableHandlePanningGesture={!arrastandoParada}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <BottomSheetView style={styles.contentContainer}>
          <View style={styles.containerTitle}>
            <Text style={styles.title}>Adicionar paradas</Text>
          </View>

          <View style={styles.searchContainer}>
            {/* origem — fixa, nunca arrasta nem remove */}
            {renderLinha({
              item: origem,
              index: 0,
              isOrigem: true,
              isDestino: false,
              isUltimaLinha: paradasReais.length === 0 && !temPlaceholderVazio,
            })}

            {/* paradas reais — arrastáveis pra reordenar */}
            <DraggableFlatList
              data={paradasReais}
              keyExtractor={(item) =>
                `${item.latitude}-${item.longitude}-${item.name}`
              }
              scrollEnabled={false}
              activationDistance={12}
              onDragBegin={() => setArrastandoParada(true)}
              onDragEnd={finalizarArraste}
              renderItem={({
                item,
                drag,
                isActive,
              }: RenderItemParams<InterfaceEndereco>) => {
                const index = itinerario.indexOf(item);

                // só a última linha realmente exibida vira "destino" (com
                // destaque laranja) — se existe slot vazio no fim, é ele
                // quem carrega o destaque, não a última parada preenchida
                const isDestino =
                  !temPlaceholderVazio && index === itinerario.length - 1;

                return (
                  <View style={isActive && styles.linhaArrastando}>
                    {renderLinha({
                      item,
                      index,
                      isOrigem: false,
                      isDestino,
                      isUltimaLinha: !temPlaceholderVazio && isDestino,
                      onIniciarArraste: drag,
                    })}
                  </View>
                );
              }}
            />

            {/* slot vazio de "adicionar parada" — fixo no fim, não arrasta */}
            {temPlaceholderVazio &&
              renderLinha({
                item: itinerario[itinerario.length - 1],
                index: itinerario.length - 1,
                isOrigem: false,
                isDestino: true,
                isUltimaLinha: true,
              })}

            {limiteDeParadasAtingido && (
              <Text style={styles.limiteText}>
                Limite de {MAX_PARADAS} paradas atingido
              </Text>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.confirmButton,
                !podeConfirmar && styles.confirmButtonDisabled,
              ]}
              onPress={handleConfirmar}
              activeOpacity={0.8}
              disabled={!podeConfirmar}
            >
              <Text
                style={[
                  styles.confirmButtonText,
                  !podeConfirmar && styles.confirmButtonTextDisabled,
                ]}
              >
                Confirmar
              </Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheet>

      <FolhaBuscarEndereco
        visible={showFolhaBuscarEndereco}
        onClose={() => {
          setShowFolhaBuscarEndereco(false);

          onShowBuscarEndereco?.(false);
        }}
        onSheetChange={handleSheetStateChange}
        servico={"corrida"}
        onSelecionarEndereco={handleSelecionarEndereco}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  containerTitle: {
    alignItems: "center",
  },

  bottomSheetBackground: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  handleIndicator: {
    backgroundColor: "#DDD",
    width: 40,
    height: 4,
  },

  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
    marginBottom: 6,
  },

  searchContainer: {
    flexDirection: "column",
    marginBottom: 24,
    paddingHorizontal: 16,
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

  numberBox: {
    width: 20,
    height: 20,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    justifyContent: "center",
    alignItems: "center",
  },

  numberText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#333",
  },

  lastNumberBoxHighlight: {
    backgroundColor: "#FF5500",
  },

  lastNumberTextHighlight: {
    color: "#FFF",
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

  inputTouchable: {
    flex: 1,
    paddingVertical: 12,
  },

  inputText: {
    fontSize: 17,
    color: "#111",
    fontWeight: "500",
  },

  placeholderText: {
    color: "#999",
    fontWeight: "400",
  },

  removeButtonInline: {
    padding: 4,
    marginLeft: 2,
  },

  reorderButtonInline: {
    padding: 4,
  },

  linhaArrastando: {
    opacity: 0.85,
    backgroundColor: "#FAFAFA",
  },

  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
  },

  limiteText: {
    fontSize: 13,
    color: "#999",
    textAlign: "center",
    marginTop: 4,
  },

  buttonContainer: {
    marginTop: 24,
    marginBottom: 32,
    paddingHorizontal: 16,
  },

  confirmButton: {
    backgroundColor: "#FFD200",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
  },

  confirmButtonDisabled: {
    backgroundColor: "#f0f0f0",
  },

  confirmButtonText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "700",
  },

  confirmButtonTextDisabled: {
    color: "#999",
  },
});
