import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  BackHandler,
  Dimensions,
  Image,
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

export default function InformacoesRemetente({
  visible,
  onClose,
  duration = 200,
}: props) {
  const translateX = useRef(new Animated.Value(width)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const [isMounted, setIsMounted] = useState(visible);

  // Estados dos campos
  const [endereco, setEndereco] = useState("Rua Brasília, 2930");
  const [detalhes, setDetalhes] = useState("Pen6 Marketing");
  const [nome, setNome] = useState("Diogo");
  const [telefone, setTelefone] = useState("69981400661");

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
      onBackPress
    );
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

  const InputField = ({ label, value, onChangeText, icon, required = false }: any) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}{required && <Text style={{color: 'red'}}>*</Text>}</Text>
      <View style={styles.inputWrapper}>
        <TextInput 
          style={styles.input} 
          value={value} 
          onChangeText={onChangeText}
        />
        {icon && <Ionicons name={icon} size={20} color="#666" />}
      </View>
    </View>
  );

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

      <Animated.View
        style={[
          styles.drawer,
          { transform: [{ translateX }] },
        ]}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Informações do remetente</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
          {/* FORMULÁRIO */}
          <View style={styles.formSection}>
            <InputField 
              label="Endereço" 
              value={endereco} 
              onChangeText={setEndereco} 
              icon="chevron-forward" 
              required 
            />
            <InputField 
              label="Detalhes do endereço" 
              value={detalhes} 
              onChangeText={setDetalhes} 
            />
            <View style={styles.inputContainer}>
               <Text style={styles.label}>Nome para contato<Text style={{color: 'red'}}>*</Text></Text>
               <View style={styles.inputWrapper}>
                  <TextInput style={styles.input} value={nome} onChangeText={setNome} />
                  <MaterialIcons name="contact-phone" size={22} color="#666" />
               </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Número de telefone<Text style={{color: 'red'}}>*</Text></Text>
              <View style={styles.phoneInputWrapper}>
                <TouchableOpacity style={styles.countryPicker}>
                  <Image 
                    source={{ uri: 'https://flagcdn.com/w40/br.png' }} 
                    style={styles.flag} 
                  />
                  <Text style={styles.countryCode}>+55</Text>
                  <Ionicons name="caret-down" size={12} color="#666" />
                </TouchableOpacity>
                <TextInput 
                  style={[styles.input, { flex: 1, marginLeft: 10 }]} 
                  value={telefone} 
                  keyboardType="phone-pad"
                  onChangeText={setTelefone}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.confirmButton}>
              <Text style={styles.confirmButtonText}>Confirmar</Text>
            </TouchableOpacity>
          </View>

          {/* ENDEREÇOS RECENTES */}
          <View style={styles.recentSection}>
            <Text style={styles.recentTitle}>Endereços recentes</Text>
            
            {[
              { addr: "Rua Rui Barbosa, 1493", sub: "Feijoada", detail: "Diogo • 69981400661" },
              { addr: "Rua Portuguesa, 6244", sub: "casa", detail: "Diana Deise • 69981195656" },
              { addr: "Rua Portuguesa, 6374", sub: "", detail: "Diogo • 69981400661" },
              { addr: "Rua Brasília, 2930", sub: "Pen6 Marketing", detail: "Diogo • 69981400661" },
              { addr: "Rua Rui Barbosa, 1493", sub: "Feijoada", detail: "Diogo • 69981400661" },
              { addr: "Rua Portuguesa, 6244", sub: "casa", detail: "Diana Deise • 69981195656" },
              { addr: "Rua Portuguesa, 6374", sub: "", detail: "Diogo • 69981400661" },
              { addr: "Rua Brasília, 2930", sub: "Pen6 Marketing", detail: "Diogo • 69981400661" },
            ].map((item, index) => (
              <View key={index} style={styles.recentItem}>
                <Ionicons name="location-sharp" size={22} color="#888" style={styles.locationIcon} />
                <View style={styles.recentTextContainer}>
                  <Text style={styles.recentAddrText}>
                    {item.addr}{item.sub ? ` - ${item.sub}` : ""}
                  </Text>
                  <Text style={styles.recentSubText}>{item.detail}</Text>
                </View>
                <TouchableOpacity>
                  <MaterialIcons name="edit" size={20} color="#888" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  body: {
    flex: 1,
  },
  formSection: {
    padding: 20,
    backgroundColor: '#FFF',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    color: "#888",
    marginBottom: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    padding: 0,
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 8,
  },
  countryPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#EEE',
    paddingRight: 10,
  },
  flag: {
    width: 24,
    height: 16,
    borderRadius: 2,
    marginRight: 6,
  },
  countryCode: {
    fontSize: 16,
    color: "#333",
    marginRight: 4,
  },
  confirmButton: {
    backgroundColor: "#FFD700", // Amarelo padrão 99
    borderRadius: 12,
    height: 55,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  recentSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  recentTitle: {
    fontSize: 14,
    color: "#999",
    marginBottom: 15,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F0F0F0',
  },
  locationIcon: {
    marginRight: 15,
  },
  recentTextContainer: {
    flex: 1,
  },
  recentAddrText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
  },
  recentSubText: {
    fontSize: 13,
    color: "#999",
    marginTop: 2,
  },
});