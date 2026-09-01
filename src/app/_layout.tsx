// app/_layout.tsx
import { AuthProvider } from "@/context/AuthProvider";
import "@/styles/global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
          <Stack screenOptions={{ animation: "slide_from_right" }}>
            <Stack.Screen
              name="index"
              options={{
                headerShown: false,
                animation: "fade",
              }}
            />
            <Stack.Screen
              name="splash"
              options={{
                headerShown: false,
                animation: "fade",
              }}
            />
            <Stack.Screen
              name="login"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="loginEmail"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="register"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="(main)"
              options={{
                headerShown: false,
                animation: "fade",
              }}
            />
          </Stack>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </AuthProvider>
  );
}
