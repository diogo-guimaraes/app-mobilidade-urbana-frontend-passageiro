import { useAuth } from "@/context/AuthProvider";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AppLogo from "@/components/common/AppLogo";
import CarrosAleatorios from "@/components/auth/CarrosAleatorios";
import ErrorBanner from "@/components/common/ErrorBanner";

export default function Cadastro() {
  const router = useRouter();
  const { register } = useAuth();
  const { telefone: telefoneParam } = useLocalSearchParams<{
    telefone?: string;
  }>();

  const [step, setStep] = useState(1);

  // step 1
  const [email, setEmail] = useState("");
  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // step 2
  const [codigo, setCodigo] = useState("");

  // step 3
  const [senha, setSenha] = useState("");
  const senhaValida = senha.length >= 8;

  // step 4
  const [name, setName] = useState("");

  // step 5
  const [cpf, setCpf] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const dataNascimentoRef = useRef<TextInput>(null);

  // step 6
  const [concordo, setConcordo] = useState(false);

  const [erroCadastro, setErroCadastro] = useState("");
  const [erroSenhaServidor, setErroSenhaServidor] = useState("");
  const [erroIdadeServidor, setErroIdadeServidor] = useState("");

  // verificar se código tem 4 dígitos
  const codigoValido = codigo.length === 4;

  // valida se a data preenchida existe de verdade (dia/mês dentro do range e o mês tem esse dia)
  const dataNascimentoValida = (valor: string) => {
    if (valor.length !== 10) return false;

    const [dia, mes, ano] = valor.split("/").map(Number);

    if (!dia || !mes || !ano) return false;
    if (mes < 1 || mes > 12) return false;

    const diasNoMes = new Date(ano, mes, 0).getDate();

    if (dia < 1 || dia > diasNoMes) return false;

    return ano >= 1900 && ano <= new Date().getFullYear();
  };

  // calcula a idade a partir de dd/mm/aaaa
  const calcularIdade = (valor: string) => {
    const [dia, mes, ano] = valor.split("/").map(Number);

    const nascimento = new Date(ano, mes - 1, dia);
    const hoje = new Date();

    let idade = hoje.getFullYear() - nascimento.getFullYear();

    const aindaNaoFezAniversario =
      hoje.getMonth() < nascimento.getMonth() ||
      (hoje.getMonth() === nascimento.getMonth() &&
        hoje.getDate() < nascimento.getDate());

    if (aindaNaoFezAniversario) idade--;

    return idade;
  };

  const dataNascimentoFormatoValido = dataNascimentoValida(dataNascimento);
  const maiorDeIdade =
    dataNascimentoFormatoValido && calcularIdade(dataNascimento) >= 18;
  const menorDeIdade = dataNascimentoFormatoValido && !maiorDeIdade;

  // validação step 5
  const step5Valido = cpf.length === 14 && maiorDeIdade;

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

  const finalizarCadastro = async () => {
    if (!concordo) return;

    setErroCadastro("");

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
      ...(telefoneParam ? { telefone: telefoneParam } : {}),
    };

    try {
      await register(usuario);

      router.replace("/home");
    } catch (error: any) {
      const erros = error?.response?.data?.errors;

      // e-mail, cpf ou telefone já cadastrados em outra conta -> volta pro login
      if (erros?.email || erros?.telefone || erros?.cpf) {
        setErroCadastro(
          "Já existe uma conta com esses dados. Você será redirecionado para o login.",
        );

        setTimeout(() => router.replace("/login"), 2500);

        return;
      }

      // senha reprovada no servidor -> mostra na própria etapa da senha
      if (erros?.password) {
        setErroSenhaServidor(
          Array.isArray(erros.password) ? erros.password[0] : "Senha inválida.",
        );

        setStep(3);

        return;
      }

      // idade reprovada no servidor -> mostra na própria etapa da data de nascimento
      if (erros?.data_nascimento) {
        setErroIdadeServidor(
          Array.isArray(erros.data_nascimento)
            ? erros.data_nascimento[0]
            : "Data de nascimento inválida.",
        );

        setStep(5);

        return;
      }

      const mensagem =
        error?.response?.data?.message ??
        "Não foi possível concluir o cadastro. Tente novamente.";

      setErroCadastro(mensagem);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <CarrosAleatorios />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color="black" />
          </TouchableOpacity>

          <AppLogo />
        </View>

        <View style={styles.content}>
          {/* STEP 1 */}
          {step === 1 && (
            <View style={styles.stepContainer}>
              <View>
                <Text style={styles.title}>Qual é o seu e-mail?</Text>

                <View style={styles.inputWrapper}>
                  <TextInput
                    placeholder="Informe seu e-mail"
                    placeholderTextColor="#CCC"
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType={emailValido ? "go" : "done"}
                    onSubmitEditing={() => emailValido && setStep(2)}
                  />
                </View>
                <View style={styles.inputUnderline} />
              </View>

              <View>
                <TouchableOpacity
                  style={[
                    styles.nextButton,
                    emailValido
                      ? styles.nextButtonActive
                      : styles.nextButtonDisabled,
                  ]}
                  onPress={() => setStep(2)}
                  disabled={!emailValido}
                >
                  <Text
                    style={[
                      styles.nextButtonText,
                      !emailValido && styles.nextButtonTextDisabled,
                    ]}
                  >
                    Continuar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={() => router.push("/login")}
                >
                  <Text style={styles.loginText}>Já tem conta? Faça login</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <View style={styles.stepContainer}>
              <View>
                <Text style={styles.title}>
                  Digite o código de 4 dígitos enviado para:
                </Text>

                <Text style={styles.highlightText}>{email}</Text>

                <View style={styles.inputWrapper}>
                  <TextInput
                    placeholder="0000"
                    placeholderTextColor="#CCC"
                    keyboardType="numeric"
                    maxLength={4}
                    returnKeyType={codigoValido ? "go" : "done"}
                    onSubmitEditing={() => codigoValido && setStep(3)}
                    style={[styles.input, styles.inputCenter]}
                    value={codigo}
                    onChangeText={(text) => {
                      const somenteNumeros = text.replace(/[^0-9]/g, "");

                      setCodigo(somenteNumeros);
                    }}
                  />
                </View>
                <View style={styles.inputUnderline} />

                <Text style={styles.smallText}>
                  Recomendação: Verifique a caixa de entrada e a pasta de spam
                </Text>

                <TouchableOpacity
                  style={styles.resendButton}
                  onPress={() => {
                    console.log("Código reenviado!");
                  }}
                >
                  <Text style={styles.resendButtonText}>Reenviar código</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.rowBetween}>
                <TouchableOpacity
                  style={styles.roundedButton}
                  onPress={() => setStep(1)}
                >
                  <Feather name="arrow-left" size={22} color="black" />
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={!codigoValido}
                  onPress={() => setStep(3)}
                  style={[
                    styles.nextButtonSmall,
                    codigoValido
                      ? styles.nextButtonActive
                      : styles.nextButtonDisabled,
                  ]}
                >
                  <Text
                    style={[
                      styles.nextButtonText,
                      !codigoValido && styles.nextButtonTextDisabled,
                    ]}
                  >
                    Avançar
                  </Text>

                  <Feather
                    name="arrow-right"
                    size={18}
                    color={codigoValido ? "black" : "#CCC"}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <View style={styles.stepContainer}>
              <View>
                <Text style={styles.title}>Crie uma senha para sua conta</Text>

                <View
                  style={[
                    styles.inputWrapper,
                    erroSenhaServidor && styles.inputWrapperError,
                  ]}
                >
                  <TextInput
                    placeholder="Senha"
                    placeholderTextColor="#CCC"
                    secureTextEntry
                    returnKeyType={senhaValida ? "go" : "done"}
                    onSubmitEditing={() => senhaValida && setStep(4)}
                    style={styles.input}
                    value={senha}
                    onChangeText={(text) => {
                      setSenha(text);

                      if (erroSenhaServidor) setErroSenhaServidor("");
                    }}
                  />
                </View>
                <View style={styles.inputUnderline} />

                {erroSenhaServidor ? (
                  <ErrorBanner message={erroSenhaServidor} />
                ) : (
                  <Text style={styles.smallTextSpacing}>
                    Mínimo de 8 caracteres
                  </Text>
                )}
              </View>

              <View style={styles.rowBetween}>
                <TouchableOpacity
                  style={styles.roundedButton}
                  onPress={() => setStep(2)}
                >
                  <Feather name="arrow-left" size={22} color="black" />
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={!senhaValida}
                  onPress={() => setStep(4)}
                  style={[
                    styles.nextButtonSmall,
                    senhaValida
                      ? styles.nextButtonActive
                      : styles.nextButtonDisabled,
                  ]}
                >
                  <Text
                    style={[
                      styles.nextButtonText,
                      !senhaValida && styles.nextButtonTextDisabled,
                    ]}
                  >
                    Avançar
                  </Text>

                  <Feather
                    name="arrow-right"
                    size={18}
                    color={senhaValida ? "black" : "#CCC"}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <View style={styles.stepContainer}>
              <View>
                <Text style={styles.title}>Qual é o seu nome?</Text>

                <Text style={styles.smallTextSpacing}>
                  Informe como você quer que te chamem
                </Text>

                <View style={styles.inputWrapper}>
                  <TextInput
                    placeholder="Informe seu nome completo"
                    placeholderTextColor="#CCC"
                    returnKeyType={name.trim() ? "go" : "done"}
                    onSubmitEditing={() => name.trim() && setStep(5)}
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                  />
                </View>
                <View style={styles.inputUnderline} />
              </View>

              <View style={styles.rowBetween}>
                <TouchableOpacity
                  style={styles.roundedButton}
                  onPress={() => setStep(3)}
                >
                  <Feather name="arrow-left" size={22} color="black" />
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={!name.trim()}
                  onPress={() => setStep(5)}
                  style={[
                    styles.nextButtonSmall,
                    name.trim()
                      ? styles.nextButtonActive
                      : styles.nextButtonDisabled,
                  ]}
                >
                  <Text
                    style={[
                      styles.nextButtonText,
                      !name.trim() && styles.nextButtonTextDisabled,
                    ]}
                  >
                    Avançar
                  </Text>

                  <Feather
                    name="arrow-right"
                    size={18}
                    color={name.trim() ? "black" : "#CCC"}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* STEP 5 */}
          {step === 5 && (
            <View style={styles.stepContainer}>
              <View>
                <Text style={styles.title}>Qual seu CPF?</Text>

                <View style={styles.inputWrapper}>
                  <TextInput
                    placeholder="Informe seu CPF"
                    placeholderTextColor="#CCC"
                    keyboardType="numeric"
                    returnKeyType="next"
                    onSubmitEditing={() => dataNascimentoRef.current?.focus()}
                    value={cpf}
                    onChangeText={(text) => setCpf(formatarCPF(text))}
                    maxLength={14}
                    style={styles.input}
                  />
                </View>
                <View style={styles.inputUnderline} />

                <View style={styles.space} />

                <Text style={styles.title}>Qual sua data de nascimento?</Text>

                <View
                  style={[
                    styles.inputWrapper,
                    (menorDeIdade || erroIdadeServidor) &&
                      styles.inputWrapperError,
                  ]}
                >
                  <TextInput
                    ref={dataNascimentoRef}
                    placeholder="00/00/0000"
                    placeholderTextColor="#CCC"
                    keyboardType="numeric"
                    returnKeyType={step5Valido ? "go" : "done"}
                    onSubmitEditing={() => step5Valido && setStep(6)}
                    value={dataNascimento}
                    onChangeText={(text) => {
                      setDataNascimento(formatarDataNascimento(text));

                      if (erroIdadeServidor) setErroIdadeServidor("");
                    }}
                    maxLength={10}
                    style={styles.input}
                  />
                </View>
                <View style={styles.inputUnderline} />

                {erroIdadeServidor ? (
                  <ErrorBanner message={erroIdadeServidor} />
                ) : menorDeIdade ? (
                  <ErrorBanner message="Você precisa ter pelo menos 18 anos para se cadastrar." />
                ) : null}
              </View>

              <View style={styles.rowBetween}>
                <TouchableOpacity
                  style={styles.roundedButton}
                  onPress={() => setStep(4)}
                >
                  <Feather name="arrow-left" size={22} color="black" />
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={!step5Valido}
                  onPress={() => setStep(6)}
                  style={[
                    styles.nextButtonSmall,
                    step5Valido
                      ? styles.nextButtonActive
                      : styles.nextButtonDisabled,
                  ]}
                >
                  <Text
                    style={[
                      styles.nextButtonText,
                      !step5Valido && styles.nextButtonTextDisabled,
                    ]}
                  >
                    Avançar
                  </Text>

                  <Feather
                    name="arrow-right"
                    size={18}
                    color={step5Valido ? "black" : "#CCC"}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* STEP 6 */}
          {step === 6 && (
            <View style={styles.stepContainer}>
              <View>
                <View style={styles.iconContainer}>
                  <Feather name="file-text" size={54} color="black" />
                </View>

                <Text style={styles.title}>Aceite os Termos e condições</Text>

                <Text style={styles.description}>
                  Ao selecionar Concordo abaixo, confirmo que revisei e concordo
                  com os <Text style={styles.link}>Termos de uso</Text> e
                  reconheço o{" "}
                  <Text style={styles.link}>Aviso de Privacidade</Text>.
                </Text>

                <TouchableOpacity
                  style={styles.termsContainer}
                  onPress={() => setConcordo(!concordo)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.radioButton,
                      concordo && styles.radioButtonActive,
                    ]}
                  >
                    {concordo && (
                      <Ionicons name="checkmark" size={14} color="white" />
                    )}
                  </View>

                  <Text style={styles.termsText}>
                    Li e aceito os{" "}
                    <Text style={styles.linkText}>
                      Termos de Uso e a Política de Privacidade
                    </Text>
                  </Text>
                </TouchableOpacity>

                {erroCadastro ? <ErrorBanner message={erroCadastro} /> : null}
              </View>

              <View style={styles.rowBetween}>
                <TouchableOpacity
                  style={styles.roundedButton}
                  onPress={() => setStep(5)}
                >
                  <Feather name="arrow-left" size={22} color="black" />
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={!concordo}
                  onPress={finalizarCadastro}
                  style={[
                    styles.nextButtonSmall,
                    concordo
                      ? styles.nextButtonActive
                      : styles.nextButtonDisabled,
                  ]}
                >
                  <Text
                    style={[
                      styles.nextButtonText,
                      !concordo && styles.nextButtonTextDisabled,
                    ]}
                  >
                    Finalizar
                  </Text>

                  <Feather
                    name="arrow-right"
                    size={18}
                    color={concordo ? "black" : "#CCC"}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },

  scrollContent: {
    flexGrow: 1,
  },

  header: {
    alignItems: "center",
    paddingTop: 56,
    paddingHorizontal: 20,
  },

  backButton: {
    position: "absolute",
    left: 20,
    top: 56,
  },

  content: {
    flex: 1,
    paddingHorizontal: 30,
    marginTop: 40,
    paddingBottom: 48,
  },

  stepContainer: {
    flex: 1,
    justifyContent: "space-between",
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000",
    marginBottom: 20,
  },

  highlightText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 20,
    color: "#FF5500",
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },

  inputWrapperError: {
    borderBottomWidth: 2,
    borderBottomColor: "#D32F2F",
  },

  input: {
    flex: 1,
    fontSize: 18,
    color: "#000",
    fontWeight: "400",
  },

  inputCenter: {
    textAlign: "center",
    letterSpacing: 12,
  },

  inputUnderline: {
    height: 1,
    backgroundColor: "#FF5500",
    width: "100%",
    marginBottom: 25,
  },

  nextButton: {
    height: 55,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  nextButtonSmall: {
    height: 50,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 24,
  },

  nextButtonDisabled: {
    backgroundColor: "#F5F5F5",
  },

  nextButtonActive: {
    backgroundColor: "#FFD200",
  },

  nextButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
    marginRight: 8,
  },

  nextButtonTextDisabled: {
    color: "#CCC",
  },

  loginButton: {
    marginTop: 20,
  },

  loginText: {
    textAlign: "center",
    color: "#666",
    fontSize: 14,
    textDecorationLine: "underline",
  },

  smallText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
    marginBottom: 20,
  },

  smallTextSpacing: {
    fontSize: 13,
    color: "#666",
    marginBottom: 20,
  },

  resendButton: {
    alignSelf: "flex-start",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    marginBottom: 50,
  },

  resendButtonText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 14,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  roundedButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },

  space: {
    marginBottom: 10,
  },

  iconContainer: {
    alignItems: "center",
    marginBottom: 30,
  },

  description: {
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
    marginBottom: 30,
  },

  link: {
    color: "#000",
    fontWeight: "700",
    textDecorationLine: "underline",
  },

  termsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 40,
  },

  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#CCC",
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  radioButtonActive: {
    backgroundColor: "#FF5500",
    borderColor: "#FF5500",
  },

  termsText: {
    flex: 1,
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },

  linkText: {
    textDecorationLine: "underline",
    fontWeight: "600",
    color: "#000",
  },
});
