// components/Map.tsx
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import React, { useCallback, useEffect, useRef, useState } from "react";

import { InterfaceEndereco } from "@/app/(main)/home";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import MapView, {
  Marker,
  Polyline,
  Region,
  UserLocationChangeEvent,
} from "react-native-maps";

import MapViewDirections from "react-native-maps-directions";
interface MapProps {
  region: Region | null;

  onRegionChange: (region: Region) => void;

  // 🔥 recebe endereço formatado
  onUserLocationFound?: (region: Region, addressName?: string) => void;

  bottomSheetIndex?: number;

  // 🔥 NOVO
  itinerario?: InterfaceEndereco[];

  mapBottomPadding?: number;
}

// Região padrão (São Paulo)
const DEFAULT_REGION: Region = {
  latitude: -23.5505,
  longitude: -46.6333,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

const CACHE_KEY = "@last_user_location";

// Cache de rota em memória (nível de módulo, sobrevive a remounts do Map
// enquanto o app está aberto) — evita chamar a Directions API de novo pra
// uma origem/destino já calculada há pouco tempo.
interface RotaCacheada {
  coordinates: { latitude: number; longitude: number }[];
  timestamp: number;
}

const CACHE_ROTA_TTL_MS = 5 * 60 * 1000; // 5 minutos

// "globalThis.Map" porque o componente deste arquivo se chama "Map" e
// sombreia o Map global do JS dentro deste escopo
const cacheRotas = new globalThis.Map<string, RotaCacheada>();

// arredonda pra ~1m de precisão — pequenas variações de GPS não devem
// invalidar o cache
const chaveDaRota = (pontos: { latitude: number; longitude: number }[]) =>
  pontos
    .map((p) => `${p.latitude.toFixed(5)},${p.longitude.toFixed(5)}`)
    .join("|");

// Cache de geocodificação reversa ("qual o endereço dessa coordenada?") —
// evita repetir a mesma consulta se o usuário estiver parado/quase parado
// no mesmo lugar. Arredondado a ~11m de precisão (4 casas decimais).
interface EnderecoCacheado {
  formattedAddress: string;
  timestamp: number;
}

const CACHE_GEOCODE_TTL_MS = 10 * 60 * 1000; // 10 minutos

const cacheGeocodeReverso = new globalThis.Map<string, EnderecoCacheado>();

const chaveGeocode = (lat: number, lon: number) =>
  `${lat.toFixed(4)},${lon.toFixed(4)}`;

export default function Map({
  mapBottomPadding = 320,
  region,
  onRegionChange,
  onUserLocationFound,
  bottomSheetIndex,

  // 🔥 NOVO
  itinerario = [],
}: MapProps) {
  const mapRef = useRef<MapView>(null);

  const [userLocation, setUserLocation] = useState<Region | null>(null);

  const [locationPermission, setLocationPermission] = useState<boolean | null>(
    null,
  );

  const [isLoading, setIsLoading] = useState(true);

  const [hasInitialLocation, setHasInitialLocation] = useState(false);

  const [isMapReady, setIsMapReady] = useState(false);

  const userInitialRegion = useRef<Region | null>(null);

  const [mapAdjusted, setMapAdjusted] = useState(false);

  const locationWatchSubscription =
    useRef<Location.LocationSubscription | null>(null);

  // Itinerário "assentado" — só atualiza 600ms depois da última mudança,
  // pra não disparar uma chamada de Directions a cada edição em sequência
  // (endereço trocado, parada adicionada/removida). Os marcadores no mapa
  // continuam usando o itinerário em tempo real; só a rota (API paga) espera.
  const [itinerarioParaRota, setItinerarioParaRota] = useState(itinerario);

  useEffect(() => {
    const timer = setTimeout(() => {
      setItinerarioParaRota(itinerario);
    }, 600);

    return () => clearTimeout(timer);
  }, [itinerario]);

  // Verifica se já existe uma rota em cache pra esse itinerário exato —
  // se tiver e ainda for recente, desenha ela direto (Polyline) em vez de
  // chamar a Directions API de novo.
  const chaveRotaAtual =
    itinerarioParaRota.length >= 2 ? chaveDaRota(itinerarioParaRota) : null;

  const [rotaCacheada, setRotaCacheada] = useState<RotaCacheada | null>(null);

  useEffect(() => {
    if (!chaveRotaAtual) {
      setRotaCacheada(null);
      return;
    }

    const cache = cacheRotas.get(chaveRotaAtual);

    if (cache && Date.now() - cache.timestamp < CACHE_ROTA_TTL_MS) {
      setRotaCacheada(cache);
    } else {
      setRotaCacheada(null);
    }
  }, [chaveRotaAtual]);

  // 🔥 NOVO
  // renderiza rota automaticamente
  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    // 🔥 se existir apenas origem
    // volta pro usuário
    if (itinerario.length <= 1 && userInitialRegion.current) {
      const offsetLatitude = 0.0064;

      mapRef.current.animateToRegion(
        {
          ...userInitialRegion.current,
          latitude: userInitialRegion.current.latitude - offsetLatitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        800,
      );

      return;
    }

    // 🔥 rota normal
    if (itinerario.length >= 2) {
      const coordinates = itinerario.map((item) => ({
        latitude: item.latitude,
        longitude: item.longitude,
      }));

      setTimeout(() => {
        mapRef.current?.fitToCoordinates(coordinates, {
          edgePadding: {
            top: 180,
            right: 60,
            bottom: mapBottomPadding,
            left: 60,
          },
          animated: true,
        });
      }, 300);
    }
  }, [itinerario, mapBottomPadding]);

  // 🗺️ Executa em paralelo
  const fetchAddressInBackground = async (
    lat: number,
    lon: number,
    currentRegion: Region,
  ) => {
    try {
      const chave = chaveGeocode(lat, lon);
      const cacheado = cacheGeocodeReverso.get(chave);

      let formattedAddress: string;

      if (cacheado && Date.now() - cacheado.timestamp < CACHE_GEOCODE_TTL_MS) {
        // mesma coordenada (usuário parado/quase parado) já resolvida há
        // pouco tempo — reaproveita sem chamar o serviço de geocode de novo
        formattedAddress = cacheado.formattedAddress;
      } else {
        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude: lat,
          longitude: lon,
        });

        formattedAddress = "Localização Atual";

        if (reverseGeocode && reverseGeocode.length > 0) {
          const address = reverseGeocode[0];

          const rua = address.street || "";

          const numero = address.streetNumber
            ? `, ${address.streetNumber}`
            : "";

          formattedAddress = rua
            ? `${rua}${numero}`
            : address.district || "Minha Localização";
        }

        cacheGeocodeReverso.set(chave, {
          formattedAddress,
          timestamp: Date.now(),
        });
      }

      const updatedRegionWithAddress = {
        ...currentRegion,
        formattedAddress: formattedAddress,
      };

      await AsyncStorage.setItem(
        CACHE_KEY,
        JSON.stringify(updatedRegionWithAddress),
      );

      if (onUserLocationFound) {
        onUserLocationFound(updatedRegionWithAddress, formattedAddress);
      }
    } catch (error) {
      console.log("Erro na geocodificação reversa:", error);

      const fallbackRegion = {
        ...currentRegion,
        formattedAddress: "Localização Atual",
      };

      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(fallbackRegion));
    }
  };

  // Carregar cache
  const loadCachedLocation = useCallback(async () => {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);

      if (cached) {
        const location = JSON.parse(cached);

        const cachedRegion: Region = {
          latitude: location.latitude,

          longitude: location.longitude,

          latitudeDelta: 0.01,

          longitudeDelta: 0.01,
        };

        setUserLocation(cachedRegion);

        userInitialRegion.current = location;

        setHasInitialLocation(true);

        if (onUserLocationFound) {
          onUserLocationFound(
            location,
            location.formattedAddress || "Localização Atual",
          );
        }

        fetchAddressInBackground(
          location.latitude,
          location.longitude,
          location,
        );

        return true;
      }
    } catch (error) {
      console.log("Erro ao carregar cache:", error);
    }

    return false;
  }, [onUserLocationFound]);

  // Inicialização
  useEffect(() => {
    let isMounted = true;

    const initializeLocation = async () => {
      try {
        setIsLoading(true);

        const hasCache = await loadCachedLocation();

        if (hasCache && isMounted) {
          setIsLoading(false);
        }

        let { status } = await Location.getForegroundPermissionsAsync();

        if (status !== "granted") {
          const { status: newStatus } =
            await Location.requestForegroundPermissionsAsync();

          status = newStatus;
        }

        if (!isMounted) return;

        if (status === "granted") {
          setLocationPermission(true);

          const subscription = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.Balanced,

              // menos atualizações = menos geocodificação reversa disparada;
              // 8s/20m ainda acompanha bem bem o usuário em um carro/trânsito
              timeInterval: 8000,

              distanceInterval: 20,
            },

            (location) => {
              if (!isMounted) return;

              const userRegion: Region = {
                latitude: location.coords.latitude,

                longitude: location.coords.longitude,

                latitudeDelta: 0.01,

                longitudeDelta: 0.01,
              };

              const originalRegion = {
                latitude: location.coords.latitude,

                longitude: location.coords.longitude,

                latitudeDelta: 0.01,

                longitudeDelta: 0.01,
              };

              if (!userInitialRegion.current) {
                setUserLocation(userRegion);

                userInitialRegion.current = originalRegion;

                setHasInitialLocation(true);

                AsyncStorage.setItem(CACHE_KEY, JSON.stringify(originalRegion));

                if (onUserLocationFound) {
                  onUserLocationFound(originalRegion, "Localização Atual");
                }

                if (mapRef.current && isMapReady) {
                  mapRef.current.animateToRegion(userRegion, 1000);
                }

                if (isMounted) {
                  setIsLoading(false);
                }

                fetchAddressInBackground(
                  originalRegion.latitude,
                  originalRegion.longitude,
                  originalRegion,
                );
              }
            },
          );

          locationWatchSubscription.current = subscription;

          setTimeout(() => {
            if (isMounted && !userInitialRegion.current) {
              setIsLoading(false);
            }
          }, 3000);
        } else {
          setLocationPermission(false);

          setIsLoading(false);
        }
      } catch (error) {
        console.error("Erro na inicialização:", error);

        setLocationPermission(false);

        setIsLoading(false);
      }
    };

    initializeLocation();

    return () => {
      isMounted = false;

      if (locationWatchSubscription.current) {
        locationWatchSubscription.current.remove();
      }
    };
  }, [loadCachedLocation, onUserLocationFound, isMapReady]);

  // 🔥 no primeiro login (sem cache salvo ainda), é comum o GPS retornar a
  // primeira posição ANTES do MapView terminar de inicializar — nesse caso
  // o `animateToRegion` lá em cima é pulado (`isMapReady` ainda false) e
  // nunca mais é tentado de novo, porque a flag `userInitialRegion.current`
  // já foi marcada como "resolvido". Resultado: o mapa carrega centralizado
  // no `DEFAULT_REGION` (São Paulo) e nunca vai pra localização real.
  // Esse efeito cobre exatamente essa janela: assim que o mapa fica
  // pronto, se já tivermos uma localização resolvida, centraliza nela.
  const jaCentralizouAoFicarPronto = useRef(false);

  useEffect(() => {
    if (
      isMapReady &&
      userLocation &&
      mapRef.current &&
      !jaCentralizouAoFicarPronto.current
    ) {
      jaCentralizouAoFicarPronto.current = true;

      mapRef.current.animateToRegion(userLocation, 1000);
    }
  }, [isMapReady, userLocation]);

  // Atualiza localização
  const handleUserLocationChange = (event: UserLocationChangeEvent) => {
    const { coordinate } = event.nativeEvent;

    if (coordinate && userInitialRegion.current) {
      const newUserRegion = {
        latitude: coordinate.latitude,

        longitude: coordinate.longitude,

        latitudeDelta: 0.01,

        longitudeDelta: 0.01,
      };

      setUserLocation(newUserRegion);
    }
  };

  // Centralizar usuário
  const centerOnUser = async () => {
    if (userInitialRegion.current && mapRef.current) {
      const regionWithOffset = {
        ...userInitialRegion.current,

        latitude: userInitialRegion.current.latitude,
      };

      mapRef.current.animateToRegion(regionWithOffset, 1000);
    } else if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion(userLocation, 1000);
    } else {
      try {
        setIsLoading(true);

        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const newUserRegion = {
          latitude: location.coords.latitude,

          longitude: location.coords.longitude,

          latitudeDelta: 0.01,

          longitudeDelta: 0.01,
        };

        const originalRegion = {
          latitude: location.coords.latitude,

          longitude: location.coords.longitude,

          latitudeDelta: 0.01,

          longitudeDelta: 0.01,
        };

        setUserLocation(newUserRegion);

        userInitialRegion.current = originalRegion;

        setHasInitialLocation(true);

        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(originalRegion));

        fetchAddressInBackground(
          originalRegion.latitude,
          originalRegion.longitude,
          originalRegion,
        );
      } catch (error) {
        console.error("Erro ao obter localização:", error);

        Alert.alert("Erro", "Não foi possível obter sua localização");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // BottomSheet adjustment
  useEffect(() => {
    if (bottomSheetIndex === undefined || !userInitialRegion.current) return;

    if (bottomSheetIndex === 1) {
      const largerOffset = 0.045;

      const zoomedLatitudeDelta = 0.055;

      const zoomedLongitudeDelta = 0.055;

      const newRegion: Region = {
        ...userInitialRegion.current,

        latitude: userInitialRegion.current.latitude - largerOffset,

        latitudeDelta: zoomedLatitudeDelta,

        longitudeDelta: zoomedLongitudeDelta,
      };

      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 1000);
      }

      setMapAdjusted(true);
    } else if (bottomSheetIndex === 0 && mapAdjusted) {
      const initialRegion: Region = {
        ...userInitialRegion.current,

        latitude: userInitialRegion.current.latitude,

        latitudeDelta: userInitialRegion.current.latitudeDelta ?? 0.01,

        longitudeDelta: userInitialRegion.current.longitudeDelta ?? 0.01,
      };

      if (mapRef.current) {
        mapRef.current.animateToRegion(initialRegion, 1000);
      }

      setMapAdjusted(false);
    }
  }, [bottomSheetIndex, mapAdjusted]);

  if (locationPermission === false) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="location-off" size={48} color="#FF3B30" />

        <Text style={styles.errorText}>
          Permissão de localização necessária
        </Text>

        <Text style={styles.errorSubtext}>
          Ative a localização nas configurações do seu dispositivo para usar o
          app
        </Text>
      </View>
    );
  }

  return (
    <View style={StyleSheet.absoluteFill}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        region={region || userLocation || DEFAULT_REGION}
        onRegionChangeComplete={onRegionChange}
        showsUserLocation={locationPermission === true}
        showsMyLocationButton={false}
        onUserLocationChange={handleUserLocationChange}
        followsUserLocation={false}
        mapType="standard"
        onMapReady={() => setIsMapReady(true)}
      >
        {/* 🔥 MARKERS COM NOVO DESIGN CORRIGIDO */}
        {itinerario.map((item, index) => {
          const isOrigem = index === 0;
          const isDestino =
            index === itinerario.length - 1 && itinerario.length > 1;

          return (
            <Marker
              anchor={{ x: 0.5, y: 0.3 }}
              // o Android tira uma "foto" do conteúdo do marker antes do
              // texto terminar de medir/layoutar quando isso fica false —
              // é o que cortava "Parada 1" pra "Par". Itinerário tem no
              // máximo 5 itens, então manter sempre true não pesa.
              tracksViewChanges={true}
              key={`${item.latitude}-${item.longitude}-${index}`}
              coordinate={{
                latitude: item.latitude,
                longitude: item.longitude,
              }}
            >
              {/* 🔥 ORIGEM - mantém o design anterior */}
              {isOrigem ? (
                <View style={styles.originMarker}>
                  <View style={styles.originMarkerInner} />
                </View>
              ) : isDestino ? (
                /* 🔥 DESTINO (Apenas a Bandeira SVG) */
                <View style={styles.svgContainer}>
                  <Svg width="32" height="32" viewBox="0 0 24 24">
                    {/* Haste da bandeira (Cinza escuro) */}
                    <Path d="M5 2h2v20H5z" fill="#333" />

                    {/* Quadrados Laranjas (#F97316) */}
                    <Path
                      d="M7 4h3.75v3.33H7Zm7.5 0h3.75v3.33h-3.75Zm-3.75 3.33h3.75v3.33h-3.75Zm7.5 0H22v3.33h-3.75ZM7 10.66h3.75V14H7Zm7.5 0h3.75V14h-3.75Z"
                      fill="#fff"
                    />

                    {/* Quadrados Pretos/Contrastantes (Usando #111827 do seu tema anterior para consistência) */}
                    <Path
                      d="M10.75 4h3.75v3.33h-3.75Zm7.5 0H22v3.33h-3.75V4ZM7 7.33h3.75v3.33H7Zm7.5 0h3.75v3.33h-3.75Zm-3.75 3.33h3.75V14h-3.75Zm7.5 0H22V14h-3.75Z"
                      fill="#111827"
                    />
                  </Svg>
                </View>
              ) : (
                /* 🔥 NOVO DESIGN DE PARADA CORRIGIDO - Bolinha com borda amarelada */
                <View style={styles.stopWrapper}>
                  <View style={styles.speechBubble}>
                    <Text style={styles.speechBubbleText}>Parada {index}</Text>
                    <View style={styles.speechBubbleArrow} />
                  </View>
                  {/* Bolinha com borda branca/amarelada */}
                  <View style={styles.stopCircle}>
                    <View style={styles.stopNumber} />
                  </View>
                </View>
              )}
            </Marker>
          );
        })}

        {/* 🔥 POLYLINE */}
        {/* 🔥 ROTA REAL — usa o itinerário assentado (debounced) */}
        {itinerarioParaRota.length >= 2 &&
          (rotaCacheada ? (
            // já tem essa rota em cache recente — desenha sem gastar API
            <Polyline
              coordinates={rotaCacheada.coordinates}
              strokeWidth={4}
              strokeColor="#2563EB"
            />
          ) : (
            <MapViewDirections
              origin={{
                latitude: itinerarioParaRota[0].latitude,
                longitude: itinerarioParaRota[0].longitude,
              }}
              destination={{
                latitude:
                  itinerarioParaRota[itinerarioParaRota.length - 1].latitude,
                longitude:
                  itinerarioParaRota[itinerarioParaRota.length - 1].longitude,
              }}
              waypoints={itinerarioParaRota.slice(1, -1).map((item) => ({
                latitude: item.latitude,
                longitude: item.longitude,
              }))}
              apikey={process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY as string}
              strokeWidth={4}
              strokeColor="#2563EB"
              // optimizeWaypoints={true}
              onReady={(result) => {
                if (chaveRotaAtual) {
                  cacheRotas.set(chaveRotaAtual, {
                    coordinates: result.coordinates,
                    timestamp: Date.now(),
                  });
                }
              }}
            />
          ))}
      </MapView>

      {isLoading && !userLocation && (
        <View style={styles.loadingOverlay}>
          <MaterialIcons name="location-searching" size={32} color="#007AFF" />

          <Text style={styles.loadingText}>Buscando localização...</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.locationButton}
        onPress={centerOnUser}
        disabled={isLoading && !userLocation}
      >
        <MaterialIcons
          name="my-location"
          size={24}
          color={isLoading && !userLocation ? "#ccc" : "#007AFF"}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  originMarker: {
    width: 18,

    height: 18,

    borderRadius: 9,

    backgroundColor: "#FFF",

    justifyContent: "center",

    alignItems: "center",

    borderWidth: 2,

    borderColor: "#111827",
  },

  originMarkerInner: {
    width: 8,

    height: 8,

    borderRadius: 4,

    backgroundColor: "#111827",
  },
  svgContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },

  // 🔥 NOVO DESIGN CORRIGIDO - Bolinha com borda amarelada
  stopWrapper: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },

  stopCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,

    backgroundColor: "#FFFFFF",

    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },

  stopNumber: {
    width: 13,
    height: 13,
    borderRadius: 6.5,

    backgroundColor: "#F6C400",

    overflow: "hidden",
  },

  calloutContainer: {
    width: 200,
    backgroundColor: "transparent",
  },

  speechBubble: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 4,
    paddingVertical: 3,
    marginBottom: 4,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  speechBubbleText: {
    fontSize: 10,
    color: "#1F2937",
    fontWeight: "600",
    textAlign: "center",
  },

  speechBubbleArrow: {
    position: "absolute",
    bottom: -7,
    alignSelf: "center",
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 8,
    borderTopWidth: 12,
    borderStyle: "solid",
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#FFFFFF",
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,

    justifyContent: "center",

    alignItems: "center",

    backgroundColor: "#f8f8f8",

    padding: 20,
  },

  errorText: {
    marginTop: 16,

    fontSize: 18,

    color: "#FF3B30",

    fontWeight: "bold",

    textAlign: "center",
  },

  errorSubtext: {
    marginTop: 8,

    fontSize: 14,

    color: "#666",

    textAlign: "center",
  },

  loadingOverlay: {
    position: "absolute",

    top: 40,

    alignSelf: "center",

    backgroundColor: "white",

    paddingHorizontal: 16,

    paddingVertical: 10,

    borderRadius: 24,

    flexDirection: "row",

    alignItems: "center",

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.15,

    shadowRadius: 4,

    elevation: 3,
  },

  loadingText: {
    marginLeft: 8,

    fontSize: 14,

    color: "#333",

    fontWeight: "500",
  },

  locationButton: {
    position: "absolute",

    bottom: 12,

    right: 12,

    backgroundColor: "white",

    width: 48,

    height: 48,

    borderRadius: 24,

    justifyContent: "center",

    alignItems: "center",

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.25,

    shadowRadius: 3.84,

    elevation: 5,

    zIndex: 20,
  },
});
