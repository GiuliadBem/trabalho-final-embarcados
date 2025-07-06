import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import axios from "axios";

const GATEWAY_IP = "192.168.15.14"; // Troque pelo IP do seu Mac na rede!
const GATEWAY_PORT = 5001;
const BASE_URL = `http://${GATEWAY_IP}:${GATEWAY_PORT}`;

export default function App() {
  const [limite, setLimite] = useState("");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentLimite, setCurrentLimite] = useState(500);

  useEffect(() => {
    fetchLogs();
    fetchCurrentLimite();
  }, []);

  const fetchCurrentLimite = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/controle/config`);
      setCurrentLimite(res.data.limite_luz);
    } catch (err) {
      console.log("Erro ao buscar limite atual");
    }
  };

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
      fetchCurrentLimite(); // Atualiza o limite atual
    } catch (err) {
      Alert.alert("Erro", "Não foi possível enviar o limite.");
    }
  };

  const formatTimestamp = (timestamp) => {
    if (typeof timestamp === "string" && timestamp.includes("T")) {
      return new Date(timestamp).toLocaleString("pt-BR");
    }
    return `Leitura ${timestamp}`;
  };

  const getLatestReading = () => {
    return logs.length > 0 ? logs[0] : null;
  };

  const getLedStatus = () => {
    const latest = getLatestReading();
    if (!latest) return "Desconhecido";
    return latest.valor_luz < currentLimite ? "LIGADO" : "DESLIGADO";
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2c3e50" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sistema de Controle de Luz</Text>
        <Text style={styles.headerSubtitle}>
          ESP8266 + Sensor de Luminosidade
        </Text>
      </View>

      {/* Status Card */}
      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>Status Atual</Text>
        <View style={styles.statusRow}>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>LED:</Text>
            <Text
              style={[
                styles.statusValue,
                { color: getLedStatus() === "LIGADO" ? "#27ae60" : "#e74c3c" },
              ]}
            >
              {getLedStatus()}
            </Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Limite Atual:</Text>
            <Text style={styles.statusValue}>{currentLimite}</Text>
          </View>
        </View>
        {getLatestReading() && (
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Última Leitura:</Text>
            <Text style={styles.statusValue}>
              {getLatestReading().valor_luz}
            </Text>
          </View>
        )}
      </View>

      {/* Configuração */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configurar Limite</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Novo limite"
            placeholderTextColor="#95a5a6"
            keyboardType="numeric"
            value={limite}
            onChangeText={setLimite}
          />
          <TouchableOpacity style={styles.button} onPress={enviarLimite}>
            <Text style={styles.buttonText}>Enviar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Histórico */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Histórico de Leituras</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={fetchLogs}>
            <Text style={styles.refreshButtonText}>Atualizar</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3498db" />
            <Text style={styles.loadingText}>Carregando...</Text>
          </View>
        ) : (
          <FlatList
            data={logs}
            keyExtractor={(_, idx) => idx.toString()}
            renderItem={({ item, index }) => (
              <View style={[styles.logItem, index === 0 && styles.latestLog]}>
                <View style={styles.logHeader}>
                  <Text style={styles.logValue}>Valor: {item.valor_luz}</Text>
                  {index === 0 && (
                    <Text style={styles.latestBadge}>MAIS RECENTE</Text>
                  )}
                </View>
                <Text style={styles.logTimestamp}>
                  {formatTimestamp(item.timestamp)}
                </Text>
              </View>
            )}
            refreshing={loading}
            onRefresh={fetchLogs}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ecf0f1",
  },
  header: {
    backgroundColor: "#2c3e50",
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#bdc3c7",
    textAlign: "center",
    marginTop: 5,
  },
  statusCard: {
    backgroundColor: "#ffffff",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: "#7f8c8d",
    marginRight: 8,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  section: {
    backgroundColor: "#ffffff",
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#bdc3c7",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginRight: 12,
    backgroundColor: "#ffffff",
  },
  button: {
    backgroundColor: "#3498db",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  refreshButton: {
    backgroundColor: "#27ae60",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  refreshButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },
  loadingContainer: {
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#7f8c8d",
  },
  logItem: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#bdc3c7",
  },
  latestLog: {
    backgroundColor: "#e8f5e8",
    borderLeftColor: "#27ae60",
  },
  logHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  logValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  latestBadge: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#27ae60",
    backgroundColor: "#d5f4d5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  logTimestamp: {
    fontSize: 12,
    color: "#7f8c8d",
  },
});
