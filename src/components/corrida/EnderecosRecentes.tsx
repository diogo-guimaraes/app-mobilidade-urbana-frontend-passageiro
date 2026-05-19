// components/EnderecosRecentes.tsx

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
// Importamos a interface do pai para garantir sincronia total de tipos
import { EnderecoItem } from "./ParaOndeVamos";

interface EnderecosRecentesProps {
  loading: boolean;
  skeletonOpacity: Animated.Value;
  listaEnderecos: Omit<EnderecoItem, "order">[] | EnderecoItem[];
  onSelecionarEndereco: (item: any) => void;
}

export default function EnderecosRecentes({
  loading,
  skeletonOpacity,
  listaEnderecos,
  onSelecionarEndereco,
}: EnderecosRecentesProps) {
  return (
    <View style={styles.container}>
      {/* AÇÕES RÁPIDAS */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickButton}>
          <Ionicons name="home" size={16} color="#5F6368" />

          <Text numberOfLines={1} style={styles.quickText}>
            Avenida Bo...
          </Text>

          <Ionicons name="chevron-forward" size={14} color="#B0B0B0" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickButton}>
          <Ionicons name="briefcase" size={16} color="#5F6368" />

          <Text style={styles.quickText}>Trabalho</Text>

          <Ionicons name="chevron-forward" size={14} color="#B0B0B0" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickButton}>
          <Ionicons name="star" size={16} color="#5F6368" />

          <Text style={styles.quickText}>Favoritos</Text>

          <Ionicons name="chevron-forward" size={14} color="#B0B0B0" />
        </TouchableOpacity>
      </View>

      {/* DIVIDER */}
      <View style={styles.divider} />

      {/* LISTA / SKELETON LOAD */}
      <View style={styles.list}>
        {loading
          ? Array.from({
              length: 4,
            }).map((_, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.listItem,
                  {
                    opacity: skeletonOpacity,
                  },
                ]}
              >
                <View
                  style={[
                    styles.listIconContainer,
                    {
                      backgroundColor: "#EBEBEB",
                    },
                  ]}
                />

                <View style={styles.listContent}>
                  <View
                    style={{
                      width: "60%",
                      height: 14,
                      backgroundColor: "#EBEBEB",
                      borderRadius: 4,
                      marginBottom: 8,
                    }}
                  />

                  <View
                    style={{
                      width: "90%",
                      height: 10,
                      backgroundColor: "#EBEBEB",
                      borderRadius: 4,
                    }}
                  />
                </View>
              </Animated.View>
            ))
          : listaEnderecos.map((endereco, index) => (
              <TouchableOpacity
                key={index}
                style={styles.listItem}
                onPress={() => onSelecionarEndereco(endereco)}
              >
                <View style={styles.listIconContainer}>
                  <Ionicons name="time" size={14} color="#111" />
                </View>

                <View style={styles.listContent}>
                  <Text style={styles.listText}>{endereco.name}</Text>

                  <Text style={styles.listSubText}>
                    {endereco.formattedAddress}
                  </Text>
                </View>

                <Text style={styles.distanceText}>{endereco.distancia}</Text>
              </TouchableOpacity>
            ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  quickActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  quickButton: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginHorizontal: 4,
  },

  quickText: {
    flex: 1,
    fontSize: 14,
    color: "#5F6368",
    fontWeight: "600",
    marginLeft: 8,
    marginRight: 4,
  },

  divider: {
    height: 1,
    backgroundColor: "#F1F1F1",
    marginHorizontal: -24,
    marginBottom: 8,
  },

  list: {
    marginTop: 4,
  },

  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 14,
  },

  listIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F3F3F3",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    marginTop: 2,
  },

  listContent: {
    flex: 1,
    paddingRight: 10,
  },

  listText: {
    fontSize: 16,
    color: "#2B2B2B",
    fontWeight: "700",
    marginBottom: 3,
  },

  listSubText: {
    fontSize: 13,
    lineHeight: 18,
    color: "#909090",
    fontWeight: "400",
  },

  distanceText: {
    fontSize: 14,
    color: "#9B9B9B",
    marginTop: 2,
  },
});
