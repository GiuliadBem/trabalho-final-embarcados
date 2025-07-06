# Projeto Final - Sistema de Controle de Luminosidade

Sistema completo de IoT com sensor de luminosidade, backend com microserviços, API Gateway e aplicativo móvel.

## 📋 Descrição

Este projeto implementa um sistema de controle de luminosidade com:

- **Sistema embarcado**: ESP8266 com sensor de luz e LED atuador
- **Backend**: Microserviços (controle + logging) com API Gateway
- **Aplicativo móvel**: React Native para configuração e visualização

## 🏗️ Arquitetura

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Arduino   │    │    App      │    │   Backend   │
│  (ESP8266)  │◄──►│  Mobile     │◄──►│ (Gateway +  │
│             │    │             │    │ Microsvcs)  │
└─────────────┘    └─────────────┘    └─────────────┘
```

## 🚀 Pré-requisitos

- Node.js (versão 16 ou superior)
- Arduino IDE
- ESP8266 (NodeMCU ou similar)
- Sensor de luminosidade (LDR)
- LED
- Resistor 220Ω
- Célular com Expo Go (para testar o app)

## 📱 Configuração Inicial

### 1. Descobrir o IP do computador

**No Mac/Linux:**

```bash
ifconfig
```

Procure pela interface ativa (geralmente `en0` ou `wlan0`) e anote o IP (ex: `192.168.1.100`).

**No Windows:**

```cmd
ipconfig
```

Procure por "IPv4 Address" e anote o IP.

### 2. Configurar o IP no Arduino

Abra o arquivo `arduino/circuito_sensor_led.ino` e altere:

```cpp
const char* GATEWAY_IP = "192.168.1.100"; // Substitua pelo IP do seu computador
```

### 3. Configurar o IP no App Mobile

Abra o arquivo `app-sensor/App.js` e altere:

```jsx
const GATEWAY_IP = "192.168.1.100"; // Substitua pelo IP do seu computador
```

## 🔧 Instalação e Execução

### Backend

1. **Instalar dependências do API Gateway:**

```bash
cd backend/api-gateway
npm install
```

2. **Instalar dependências do Controle Service:**

```bash
cd backend/controle-svc
npm install
```

3. **Instalar dependências do Logging Service:**

```bash
cd backend/logging-svc
npm install
```

4. **Executar os serviços (em terminais separados):**

**Terminal 1 - API Gateway:**

```bash
cd backend/api-gateway
node index.js
```

**Terminal 2 - Controle Service:**

```bash
cd backend/controle-svc
node index.js
```

**Terminal 3 - Logging Service:**

```bash
cd backend/logging-svc
node index.js
```

### Arduino

1. **Conectar o circuito:**

   - Sensor LDR: Pino A0
   - LED: Pino D7 (com resistor 220Ω)

2. **Configurar Arduino IDE:**

   - Placa: NodeMCU 1.0 (ESP-12E Module)
   - Upload Speed: 115200

3. **Compilar e fazer upload:**

   - Abra `arduino/circuito_sensor_led.ino`
   - Compile e faça upload para o ESP8266

4. **Configurar Wi-Fi:**
   - Altere o SSID e senha no código:
   ```cpp
   const char* ssid = "SUA_REDE_WIFI";
   const char* password = "SUA_SENHA";
   ```

### App Mobile

1. **Instalar dependências:**

```bash
cd app-sensor
npm install
```

2. **Executar o app:**

```bash
npx expo start
```

3. **Testar no dispositivo:**
   - Instale o Expo Go no celular
   - Escaneie o QR code que aparece no terminal

## 🧪 Testes

### Testar Backend

```bash
# Testar configuração
curl http://localhost:5001/controle/config

# Testar logs
curl http://localhost:5001/logging/log

# Enviar novo limite
curl -X POST -H "Content-Type: application/json" -d '{"limite_luz":300}' http://localhost:5001/controle/config
```

### Testar Arduino

1. Abra o Serial Monitor (115200 baud)
2. Verifique se aparece:
   - "Wi-Fi conectado!"
   - "Conexão OK!"
   - "Log enviado: ..."

### Testar App Mobile

1. Abra o app no celular
2. Digite um novo limite e envie
3. Verifique se o Arduino responde ao novo limite
4. Veja o histórico de leituras sendo atualizado

## 🔍 Solução de Problemas

### Arduino não conecta ao Wi-Fi

- Verifique SSID e senha
- Confirme se a rede está disponível

### Erro de conexão HTTP (-1)

- Confirme se o IP está correto
- Verifique se o backend está rodando
- Certifique-se de que estão na mesma rede

### App não consegue acessar backend

- Confirme o IP do computador
- Verifique se todos os serviços estão rodando
- Teste com curl primeiro

### Hotspot do iPhone não funciona

- Hotspots do iPhone podem isolar dispositivos
- Use um roteador Wi-Fi comum ou Android como hotspot

## 📁 Estrutura do Projeto

```
projeto-final/
├── backend/
│   ├── api-gateway/     # API Gateway (porta 5001)
│   ├── controle-svc/    # Serviço de controle (porta 5002)
│   └── logging-svc/     # Serviço de logs (porta 5003)
├── app-sensor/          # App React Native
├── arduino/             # Código do ESP8266
└── README.md
```

## 🎯 Funcionalidades

- ✅ Leitura de sensor de luminosidade
- ✅ Controle de LED baseado no limite
- ✅ Configuração via app mobile
- ✅ Histórico de leituras
- ✅ Interface moderna e responsiva
- ✅ API Gateway com microserviços

## 📝 Notas Importantes

- **Sempre confirme o IP** antes de testar
- **Use a mesma rede Wi-Fi** para todos os dispositivos
- **Para apresentação**, use roteador Wi-Fi comum (não hotspot do iPhone)
- **O Arduino reinicia** se perder conexão Wi-Fi

## 🤝 Contribuição

Este projeto foi desenvolvido como trabalho final da disciplina de Sistemas Embarcados.
