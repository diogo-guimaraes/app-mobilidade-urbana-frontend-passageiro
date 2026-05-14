import { useAuth } from "@/context/AuthProvider";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Cadastro() {
  const router = useRouter();
  const { register } = useAuth();

  const [step, setStep] = useState(1);

  // step 1
  const [email, setEmail] = useState("");

  // step 2
  const [codigo, setCodigo] = useState("");

  // step 3
  const [senha, setSenha] = useState("");

  // step 4
  const [name, setName] = useState("");

  // step 5
  const [cpf, setCpf] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");

  // step 6
  const [concordo, setConcordo] = useState(false);

  // verificar se código tem 4 dígitos
  const codigoValido = codigo.length === 4;

  // validação step 5
  const step5Valido = cpf.length === 14 && dataNascimento.length === 10;

  // máscara CPF
  const formatarCPF = (value: string) => {
    const numeros = value.replace(/\D/g, "");

    return numeros
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1-$2")
      .slice(0, 14);
  };

  // máscara data nascimento
  const formatarDataNascimento = (value: string) => {
    const numeros = value.replace(/\D/g, "");

    return numeros
      .replace(/^(\d{2})(\d)/, "$1/$2")
      .replace(/^(\d{2})\/(\d{2})(\d)/, "$1/$2/$3")
      .slice(0, 10);
  };

  const finalizarCadastro = () => {
    if (concordo) {
      // remove máscara do CPF
      const cpfTratado = cpf.replace(/\D/g, "");

      // converte 21/11/1992 => 1992-11-21
      const [dia, mes, ano] = dataNascimento.split("/");
      const dataNascimentoTratada = `${ano}-${mes}-${dia}`;

      const usuario = {     
        email: email,
        password: senha,
        name: name,
        cpf: cpfTratado,
        data_nascimento: dataNascimentoTratada,
      };
      console.log(usuario, "usuariousuario");
      register(usuario);
      router.replace("/home");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* STEP 1 */}
        {step === 1 && (
          <View>
            <Text style={styles.title}>
              Qual é o seu número de telefone ou e-mail?
            </Text>

            <TextInput
              placeholder="Informar telefone ou e-mail"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
            />

            <TouchableOpacity
              style={styles.buttonBlack}
              onPress={() => setStep(2)}
            >
              <Text style={styles.buttonBlackText}>Continuar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => router.push("/login")}
            >
              <Text style={styles.loginText}>Já tem conta? Faça login</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <View>
            <Text style={styles.title}>
              Digite o código de 4 dígitos enviado para: {email}
            </Text>

            <TextInput
              placeholder="Digite o código"
              keyboardType="numeric"
              maxLength={4}
              style={[styles.input, styles.inputCenter]}
              value={codigo}
              onChangeText={(text) => {
                const somenteNumeros = text.replace(/[^0-9]/g, "");
                setCodigo(somenteNumeros);
              }}
            />

            <Text style={styles.smallText}>
              Recomendação: Verifique a caixa de entrada e a pasta de spam
            </Text>

            <TouchableOpacity
              style={styles.resendButton}
              onPress={() => {
                console.log("Código reenviado!");
              }}
            >
              <Text style={styles.resendButtonText}>Reenviar</Text>
            </TouchableOpacity>

            <View style={styles.rowBetween}>
              <TouchableOpacity
                style={styles.roundedButtonGray}
                onPress={() => setStep(1)}
              >
                <Feather name="arrow-left" size={24} color="black" />
              </TouchableOpacity>

              <TouchableOpacity
                disabled={!codigoValido}
                onPress={() => setStep(3)}
                style={[
                  styles.nextButton,
                  {
                    backgroundColor: codigoValido ? "black" : "#f3f4f6",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.nextButtonText,
                    {
                      color: codigoValido ? "white" : "#9ca3af",
                    },
                  ]}
                >
                  Avançar
                </Text>

                <Feather
                  name="arrow-right"
                  size={20}
                  color={codigoValido ? "white" : "gray"}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <View>
            <Text style={styles.title}>Crie uma senha para sua conta</Text>

            <TextInput
              placeholder="Senha"
              secureTextEntry
              style={styles.input}
              value={senha}
              onChangeText={setSenha}
            />

            <View style={styles.rowBetween}>
              <TouchableOpacity
                style={styles.roundedButtonGray}
                onPress={() => setStep(2)}
              >
                <Feather name="arrow-left" size={24} color="black" />
              </TouchableOpacity>

              <TouchableOpacity
                disabled={!senha}
                onPress={() => setStep(4)}
                style={[
                  styles.nextButton,
                  {
                    backgroundColor: senha ? "black" : "#f3f4f6",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.nextButtonText,
                    {
                      color: senha ? "white" : "#9ca3af",
                    },
                  ]}
                >
                  Avançar
                </Text>

                <Feather
                  name="arrow-right"
                  size={20}
                  color={senha ? "white" : "gray"}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <View>
            <Text style={styles.title}>Qual é o seu nome ?</Text>

            <Text style={styles.smallTextSpacing}>
              Informe como você quer que te chamem
            </Text>

            <TextInput
              placeholder="Informe seu nome completo"
              style={styles.input}
              value={name}
              onChangeText={setName}
            />

            <View style={styles.rowBetween}>
              <TouchableOpacity
                style={styles.roundedButtonGray}
                onPress={() => setStep(3)}
              >
                <Feather name="arrow-left" size={24} color="black" />
              </TouchableOpacity>

              <TouchableOpacity
                disabled={!name}
                onPress={() => setStep(5)}
                style={[
                  styles.nextButton,
                  {
                    backgroundColor: name ? "black" : "#f3f4f6",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.nextButtonText,
                    {
                      color: name ? "white" : "#9ca3af",
                    },
                  ]}
                >
                  Avançar
                </Text>

                <Feather
                  name="arrow-right"
                  size={20}
                  color={name ? "white" : "gray"}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* STEP 5 */}
        {step === 5 && (
          <View>
            <Text style={styles.title}>Qual seu CPF?</Text>
            <TextInput
              placeholder="Informe seu CPF"
              keyboardType="numeric"
              value={cpf}
              onChangeText={(text) => setCpf(formatarCPF(text))}
              maxLength={14}
              style={styles.input}
            />
            <View style={styles.space} />
            <Text style={styles.title}>Qual sua da de nascimento?</Text>
            <TextInput
              placeholder="Informe sua data de nascimento"
              keyboardType="numeric"
              value={dataNascimento}
              onChangeText={(text) =>
                setDataNascimento(formatarDataNascimento(text))
              }
              maxLength={10}
              style={styles.input}
            />

            <View style={styles.rowBetween}>
              <TouchableOpacity
                style={styles.roundedButtonGray}
                onPress={() => setStep(4)}
              >
                <Feather name="arrow-left" size={24} color="black" />
              </TouchableOpacity>

              <TouchableOpacity
                disabled={!step5Valido}
                onPress={() => setStep(6)}
                style={[
                  styles.nextButton,
                  {
                    backgroundColor: step5Valido ? "black" : "#f3f4f6",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.nextButtonText,
                    {
                      color: step5Valido ? "white" : "#9ca3af",
                    },
                  ]}
                >
                  Avançar
                </Text>

                <Feather
                  name="arrow-right"
                  size={20}
                  color={step5Valido ? "white" : "gray"}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* STEP 6 */}
        {step === 6 && (
          <View>
            <View style={styles.iconContainer}>
              <Feather name="file-text" size={64} color="black" />
            </View>

            <Text style={styles.titleBig}>
              Aceite os Termos e condições e leia o Aviso de Privacidade do App
            </Text>

            <Text style={styles.description}>
              Ao selecionar Concordo abaixo, confirmo que revisei e concordo com
              os <Text style={styles.link}>Termos de uso</Text> e reconheço o{" "}
              <Text style={styles.link}>Aviso de Privacidade</Text>. Eu tenho
              pelo menos 18 anos.
            </Text>

            <View style={styles.divider} />

            <View style={styles.rowBetweenCenter}>
              <Text style={styles.baseText}>Concordo</Text>

              <Pressable onPress={() => setConcordo(!concordo)}>
                <View
                  style={[
                    styles.checkbox,
                    concordo
                      ? styles.checkboxChecked
                      : styles.checkboxUnchecked,
                  ]}
                >
                  {concordo && <Feather name="check" size={16} color="white" />}
                </View>
              </Pressable>
            </View>

            <View style={styles.rowBetweenCenter}>
              <TouchableOpacity
                style={styles.roundedButtonGrayLight}
                onPress={() => setStep(5)}
              >
                <Feather name="arrow-left" size={24} color="black" />
              </TouchableOpacity>

              <TouchableOpacity
                disabled={!concordo}
                onPress={finalizarCadastro}
                style={[
                  styles.nextButton,
                  {
                    backgroundColor: concordo ? "black" : "#f3f4f6",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.nextButtonText,
                    {
                      color: concordo ? "white" : "#9ca3af",
                    },
                  ]}
                >
                  Finalizar Cadastro
                </Text>

                <Feather
                  name="arrow-right"
                  size={20}
                  color={concordo ? "white" : "gray"}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 24,
  },

  content: {
    width: "100%",
    maxWidth: 320,
  },

  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  space: {
    marginTop: 8,
    marginBottom: 8,
  },
  titleBig: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16,
  },

  input: {
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: "#f3f4f6",
    width: "100%",
  },

  inputCenter: {
    textAlign: "center",
  },

  buttonBlack: {
    backgroundColor: "#000000",
    paddingVertical: 12,
    borderRadius: 6,
    width: "100%",
  },

  buttonBlackText: {
    color: "#ffffff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },

  loginButton: {
    paddingTop: 16,
  },

  loginText: {
    color: "#3b82f6",
    fontSize: 18,
    textAlign: "center",
  },

  smallText: {
    fontSize: 12,
    color: "#4b5563",
    marginBottom: 16,
  },

  smallTextSpacing: {
    fontSize: 12,
    color: "#4b5563",
    marginBottom: 32,
  },

  resendButton: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 9999,
    marginTop: 40,
    marginBottom: 80,
    alignSelf: "flex-start",
  },

  resendButtonText: {
    color: "#000000",
    fontWeight: "500",
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  rowBetweenCenter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },

  roundedButtonGray: {
    backgroundColor: "#f3f4f6",
    padding: 12,
    borderRadius: 9999,
  },

  roundedButtonGrayLight: {
    backgroundColor: "#e5e7eb",
    padding: 12,
    borderRadius: 9999,
  },

  nextButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 9999,
    flexDirection: "row",
    alignItems: "center",
  },

  nextButtonText: {
    marginRight: 8,
    fontWeight: "500",
  },

  iconContainer: {
    alignItems: "center",
    marginBottom: 24,
  },

  description: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 24,
  },

  link: {
    color: "#2563eb",
    textDecorationLine: "underline",
  },

  divider: {
    borderTopWidth: 1,
    borderTopColor: "#d1d5db",
    marginTop: 24,
    marginBottom: 16,
  },

  baseText: {
    fontSize: 16,
  },

  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },

  checkboxChecked: {
    backgroundColor: "#000000",
  },

  checkboxUnchecked: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#9ca3af",
  },
});
