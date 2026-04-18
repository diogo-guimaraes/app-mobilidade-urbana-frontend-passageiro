import { Ionicons } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, { useCallback, useMemo, useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// ✅ Tipagem dos itens da lista
interface EnderecoItem {
  id: string;
  rua: string;
  cidade: string;
}

// 🔹 Props do componente
interface Props {
  visible: boolean;
  onClose: () => void;
  onSheetChange: (index: number) => void;
}

export default function FolhaEndereco({ onSheetChange }: Props) {
  const snapPoints = useMemo(() => ["89%"], []);
  const sheetRef = useRef<BottomSheet>(null);

  const handleSheetChange = useCallback(
    (index: number) => {
      onSheetChange(index);
    },
    [onSheetChange]
  );

  // ✅ Dados tipados
  const data: EnderecoItem[] = useMemo(
    () => [
      {
        id: "1",
        rua: "Av. Paulista, 1000",
        cidade: "São Paulo, SP",
      },
      {
        id: "2",
        rua: "Rua das Flores, 45",
        cidade: "Curitiba, PR",
      },
    ],
    []
  );

  // ✅ Render item tipado corretamente
  const renderItem = useCallback(
    ({ item, index }: { item: EnderecoItem; index: number }) => (
      <TouchableOpacity>
        <View
          style={[
            styles.item,
            index !== data.length - 1 && styles.borderBottom,
          ]}
        >
          <Ionicons
            name="time-outline"
            size={20}
            color="#666"
            style={{ marginRight: 12, marginTop: 2 }}
          />

          <View>
            <Text style={styles.rua}>{item.rua}</Text>
            <Text style={styles.cidade}>{item.cidade}</Text>
          </View>
        </View>
      </TouchableOpacity>
    ),
    [data]
  );

  return (
    <View style={StyleSheet.absoluteFill}>
      <BottomSheet
        ref={sheetRef}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        onChange={handleSheetChange}
        overDragResistanceFactor={13}
        enablePanDownToClose={false}
      >
        <BottomSheetView style={styles.container}>
          {/* Campo de busca */}
          <TouchableOpacity
            style={styles.inputContainer}
            activeOpacity={0.7}
          >
            <Ionicons name="search" size={24} color="black" />
            <Text style={styles.inputText}>Para onde vamos?</Text>
          </TouchableOpacity>

          {/* Lista */}
          <BottomSheetFlatList
            data={data}
            keyExtractor={(item: EnderecoItem) => item.id} // ✅ corrigido aqui
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
          />
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f8",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },

  inputText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },

  item: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 14,
  },

  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  rua: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },

  cidade: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },
});
