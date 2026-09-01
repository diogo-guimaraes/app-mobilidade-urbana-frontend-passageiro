// Easter egg decorativo: carrinhos que atravessam a tela em linha reta, de
// tempos em tempos aleatórios (nunca ao mesmo tempo), com um leve tremor
// simulando o motor ligado e um rastro tipo faixa de pista ("- - -") que vai
// sumindo com fade. Fica atrás do conteúdo, não intercepta toques.
import { FontAwesome5 } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";

const COR_CARRO = "rgba(0,0,0,0.08)";
const COR_RASTRO = "rgba(0,0,0,0.12)";

// intervalo entre cada tracinho do rastro, em ms de tempo real — menor
// intervalo = tracinhos mais próximos entre si (rastro mais "cheio")
const INTERVALO_RASTRO_MS = 140;
// tempo até o tracinho sumir de vez (fade out) — maior duração = mais
// tracinhos simultâneos na tela, deixando o rastro mais longo e espalhado
const DURACAO_FADE_RASTRO_MS = 1800;

interface CarroAtivo {
  id: number;
  progresso: Animated.Value;
  tremor: Animated.Value;
  direita: boolean;
  topo: number;
  tamanho: number;
}

interface Rastro {
  id: number;
  x: number;
  y: number;
  opacidade: Animated.Value;
}

let proximoId = 0;
let proximoRastroId = 0;

export default function CarrosAleatorios() {
  const { width, height } = useWindowDimensions();
  const [carros, setCarros] = useState<CarroAtivo[]>([]);
  const [rastros, setRastros] = useState<Rastro[]>([]);
  const montadoRef = useRef(true);

  useEffect(() => {
    montadoRef.current = true;

    let timerProximoCarro: ReturnType<typeof setTimeout>;
    const intervalosRastro: ReturnType<typeof setInterval>[] = [];

    const posicaoAtual = (
      inicio: number,
      duracao: number,
      direita: boolean,
      tamanho: number,
    ) => {
      const t = Math.min((Date.now() - inicio) / duracao, 1);
      const de = direita ? -40 : width + 40;
      const para = direita ? width + 40 : -40;

      return {
        x: de + (para - de) * t,
        terminou: t >= 1,
        tamanho,
      };
    };

    const spawnCarro = () => {
      const id = proximoId++;
      const direita = Math.random() > 0.5;

      // mantém a proporção do ícone — só varia o tamanho geral, não o formato
      const tamanho = 16 + Math.round(Math.random() * 10);
      const topo = 40 + Math.random() * Math.max(height - 120, 1);

      const progresso = new Animated.Value(0);
      const tremor = new Animated.Value(0);

      setCarros((prev) => [
        ...prev,
        { id, progresso, direita, topo, tamanho, tremor },
      ]);

      // tremor contínuo, tipo motor ligado
      Animated.loop(
        Animated.sequence([
          Animated.timing(tremor, {
            toValue: 1,
            duration: 60,
            useNativeDriver: true,
          }),
          Animated.timing(tremor, {
            toValue: -1,
            duration: 60,
            useNativeDriver: true,
          }),
        ]),
      ).start();

      // atravessa a tela em linha reta, velocidade também variando um pouco
      const duracao = 4000 + Math.random() * 3000;
      const inicio = Date.now();

      // solta um tracinho de rastro periodicamente, na posição real do carro
      const intervaloRastro = setInterval(() => {
        const { x, terminou } = posicaoAtual(inicio, duracao, direita, tamanho);

        if (terminou) {
          clearInterval(intervaloRastro);
          return;
        }

        const rastroId = proximoRastroId++;
        const opacidade = new Animated.Value(0.6);

        setRastros((prev) => [
          ...prev,
          { id: rastroId, x, y: topo + tamanho / 2, opacidade },
        ]);

        Animated.timing(opacidade, {
          toValue: 0,
          duration: DURACAO_FADE_RASTRO_MS,
          useNativeDriver: true,
        }).start(() => {
          if (montadoRef.current) {
            setRastros((prev) => prev.filter((r) => r.id !== rastroId));
          }
        });
      }, INTERVALO_RASTRO_MS);

      intervalosRastro.push(intervaloRastro);

      Animated.timing(progresso, {
        toValue: 1,
        duration: duracao,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => {
        clearInterval(intervaloRastro);

        if (montadoRef.current) {
          setCarros((prev) => prev.filter((c) => c.id !== id));
        }
      });
    };

    const agendarProximo = () => {
      // tempo aleatório entre aparições — nunca sincronizado
      const atraso = 900 + Math.random() * 2600;

      timerProximoCarro = setTimeout(() => {
        if (!montadoRef.current) return;

        spawnCarro();
        agendarProximo();
      }, atraso);
    };

    agendarProximo();

    return () => {
      montadoRef.current = false;
      clearTimeout(timerProximoCarro);
      intervalosRastro.forEach(clearInterval);
    };
  }, [height, width]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {rastros.map((rastro) => (
        <Animated.Text
          key={rastro.id}
          style={[
            styles.rastro,
            {
              left: rastro.x,
              top: rastro.y,
              opacity: rastro.opacidade,
            },
          ]}
        >
          -
        </Animated.Text>
      ))}

      {carros.map((carro) => {
        const translateX = carro.progresso.interpolate({
          inputRange: [0, 1],
          outputRange: carro.direita ? [-40, width + 40] : [width + 40, -40],
        });

        const translateY = carro.tremor.interpolate({
          inputRange: [-1, 1],
          outputRange: [-1.5, 1.5],
        });

        return (
          <Animated.View
            key={carro.id}
            style={[
              styles.carro,
              {
                top: carro.topo,
                transform: [{ translateX }, { translateY }],
              },
            ]}
          >
            <FontAwesome5
              name="car-side"
              size={carro.tamanho}
              color={COR_CARRO}
              style={carro.direita ? undefined : styles.espelhado}
            />
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  carro: {
    position: "absolute",
  },
  espelhado: {
    transform: [{ scaleX: -1 }],
  },
  rastro: {
    position: "absolute",
    fontSize: 14,
    fontWeight: "700",
    color: COR_RASTRO,
  },
});
