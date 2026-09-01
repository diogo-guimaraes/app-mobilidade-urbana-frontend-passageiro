import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import React, { useEffect, useState } from "react";

import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// 🔥 mesma chave de cache que o ParaOndeVamos.tsx usa pra salvar o
// histórico de endereços escolhidos — assim as buscas recentes de
// verdade aparecem aqui, em vez de endereços fixos/mockados
const CACHE_HISTORICO_KEY = "@historico_enderecos";

interface EnderecoHistorico {
  name: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
}

// 🔥 painel estático (não é mais um bottom sheet arrastável/colapsável —
// pedido do usuário: "Para onde vamos?" sempre visível por completo, sem
// precisar arrastar pra revelar o histórico)
interface props {
  onPressParaOndeVamos?: () => void;
}

export default function FolhaInferior({ onPressParaOndeVamos }: props) {
  const [historico, setHistorico] = useState<EnderecoHistorico[]>([]);

  // 🔥 recarrega toda vez que o painel volta a aparecer — ele desmonta
  // enquanto ParaOndeVamos/ViagemComParada/etc. estão abertos, então
  // remontar já pega qualquer busca nova salva nesse meio tempo
  useEffect(() => {
    const carregarHistorico = async () => {
      try {
        const cache = await AsyncStorage.getItem(CACHE_HISTORICO_KEY);

        if (cache) {
          setHistorico(JSON.parse(cache));
        }
      } catch (error) {
        console.log("Erro ao carregar histórico de endereços:", error);
      }
    };

    carregarHistorico();
  }, []);

  return (
    <View style={styles.container}>
      {/* 🔥 INPUT */}
      <TouchableOpacity
        style={styles.inputContainer}
        activeOpacity={0.7}
        onPress={onPressParaOndeVamos}
      >
        <Ionicons
          name="search"
          size={26}
          color="black"
          style={{ marginRight: 8 }}
        />

        <Text style={styles.inputText}>Para onde vamos?</Text>
      </TouchableOpacity>

      {/* 🔥 buscas recentes de verdade */}
      {historico.length === 0 ? (
        <Text style={styles.semHistoricoText}>
          Seus últimos endereços buscados aparecem aqui
        </Text>
      ) : (
        <FlatList
          data={historico}
          keyExtractor={(item, index) => `${item.formattedAddress}-${index}`}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={styles.itemContainer}
              activeOpacity={0.7}
              onPress={onPressParaOndeVamos}
            >
              <View
                style={[
                  styles.itemRow,
                  index !== historico.length - 1 && styles.itemBorda,
                ]}
              >
                <Ionicons
                  name="time-outline"
                  size={20}
                  color="#666"
                  style={{ marginRight: 12, marginTop: 2 }}
                />

                <View style={styles.itemTextos}>
                  <Text style={styles.itemRua} numberOfLines={1}>
                    {item.name}
                  </Text>

                  <Text style={styles.itemCidade} numberOfLines={1}>
                    {item.formattedAddress}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 6,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f8",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },

  inputText: {
    marginLeft: 8,
    fontSize: 22,
    fontWeight: "600",
    color: "black",
  },

  semHistoricoText: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 24,
  },

  itemContainer: {
    width: "100%",
  },

  itemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 14,
  },

  itemBorda: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  itemTextos: {
    flex: 1,
  },

  itemRua: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },

  itemCidade: {
    fontSize: 13,
    color: "#6B7280",
  },
});
