// components/InputsItinerario.tsx

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

export interface EnderecoItem {
  name: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  distancia: string | number;
  order: number;
}

interface InputsItinerarioProps {
  inputsIntinerario: EnderecoItem[];
  inputRefs: React.MutableRefObject<TextInput[]>;
  setInputSelecionado: (index: number) => void;
  atualizarInput: (texto: string, index: number) => void;
  moverParaCima: (index: number) => void;
  moverParaBaixo: (index: number) => void;
  removerParada: (index: number) => void;
  adicionarParada: () => void;
}

export default function InputsItinerario({
  inputsIntinerario,
  inputRefs,
  setInputSelecionado,
  atualizarInput,
  moverParaCima,
  moverParaBaixo,
  removerParada,
  adicionarParada,
}: InputsItinerarioProps) {
  
  // Condição para saber se a rota possui paradas intermediárias (3 ou mais endereços)
  const temParadas = inputsIntinerario.length >= 3;

  return (
    <View style={styles.searchContainer}>
      {inputsIntinerario.map((item, index) => {
        const isOrigem = index === 0;
        const isDestino = index === inputsIntinerario.length - 1;
        const isParada = !isOrigem && !isDestino;

        return (
          <View key={index} style={styles.rowContainer}>
            
            {/* COLUNA DA LINHA LATERAL CRONOLÓGICA */}
            <View style={styles.lineContainer}>
              <View style={styles.markerWrapper}>
                {isOrigem ? (
                  // Ponto de Partida Inicial (Sempre fixo)
                  <View style={styles.startOuterCircle}>
                    <View style={styles.startInnerCircle} />
                  </View>
                ) : isDestino && !temParadas ? (
                  // Destino Final Direto (Quando NÃO há paradas intermediárias)
                  <View style={styles.startOuterSquare}>
                    <View style={styles.startInnerSquare} />
                  </View>
                ) : (
                  // Caixas Numeradas (Para paradas intermediárias OU destino final quando HÁ paradas)
                  <View 
                    style={[
                      styles.numberBox, 
                      isDestino && temParadas ? styles.lastNumberBoxHighlight : null
                    ]}
                  >
                    <Text 
                      style={[
                        styles.numberText, 
                        isDestino && temParadas ? styles.lastNumberTextHighlight : null
                      ]}
                    >
                      {index}
                    </Text>
                  </View>
                )}
              </View>

              {/* Linha vertical conectora */}
              {!isDestino && <View style={styles.verticalLine} />}
            </View>

            {/* COLUNA DOS INPUTS DE TEXTO */}
            <View
              style={[
                styles.searchInput,
                isDestino && styles.searchInputDestination,
              ]}
            >
              <TextInput
                ref={(ref) => {
                  if (ref) {
                    inputRefs.current[index] = ref;
                  }
                }}
                style={styles.input}
                placeholder={
                  isOrigem
                    ? "Local de partida"
                    : isDestino
                    ? temParadas ? "Destino" : "Para onde você vai?"
                    : "Parada"
                }
                placeholderTextColor="#999"
                value={item.name}
                onFocus={() => setInputSelecionado(index)}
                onChangeText={(texto) => atualizarInput(texto, index)}
              />

              {/* REQUISITO: BOTÃO ADICIONAR AO LADO DO DESTINO */}
              {isDestino && (
                <TouchableOpacity
                  onPress={adicionarParada}
                  style={styles.addButtonInline}
                >
                  <Ionicons name="add" size={20} color="#666" />
                </TouchableOpacity>
              )}

              {/* REQUISITO: BOTÃO REMOVER EXCLUSIVO NAS PARADAS INTERMEDIÁRIAS */}
              {isParada && (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <TouchableOpacity onPress={() => moverParaCima(index)} style={{ marginRight: 4 }}>
                    <Ionicons name="chevron-up" size={16} color="#999" />
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => moverParaBaixo(index)} style={{ marginRight: 6 }}>
                    <Ionicons name="chevron-down" size={16} color="#999" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => removerParada(index)}
                    style={styles.removeButtonInline}
                  >
                    <Ionicons name="close" size={20} color="#777" />
                  </TouchableOpacity>
                </View>
              )}
            </View>

          </View>
        );
      })}
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
  // Ícone de partida (Círculo externo e interno)
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
  // Destino Direto Sem Paradas (Quadrado)
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
  // Caixa das Paradas com sequencial numérico padrão
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
  // Modificadores para destacar o último número caso haja paradas
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