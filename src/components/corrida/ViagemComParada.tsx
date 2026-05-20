// components/ParaOndeVamos.tsx

import { EnderecosRecentesRef } from "@/components/corrida/EnderecosRecentes";

import InputsItinerario, {
  EnderecoItem,
  InputsItinerarioRef,
} from "@/components/corrida/InputsIntinerario";

import { Ionicons } from "@expo/vector-icons";

import React, { useEffect, useRef, useState } from "react";

import {
  Animated,
  BackHandler,
  Dimensions,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { api } from "../../Services/api";

const { width } = Dimensions.get("window");

interface props {
  visible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function ParaOndevamos({
  visible,
  onClose,
  duration = 300,
}: props) {
  // ANIMAÇÕES
  const translateX = useRef(new Animated.Value(width)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const skeletonOpacity = useRef(new Animated.Value(0.4)).current;

  // ESTADOS
  const [isMounted, setIsMounted] = useState(visible);
  const [listaEnderecos, setListaEnderecos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentInputText, setCurrentInputText] = useState(""); // 🔥 NOVO: texto atual do input selecionado

  // REFS
  const inputsItinerarioRef = useRef<InputsItinerarioRef>(null);
  const enderecosRecentesRef = useRef<EnderecosRecentesRef>(null);

  // ANIMAÇÃO DO SKELETON
  useEffect(() => {
    let animationLoop: Animated.CompositeAnimation | null = null;

    if (loading) {
      animationLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(skeletonOpacity, {
            toValue: 0.8,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(skeletonOpacity, {
            toValue: 0.4,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      );

      animationLoop.start();
    } else {
      skeletonOpacity.setValue(0.4);
    }

    return () => {
      if (animationLoop) {
        animationLoop.stop();
      }
    };
  }, [loading]);

  // BUSCAR ENDEREÇOS NA API
  const buscarEnderecoApi = async (texto: string) => {
    if (!texto || texto.trim().length === 0) {
      setListaEnderecos([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const response = await api.get("/buscar-endereco", {
        params: { endereco: texto },
      });

      if (response.data) {
        const { name, formattedAddress, latitude, longitude } = response.data;

        const novoEnderecoObjeto = {
          name,
          formattedAddress,
          latitude,
          longitude,
          distancia: "--",
        };

        setListaEnderecos([novoEnderecoObjeto]);
      }
    } catch (error) {
      console.log("Erro ao buscar endereço no backend:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 HANDLER: Quando o input muda (via callback do InputsItinerario)
  const handleInputsChange = (
    inputs: EnderecoItem[],
    inputSelecionado: number,
  ) => {
    const textoAtual = inputs[inputSelecionado]?.name || "";
    setCurrentInputText(textoAtual);

    // Dispara a busca com debounce
    const timeoutId = setTimeout(() => {
      if (visible) {
        buscarEnderecoApi(textoAtual);
      }
    }, 600);

    return () => clearTimeout(timeoutId);
  };

  // 🔥 HANDLER: Selecionar endereço da lista
  const handleSelecionarEndereco = async (item: any) => {
    Keyboard.dismiss();

    const inputSelecionado =
      inputsItinerarioRef.current?.getInputSelecionado() ?? 1;

    // Atualizar o input via ref
    inputsItinerarioRef.current?.setInputValue(inputSelecionado, {
      name: item.name,
      formattedAddress: item.formattedAddress,
      latitude: item.latitude,
      longitude: item.longitude,
    });

    // Salvar no cache de endereços recentes
    if (enderecosRecentesRef.current) {
      await enderecosRecentesRef.current.salvarEnderecoNoCache({
        name: item.name,
        formattedAddress: item.formattedAddress,
        latitude: item.latitude,
        longitude: item.longitude,
        distancia: item.distancia || "--",
      });
    }

    // Limpar a lista de resultados
    setListaEnderecos([]);

    console.log("📍 Endereço Selecionado com Sucesso!");
  };

  // BACKHANDLER
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

  // ANIMAÇÕES DE ENTRADA/SAÍDA
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
      ]).start(() => {
        setTimeout(() => {
          inputsItinerarioRef.current?.focusInput(1); // Foca no destino
        }, 100);
      });
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
      ]).start(({ finished }) => {
        if (finished) {
          setIsMounted(false);
          inputsItinerarioRef.current?.resetInputs(); // Reset via ref
          setListaEnderecos([]);
          setLoading(false);
          setCurrentInputText("");
        }
      });
    }
  }, [visible, translateX, overlayOpacity, duration]);

  if (!isMounted) return null;

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 30 }]}>
      {/* Overlay */}
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: "rgba(0,0,0,0.25)",
              opacity: overlayOpacity,
            },
          ]}
        />
      </Pressable>

      {/* Drawer */}
      <Animated.View
        style={[
          styles.drawer,
          {
            transform: [{ translateX }],
            zIndex: 31,
          },
        ]}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="black" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <View style={styles.userContainer}>
              <View style={styles.userPill}>
                <Ionicons name="person-circle" size={28} color="#666" />
                <Text style={styles.userName}>Diogo</Text>
                <Ionicons name="chevron-down" size={16} color="#666" />
              </View>
            </View>
          </View>

          <View style={{ width: 24 }} />
        </View>

        <View style={{ padding: 10 }} />

        {/* Título */}
        <Text style={styles.title}>Para onde vamos?</Text>

        {/* INPUTS */}
        <InputsItinerario
          ref={inputsItinerarioRef}
          onInputsChange={handleInputsChange}
        />

        {/* LISTA */}
        {/* <EnderecosRecentes
          ref={enderecosRecentesRef}
          loading={loading}
          skeletonOpacity={skeletonOpacity}
          listaEnderecos={listaEnderecos}
          onSelecionarEndereco={handleSelecionarEndereco}
        /> */}
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
    paddingHorizontal: 24,
    paddingTop: 20,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 30,
  },

  backButton: {
    marginTop: 10,
  },

  headerCenter: {
    alignItems: "center",
  },

  userContainer: {
    alignItems: "center",
    marginTop: 24,
    marginBottom: 30,
  },

  userPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },

  userName: {
    fontSize: 15,
    color: "#111",
    fontWeight: "600",
    marginHorizontal: 8,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000",
    marginBottom: 28,
  },
});
