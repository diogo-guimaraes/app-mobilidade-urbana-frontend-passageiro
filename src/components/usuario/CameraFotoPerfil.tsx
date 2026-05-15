import { useAuth } from "@/context/AuthProvider";
import { Ionicons } from "@expo/vector-icons";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { api } from "../../Services/api";

const { width, height } = Dimensions.get("window");

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function CameraFotoPerfil({
  visible,
  onClose,
}: Props) {
  const cameraRef = useRef<any>(null);

  const [permission, requestPermission] = useCameraPermissions();

  const [type, setType] = useState<CameraType>("front");

  const [fotoCapturada, setFotoCapturada] = useState<string | null>(
    null,
  );

  const [loading, setLoading] = useState(false);

  const { user, atualizarFotoUsuario } = useAuth();

  // RESETA FOTO AO FECHAR
  useEffect(() => {
    if (!visible) {
      setFotoCapturada(null);
    }
  }, [visible]);

  // MUITO IMPORTANTE
  // NÃO RENDERIZA NADA ENQUANTO visible = false
  if (!visible) {
    return null;
  }

  async function abrirPermissaoCamera() {
    if (!permission?.granted) {
      const response = await requestPermission();

      if (!response.granted) {
        Alert.alert(
          "Permissão necessária",
          "Precisamos de acesso à câmera.",
        );

        return false;
      }
    }

    return true;
  }

  async function tirarFoto() {
    try {
      const permitido = await abrirPermissaoCamera();

      if (!permitido) return;

      if (!cameraRef.current) return;

      const foto = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: true,
      });

      setFotoCapturada(foto.uri);
    } catch (error) {
      Alert.alert(
        "Erro",
        "Não foi possível capturar a foto.",
      );
    }
  }

  async function uploadImagem() {
    if (!fotoCapturada || !user?.id) return;

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("image", {
        uri: fotoCapturada,
        name: "foto.jpg",
        type: "image/jpeg",
      } as any);

      const response = await api.put(
        `/usuario-alterar-foto-perfil/${user.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      const dadosUsuario = response.data.user;

      await atualizarFotoUsuario({
        foto: dadosUsuario.foto,
        foto_thumbnail: dadosUsuario.foto_thumbnail,
      });

      Alert.alert(
        "Sucesso",
        "Imagem atualizada com sucesso!",
      );

      onClose();
    } catch (error: any) {
      Alert.alert(
        "Erro",
        error?.response?.data?.message ||
          "Não foi possível enviar a foto.",
      );
    } finally {
      setLoading(false);
    }
  }

  function refazerFoto() {
    setFotoCapturada(null);
  }

  function alternarCamera() {
    setType((current) =>
      current === "back" ? "front" : "back",
    );
  }

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!fotoCapturada ? (
        <>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={type}
          />

          {/* TOPO */}
          <View style={styles.topContainer}>
            <TouchableOpacity
              style={styles.topButton}
              onPress={onClose}
            >
              <Ionicons
                name="chevron-back"
                size={28}
                color="#FFF"
              />
            </TouchableOpacity>
          </View>

          {/* TEXTO */}
          <View style={styles.textContainer}>
            <Text style={styles.text}>
              Para garantir o seu perfil Premium,
              tente manter seu rosto visível.
            </Text>
          </View>

          {/* CÍRCULO GUIA */}
          <View style={styles.faceGuide} />

          {/* BOTTOM */}
          <View style={styles.bottomContainer}>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={tirarFoto}
            >
              <View style={styles.captureButtonInner}>
                <Ionicons
                  name="camera"
                  size={30}
                  color="#FFF"
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={alternarCamera}
            >
              <Ionicons
                name="camera-reverse-outline"
                size={28}
                color="#FFF"
              />
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <Image
            source={{ uri: fotoCapturada }}
            style={styles.preview}
          />

          <View style={styles.previewOverlay}>
            <TouchableOpacity
              style={styles.previewButton}
              onPress={refazerFoto}
            >
              <Text style={styles.previewButtonText}>
                Refazer
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.previewButton,
                styles.confirmButton,
              ]}
              onPress={uploadImagem}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.previewButtonText}>
                  Usar foto
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  camera: {
    flex: 1,
  },

  topContainer: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    zIndex: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  topButton: {
    width: 45,
    height: 45,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  textContainer: {
    position: "absolute",
    top: 110,
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  text: {
    color: "#FFF",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },

  faceGuide: {
    position: "absolute",
    top: height * 0.2,
    alignSelf: "center",
    width: width * 0.72,
    height: width * 0.9,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.7)",
  },

  bottomContainer: {
    position: "absolute",
    bottom: 50,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  captureButton: {
    width: 85,
    height: 85,
    borderRadius: 999,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
  },

  captureButtonInner: {
    width: 65,
    height: 65,
    borderRadius: 999,
    backgroundColor: "#ff7a00",
    justifyContent: "center",
    alignItems: "center",
  },

  switchButton: {
    position: "absolute",
    right: 35,
    bottom: 25,
  },

  preview: {
    flex: 1,
  },

  previewOverlay: {
    position: "absolute",
    bottom: 50,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingHorizontal: 20,
  },

  previewButton: {
    height: 55,
    minWidth: 140,
    borderRadius: 30,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  confirmButton: {
    backgroundColor: "#0f8749",
  },

  previewButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});