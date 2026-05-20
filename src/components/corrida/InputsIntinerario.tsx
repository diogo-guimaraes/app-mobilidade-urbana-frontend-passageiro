// components/InputsItinerario.tsx

import { Ionicons } from "@expo/vector-icons";

import React from "react";

import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export interface EnderecoItem {
  id: string;
  name: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  distancia: string | number;
  order: number;
}

interface InputsItinerarioProps {
  inputsIntinerario: EnderecoItem[];

  setInputsIntinerario: React.Dispatch<
    React.SetStateAction<EnderecoItem[]>
  >;

  inputRefs: React.MutableRefObject<TextInput[]>;

  setInputSelecionado: (index: number) => void;

  atualizarInput: (
    texto: string,
    index: number,
  ) => void;
}

export default function InputsItinerario({
  inputsIntinerario,
  setInputsIntinerario,
  inputRefs,
  setInputSelecionado,
  atualizarInput,
}: InputsItinerarioProps) {
  // Condição para saber se existem paradas
  const temParadas =
    inputsIntinerario.length >= 3;

  const reorganizarOrders = (
    lista: EnderecoItem[],
  ) => {
    return lista.map((item, index) => ({
      ...item,
      order: index,
    }));
  };

  const adicionarParada = () => {
    setInputsIntinerario((prev) => {
      const novaLista = [...prev];

      // Insere antes do destino
      novaLista.splice(
        novaLista.length - 1,
        0,
        {
          id: `parada-${Date.now()}`,

          name: "",

          formattedAddress: "",

          latitude: 0,

          longitude: 0,

          distancia: 0,

          order: 0,
        },
      );

      return reorganizarOrders(
        novaLista,
      );
    });
  };

  const removerParada = (
    index: number,
  ) => {
    // Origem nunca remove
    if (index === 0) return;

    // Destino nunca remove
    if (
      index ===
      inputsIntinerario.length - 1
    )
      return;

    setInputsIntinerario((prev) => {
      const novaLista = prev.filter(
        (_, i) => i !== index,
      );

      return reorganizarOrders(
        novaLista,
      );
    });
  };

  const moverParaCima = (
    index: number,
  ) => {
    // Não sobe origem
    // Nem primeira parada
    if (index <= 1) return;

    setInputsIntinerario((prev) => {
      const novaLista = [...prev];

      [
        novaLista[index - 1],
        novaLista[index],
      ] = [
        novaLista[index],
        novaLista[index - 1],
      ];

      return reorganizarOrders(
        novaLista,
      );
    });
  };

  const moverParaBaixo = (
    index: number,
  ) => {
    // Não desce última parada
    if (
      index >=
      inputsIntinerario.length - 2
    )
      return;

    setInputsIntinerario((prev) => {
      const novaLista = [...prev];

      [
        novaLista[index],
        novaLista[index + 1],
      ] = [
        novaLista[index + 1],
        novaLista[index],
      ];

      return reorganizarOrders(
        novaLista,
      );
    });
  };

  return (
    <View style={styles.searchContainer}>
      {inputsIntinerario.map(
        (item, index) => {
          const isOrigem =
            index === 0;

          const isDestino =
            index ===
            inputsIntinerario.length - 1;

          const isParada =
            !isOrigem && !isDestino;

          return (
            <View
              key={item.id}
              style={styles.rowContainer}
            >
              {/* COLUNA DA LINHA */}
              <View
                style={styles.lineContainer}
              >
                <View
                  style={styles.markerWrapper}
                >
                  {isOrigem ? (
                    // Origem
                    <View
                      style={
                        styles.startOuterCircle
                      }
                    >
                      <View
                        style={
                          styles.startInnerCircle
                        }
                      />
                    </View>
                  ) : isDestino &&
                    !temParadas ? (
                    // Destino simples
                    <View
                      style={
                        styles.startOuterSquare
                      }
                    >
                      <View
                        style={
                          styles.startInnerSquare
                        }
                      />
                    </View>
                  ) : (
                    // Paradas
                    <View
                      style={[
                        styles.numberBox,

                        isDestino &&
                        temParadas
                          ? styles.lastNumberBoxHighlight
                          : null,
                      ]}
                    >
                      <Text
                        style={[
                          styles.numberText,

                          isDestino &&
                          temParadas
                            ? styles.lastNumberTextHighlight
                            : null,
                        ]}
                      >
                        {index}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Linha Vertical */}
                {!isDestino && (
                  <View
                    style={
                      styles.verticalLine
                    }
                  />
                )}
              </View>

              {/* INPUT */}
              <View
                style={[
                  styles.searchInput,

                  isDestino &&
                    styles.searchInputDestination,
                ]}
              >
                <TextInput
                  ref={(ref) => {
                    if (ref) {
                      inputRefs.current[
                        index
                      ] = ref;
                    }
                  }}
                  style={styles.input}
                  placeholder={
                    isOrigem
                      ? "Local de partida"
                      : isDestino
                      ? temParadas
                        ? "Destino"
                        : "Para onde você vai?"
                      : "Parada"
                  }
                  placeholderTextColor="#999"
                  value={item.name}
                  onFocus={() =>
                    setInputSelecionado(
                      index,
                    )
                  }
                  onChangeText={(texto) =>
                    atualizarInput(
                      texto,
                      index,
                    )
                  }
                />

                {/* BOTÃO ADD */}
                {isDestino && (
                  <TouchableOpacity
                    onPress={
                      adicionarParada
                    }
                    style={
                      styles.addButtonInline
                    }
                  >
                    <Ionicons
                      name="add"
                      size={20}
                      color="#666"
                    />
                  </TouchableOpacity>
                )}

                {/* AÇÕES DAS PARADAS */}
                {isParada && (
                  <View
                    style={{
                      flexDirection:
                        "row",

                      alignItems:
                        "center",
                    }}
                  >
                    <TouchableOpacity
                      onPress={() =>
                        moverParaCima(
                          index,
                        )
                      }
                      style={{
                        marginRight: 4,
                      }}
                    >
                      <Ionicons
                        name="chevron-up"
                        size={16}
                        color="#999"
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() =>
                        moverParaBaixo(
                          index,
                        )
                      }
                      style={{
                        marginRight: 6,
                      }}
                    >
                      <Ionicons
                        name="chevron-down"
                        size={16}
                        color="#999"
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() =>
                        removerParada(
                          index,
                        )
                      }
                      style={
                        styles.removeButtonInline
                      }
                    >
                      <Ionicons
                        name="close"
                        size={20}
                        color="#777"
                      />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          );
        },
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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

  // Origem
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

  // Destino sem parada
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

  // Paradas
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

  // Último item
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

  removeButtonInline: {
    padding: 4,
    marginLeft: 2,
  },
});