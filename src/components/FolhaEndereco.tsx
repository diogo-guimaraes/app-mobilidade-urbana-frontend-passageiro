import { Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetTextInput
} from "@gorhom/bottom-sheet";
import React, { useCallback, useMemo, useRef } from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const { width } = Dimensions.get("window");

// ✅ Tipagem atualizada conforme a imagem
interface EnderecoItem {
  id: string;
  local: string;
  subtitulo: string;
  distancia: string;
  iconType: "history" | "location";
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onSheetChange: (index: number) => void;
}

export default function FolhaEndereco({ visible, onClose, onSheetChange }: Props) {
  const snapPoints = useMemo(() => ["89%"], []);
  const sheetRef = useRef<BottomSheet>(null);

  // ✅ Dados baseados na imagem image_9c5f50.png
  const data: EnderecoItem[] = useMemo(
    () => [
      {
        id: "1",
        local: "Rua Jobu Miró, 3287",
        subtitulo: "Flodoaldo Pontes Pinto, Porto Velho - RO, 76820-608, Brasil",
        distancia: "3.2km",
        iconType: "history",
      },
      {
        id: "2",
        local: "Rua Brasília, 2930",
        subtitulo: "São Cristóvão, Porto Velho - RO, 76804-070, Brasil",
        distancia: "7km",
        iconType: "history",
      },
      {
        id: "3",
        local: "Rua Portuguesa, 6244",
        subtitulo: "Conjunto Jamari, Porto Velho - RO, 76812-612, Brasil",
        distancia: "5.4km",
        iconType: "history",
      },
      {
        id: "4",
        local: "Bob's Drive Thru - Av. Jorge Teixeira",
        subtitulo: "Avenida Gov. Jorge Teixeira, 1612 - Embratel, Porto Velho - RO, 76820-844, Brasil",
        distancia: "6.3km",
        iconType: "history",
      },
      {
        id: "5",
        local: "Rua Jobu Miró, 3287",
        subtitulo: "Flodoaldo Pontes Pinto, Porto Velho - RO, 76820-608, Brasil",
        distancia: "3.2km",
        iconType: "history",
      },
      {
        id: "6",
        local: "Rua Brasília, 2930",
        subtitulo: "São Cristóvão, Porto Velho - RO, 76804-070, Brasil",
        distancia: "7km",
        iconType: "history",
      },
      {
        id: "7",
        local: "Rua Portuguesa, 6244",
        subtitulo: "Conjunto Jamari, Porto Velho - RO, 76812-612, Brasil",
        distancia: "5.4km",
        iconType: "history",
      },
      {
        id: "8",
        local: "Bob's Drive Thru - Av. Jorge Teixeira",
        subtitulo: "Avenida Gov. Jorge Teixeira, 1612 - Embratel, Porto Velho - RO, 76820-844, Brasil",
        distancia: "6.3km",
        iconType: "history",
      },
    ],
    []
  );

  const renderItem = useCallback(({ item }: { item: EnderecoItem }) => (
    <TouchableOpacity style={styles.itemContainer} activeOpacity={0.7}>
      <View style={styles.iconCircle}>
        <MaterialIcons
          name={item.iconType === "history" ? "history" : "location-on"}
          size={20}
          color="#fff"
        />
      </View>
      <View style={styles.textContainer}>
        <View style={styles.rowBetween}>
          <Text style={styles.localTitle} numberOfLines={1}>{item.local}</Text>
          <Text style={styles.distanciaText}>{item.distancia}</Text>
        </View>
        <Text style={styles.subtituloText} numberOfLines={2}>{item.subtitulo}</Text>
      </View>
    </TouchableOpacity>
  ), []);

  const ListHeader = () => (
    <View style={styles.headerContent}>
      {/* Atalhos Rápidos */}
      <View style={styles.shortcutsRow}>
        <TouchableOpacity style={styles.shortcutItem}>
          <MaterialCommunityIcons name="office-building" size={20} color="#666" />
          <Text style={styles.shortcutText}>Avenida Bo...</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.shortcutItem}>
          <MaterialCommunityIcons name="briefcase" size={20} color="#666" />
          <Text style={styles.shortcutText}>Trabalho</Text>
          <Ionicons name="chevron-forward" size={14} color="#CCC" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.shortcutItem}>
          <MaterialCommunityIcons name="star" size={20} color="#666" />
          <Text style={styles.shortcutText}>Favoritos</Text>
          <Ionicons name="chevron-forward" size={14} color="#CCC" />
        </TouchableOpacity>
      </View>
      <View style={styles.dividerFull} />
    </View>
  );

  const ListFooter = () => (
    <View style={styles.footerContainer}>
      <TouchableOpacity style={styles.footerItem}>
        <MaterialIcons name="location-on" size={24} color="#CCC" style={styles.footerIcon} />
        <Text style={styles.footerText}>Marque o local no mapa</Text>
      </TouchableOpacity>

      <View style={styles.dividerFooter} />

      <TouchableOpacity style={styles.footerItem}>
        <Ionicons name="add" size={24} color="#CCC" style={styles.footerIcon} />
        <Text style={styles.footerText}>Adicionar local</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.footerItem}>
        <MaterialIcons name="edit" size={20} color="#CCC" style={styles.footerIcon} />
        <Text style={styles.footerText}>Sugerir alteração de local</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.footerItem}>
        <MaterialIcons name="chat-bubble-outline" size={20} color="#CCC" style={styles.footerIcon} />
        <Text style={styles.footerText}>Outros comentários</Text>
      </TouchableOpacity>
    </View>
  );

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill}>
      <BottomSheet
        ref={sheetRef}
        index={0}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        overDragResistanceFactor={13}
        enablePanDownToClose={true}
        onChange={onSheetChange}
        handleIndicatorStyle={{ backgroundColor: "#DDD", width: 40 }}
        enableOverDrag={false}
      >
        {/* Remove BottomSheetView - vai direto para o FlatList */}
        <>
          {/* Header de Busca */}
          <View style={styles.searchHeader}>
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons name="flag-variant" size={20} color="#000" style={styles.flagIcon} />
              <BottomSheetTextInput
                style={styles.input}
                placeholder="Entregar para"
                placeholderTextColor="#CCC"
              />
            </View>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>

          <BottomSheetFlatList
            data={data}
            keyExtractor={(item: EnderecoItem) => item.id}
            renderItem={renderItem}
            ListHeaderComponent={ListHeader}
            ListFooterComponent={ListFooter}
            showsVerticalScrollIndicator={false}
          />
        </>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  searchHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F8F8", // Cor de fundo suave conforme imagem
    borderRadius: 30,
    paddingHorizontal: 15,
    height: 48,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  flagIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  cancelText: {
    fontSize: 16,
    color: "#666",
  },
  headerContent: {
    marginTop: 10,
  },
  shortcutsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 15,
    justifyContent: "space-between",
  },
  shortcutItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    gap: 4,
  },
  shortcutText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  dividerFull: {
    height: 1,
    backgroundColor: "#F0F0F0",
    width: "100%",
  },
  itemContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 15,
    alignItems: "center",
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#000", // Ícones de histórico em preto na imagem
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#F8F8F8",
    paddingBottom: 10,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  localTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    marginRight: 10,
  },
  distanciaText: {
    fontSize: 12,
    color: "#AAA",
  },
  subtituloText: {
    fontSize: 13,
    color: "#999",
    marginTop: 2,
    lineHeight: 18,
  },
  footerContainer: {
    marginTop: 10,
    borderTopWidth: 8,
    borderTopColor: "#F8F8F8", // Divisor grosso entre lista e ações
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  footerIcon: {
    marginRight: 15,
  },
  footerText: {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
  },
  dividerFooter: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginLeft: 55, // Alinhado com o texto
  },
});