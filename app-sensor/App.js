import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Alert,
} from "react-native";
import axios from "axios";

const GATEWAY_IP = "192.168.15.5"; // Troque pelo IP do seu Mac na rede!
const GATEWAY_PORT = 5001;
const BASE_URL = `http://${GATEWAY_IP}:${GATEWAY_PORT}`;

export default function App() {
  const [limite, setLimite] = useState("");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/logging/log`);
      setLogs(res.data.reverse());
    } catch (err) {
      Alert.alert("Erro", "Não foi possível buscar os logs.");
    }
    setLoading(false);
  };

  const enviarLimite = async () => {
    if (!limite) {
      Alert.alert("Atenção", "Digite um valor para o limite!");
      return;
    }
    try {
      await axios.post(`${BASE_URL}/controle/config`, {
        limite_luz: Number(limite),
      });
      Alert.alert("Sucesso", "Limite enviado!");
      setLimite("");
    } catch (err) {
      Alert.alert("Erro", "Não foi possível enviar o limite.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Configurar Limite de Luz</Text>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="Novo limite"
          keyboardType="numeric"
          value={limite}
          onChangeText={setLimite}
        />
        <Button title="Enviar" onPress={enviarLimite} />
      </View>
      <Text style={styles.title}>Histórico de Leituras</Text>
      <Button title="Atualizar" onPress={fetchLogs} />
      <FlatList
        data={logs}
        keyExtractor={(_, idx) => idx.toString()}
        renderItem={({ item }) => (
          <Text style={styles.logItem}>
            Valor: {item.valor_luz} | Timestamp: {item.timestamp}
          </Text>
        )}
        refreshing={loading}
        onRefresh={fetchLogs}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "bold", marginTop: 20, marginBottom: 10 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 8,
    width: 100,
    marginRight: 10,
  },
  logItem: { fontSize: 16, paddingVertical: 4 },
});
