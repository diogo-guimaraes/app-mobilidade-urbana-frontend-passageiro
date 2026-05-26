import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  BackHandler,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

const { width } = Dimensions.get("window");

interface props {
  visible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function DetalhesItem({
  visible,
  onClose,
  duration = 200,
}: props) {
  const translateX = useRef(new Animated.Value(width)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const [isMounted, setIsMounted] = useState(visible);

  // Estados para os inputs
  const [categoria, setCategoria] = useState("Outros");
  const [valor, setValor] = useState("");
  const [observacao, setObservacao] = useState("");

  const categorias = [
    { id: "1", label: "Itens pessoais", icon: "user-alt" },
    { id: "2", label: "Alimentação", icon: "coffee" },
    { id: "3", label: "Vestuário", icon: "tshirt" },
    { id: "4", label: "Eletrônicos", icon: "mobile-alt" },
    { id: "5", label: "Documentos", icon: "file-alt" },
    { id: "6", label: "Chaves", icon: "key" },
    { id: "7", label: "Medicamentos", icon: "pills" },
    { id: "8", label: "Outros", icon: "th-large" },
  ];

  useEffect(() => {
    const onBackPress = () => {
      if (visible) {
        onClose();
        return true;
      }
      return false;
    };
    const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => subscription.remove();
  }, [visible, onClose]);

  useEffect(() => {
    if (visible) {
      setIsMounted(true);
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: duration * 0.8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: width,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: duration * 0.8,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => finished && setIsMounted(false));
    }
  }, [visible, translateX, overlayOpacity, duration]);

  if (!isMounted) return null;

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 30 }]}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: "rgba(0,0,0,0.25)", opacity: overlayOpacity },
          ]}
        />
      </Pressable>

      <Animated.View style={[styles.drawer, { transform: [{ translateX }] }]}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="chevron-back" size={26} color="#111" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Detalhes do item</Text>
            <View style={{ width: 26 }} />
          </View>
        </View>

        <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
          {/* TIPO DE ITEM */}
          <Text style={styles.sectionTitle}>Tipo de item</Text>
          <View style={styles.chipsContainer}>
            {categorias.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => setCategoria(item.label)}
                style={[
                  styles.chip,
                  categoria === item.label ? styles.chipActive : styles.chipInactive,
                ]}
              >
                <FontAwesome5 
                  name={item.icon} 
                  size={14} 
                  color={categoria === item.label ? "#FFF" : "#666"} 
                />
                <Text style={[
                  styles.chipText,
                  categoria === item.label ? styles.textActive : styles.textInactive
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.inputSearch}
            placeholder="Insira o tipo de item"
            placeholderTextColor="#999"
          />
          <Text style={styles.charCounter}>0/50</Text>

          {/* VALOR DO ITEM */}
          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Valor do item</Text>
          <View style={styles.valueInputContainer}>
            <Text style={styles.currencyPrefix}>R$</Text>
            <TextInput
              style={styles.inputValue}
              placeholder="Insira o valor do item"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={valor}
              onChangeText={setValor}
            />
          </View>
          <Text style={styles.warningText}>
            A 99 não sugere envio de itens com valor superior a R$500
          </Text>

          {/* OBSERVAÇÕES */}
          <Text style={[styles.sectionTitle, { marginTop: 25 }]}>Observações da entrega</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Adicione uma descrição ou observações"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={observacao}
            onChangeText={setObservacao}
          />
        </ScrollView>

        {/* BOTÃO CONFIRMAR */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.btnConfirm} onPress={onClose}>
            <Text style={styles.btnConfirmText}>Confirmar</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  drawer: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: "100%",
    backgroundColor: "#FFF",
  },
  header: {
    backgroundColor: "#fff",
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111",
  },
  body: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 15,
  },
  // CHIPS
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 15,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 0,
  },
  chipActive: {
    backgroundColor: "#FF7A45", // Laranja da imagem
  },
  chipInactive: {
    backgroundColor: "#F5F5F5",
  },
  chipText: {
    fontSize: 13,
    marginLeft: 6,
    fontWeight: "500",
  },
  textActive: { color: "#FFF" },
  textInactive: { color: "#333" },

  // INPUTS
  inputSearch: {
    backgroundColor: "#F8F8F8",
    padding: 15,
    borderRadius: 10,
    fontSize: 14,
  },
  charCounter: {
    textAlign: "right",
    fontSize: 11,
    color: "#999",
    marginTop: 4,
  },
  valueInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  currencyPrefix: {
    fontSize: 14,
    color: "#000",
    marginRight: 8,
  },
  inputValue: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 14,
  },
  warningText: {
    fontSize: 12,
    color: "#000",
    marginTop: 10,
    lineHeight: 16,
  },
  textArea: {
    backgroundColor: "#F8F8F8",
    padding: 15,
    borderRadius: 10,
    height: 100,
    fontSize: 14,
  },

  // FOOTER
  footer: {
    padding: 16,
    paddingBottom: 35,
    backgroundColor: "#FFF",
  },
  btnConfirm: {
    backgroundColor: "#FFD100", // Amarelo padrão 99
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: "center",
  },
  btnConfirmText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
});