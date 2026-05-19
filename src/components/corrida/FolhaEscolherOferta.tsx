import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  onSheetChange: (index: number) => void;
}

interface CategoriaItem {
  id: string;
  titulo: string;
  subtitulo: string;
  preco: string;
  tempo: string;
  tipo: "carro" | "moto" | "taxi" | "entrega";
  selecionado?: boolean;
  negociavel?: boolean;
  iconeDireita?: "check" | "circle" | "arrow";
}

export default function FolhaEscolherOferta({ onSheetChange }: Props) {
  const sheetRef = useRef<BottomSheet | null>(null);

  const snapPoints = useMemo(() => ["35%", "82%"], []);

  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>("2");

  const categorias = useMemo<CategoriaItem[]>(
    () => [
      {
        id: "1",
        titulo: "Negocia",
        subtitulo: "Negocie e escolha",
        preco: "13,90",
        tempo: "4 min",
        tipo: "carro",
        negociavel: true,
      },
      {
        id: "2",
        titulo: "Pop",
        subtitulo: "11:01 · 4 min",
        preco: "15,40",
        tempo: "4 min",
        tipo: "carro",
        selecionado: true,
        iconeDireita: "check",
      },
      {
        id: "3",
        titulo: "Moto",
        subtitulo: "11:02 · 4 min",
        preco: "8,37",
        tempo: "4 min",
        tipo: "moto",
        iconeDireita: "circle",
      },
      {
        id: "4",
        titulo: "Pop Expresso",
        subtitulo: "11:01 · 2 min",
        preco: "17,71",
        tempo: "2 min",
        tipo: "carro",
        iconeDireita: "circle",
      },
      {
        id: "5",
        titulo: "Moto Negocia",
        subtitulo: "",
        preco: "9,30",
        tempo: "4 min",
        tipo: "moto",
        negociavel: true,
      },
      {
        id: "6",
        titulo: "Táxi",
        subtitulo: "11:03 · 4 min",
        preco: "30,58",
        tempo: "4 min",
        tipo: "taxi",
        iconeDireita: "circle",
      },
      {
        id: "7",
        titulo: "Entrega Moto",
        subtitulo: "11:06 · 6 min",
        preco: "8,20",
        tempo: "6 min",
        tipo: "entrega",
        iconeDireita: "arrow",
      },
    ],
    [],
  );

  const handleSheetChange = useCallback(
    (index: number) => {
      onSheetChange(index);
    },
    [onSheetChange],
  );

  const renderIcone = (tipo: string) => {
    switch (tipo) {
      case "carro":
        return (
          <Image
            source={{
              uri: "https://cdn-icons-png.flaticon.com/512/744/744465.png",
            }}
            style={styles.veiculoImagem}
          />
        );

      case "moto":
        return (
          <Image
            source={{
              uri: "https://cdn-icons-png.flaticon.com/512/2972/2972185.png",
            }}
            style={styles.veiculoImagem}
          />
        );

      case "taxi":
        return (
          <Image
            source={{
              uri: "https://cdn-icons-png.flaticon.com/512/3097/3097144.png",
            }}
            style={styles.veiculoImagem}
          />
        );

      case "entrega":
        return (
          <Image
            source={{
              uri: "https://cdn-icons-png.flaticon.com/512/2972/2972185.png",
            }}
            style={styles.veiculoImagem}
          />
        );

      default:
        return null;
    }
  };

  const renderRightIcon = (item: CategoriaItem) => {
    if (item.iconeDireita === "check") {
      return (
        <View style={styles.checkSelecionado}>
          <Ionicons name="checkmark" size={18} color="#fff" />
        </View>
      );
    }

    if (item.iconeDireita === "arrow") {
      return <Ionicons name="arrow-forward" size={22} color="#1f1f1f" />;
    }

    return <View style={styles.radioDesmarcado} />;
  };

  const renderItem = useCallback(
    ({ item }: { item: CategoriaItem }) => {
      const selecionado = categoriaSelecionada === item.id;

      return (
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.itemContainer}
          onPress={() => setCategoriaSelecionada(item.id)}
        >
          <View style={styles.leftContainer}>
            {renderIcone(item.tipo)}

            <View style={{ flex: 1 }}>
              <View style={styles.titleRow}>
                <Text style={styles.titulo}>{item.titulo}</Text>

                {item.negociavel && (
                  <MaterialCommunityIcons
                    name="account-group"
                    size={14}
                    color="#111"
                    style={{ marginLeft: 4 }}
                  />
                )}

                <View style={styles.infoDot} />
              </View>

              {!!item.subtitulo && (
                <Text style={styles.subtitulo}>{item.subtitulo}</Text>
              )}
            </View>
          </View>

          <View style={styles.rightContainer}>
            <Text style={styles.preco}>
              {item.titulo === "Táxi" ? "aprox. " : ""}
              R${item.preco}
            </Text>

            {selecionado ? (
              <View style={styles.checkSelecionado}>
                <Ionicons name="checkmark" size={18} color="#fff" />
              </View>
            ) : (
              renderRightIcon(item)
            )}
          </View>
        </TouchableOpacity>
      );
    },
    [categoriaSelecionada],
  );

  return (
    <View style={styles.container}>
      <BottomSheet
        ref={sheetRef}
        index={1}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        onChange={handleSheetChange}
        overDragResistanceFactor={13}
        enablePanDownToClose={false}
        handleIndicatorStyle={{
          backgroundColor: "#d1d5db",
          width: 42,
        }}
        backgroundStyle={{
          borderTopLeftRadius: 26,
          borderTopRightRadius: 26,
          backgroundColor: "#fff",
        }}
      >
        <BottomSheetFlatList
          data={categorias}
          keyExtractor={(item: CategoriaItem) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
          ListFooterComponent={
            <>
              <TouchableOpacity style={styles.cartaoContainer}>
                <View style={styles.cartaoLeft}>
                  <View style={styles.cartaoIcone}>
                    <View style={styles.mastercardCircle1} />
                    <View style={styles.mastercardCircle2} />
                  </View>

                  <Text style={styles.cartaoTexto}>3048</Text>
                </View>

                <Ionicons name="chevron-forward" size={20} color="#444" />
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.valorFooter}>R$15,40</Text>

                <TouchableOpacity style={styles.botaoSolicitar}>
                  <Text style={styles.botaoSolicitarTexto}>Solicitar</Text>

                  <Text style={styles.botaoSolicitarSubTexto}>Pop</Text>
                </TouchableOpacity>
              </View>
            </>
          }
        />
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },

  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  veiculoImagem: {
    width: 42,
    height: 42,
    resizeMode: "contain",
    marginRight: 12,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  titulo: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
  },

  subtitulo: {
    marginTop: 4,
    fontSize: 15,
    color: "#666",
  },

  infoDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#d1d5db",
    marginLeft: 6,
  },

  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  preco: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginRight: 12,
  },

  radioDesmarcado: {
    width: 24,
    height: 24,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#d1d5db",
  },

  checkSelecionado: {
    width: 24,
    height: 24,
    borderRadius: 999,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
  },

  cartaoContainer: {
    marginTop: 8,
    paddingVertical: 18,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#ececec",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  cartaoLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  cartaoIcone: {
    width: 34,
    height: 22,
    backgroundColor: "#111",
    borderRadius: 5,
    marginRight: 10,
    justifyContent: "center",
    paddingLeft: 6,
    flexDirection: "row",
    alignItems: "center",
  },

  mastercardCircle1: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: "#EA001B",
    position: "absolute",
    left: 8,
  },

  mastercardCircle2: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: "#F79E1B",
    position: "absolute",
    left: 14,
  },

  cartaoTexto: {
    marginLeft: 20,
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },

  footer: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  valorFooter: {
    fontSize: 36,
    fontWeight: "800",
    color: "#111",
  },

  botaoSolicitar: {
    backgroundColor: "#f5d400",
    width: 190,
    height: 78,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },

  botaoSolicitarTexto: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111",
  },

  botaoSolicitarSubTexto: {
    fontSize: 14,
    color: "#333",
    marginTop: 2,
  },
});
