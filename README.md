# Gateway I4.0 - Dashboard Industrial

Este é o front-end do projeto **Gateway Industria 4.0**, um dashboard profissional desenvolvido em **Next.js** para monitoramento em tempo real, análise preditiva e controle operacional de ativos industriais (dispositivos ESP32).

O sistema foi arquitetado com foco em **alta disponibilidade** e **otimização de custos em nuvem**, utilizando uma estratégia de sincronização de dados híbrida.

---

## 🏗 Arquitetura de Dados (Fluxo Híbrido)

Para garantir que a interface seja fluida, sem _flickering_, e ao mesmo tempo proteger a cota gratuita do Firebase (Firestore), o sistema utiliza duas fontes de dados dependendo do contexto:

1.  **Tempo Real (Local Gateway):** Na aba de monitoramento, o front-end consome dados diretamente da API do Gateway Local (`http://localhost:5001/api`) via *polling* (a cada 3s). Isso permite gráficos fluidos com custo zero de nuvem.
2.  **Análise Histórica (Cloud Firebase):** A aba de histórico consome dados do Cloud Firestore. Esta busca é **estática (feita apenas uma vez por requisição do usuário)** para gerar relatórios detalhados sem estourar limites de leitura.
3.  **Fallback (Contingência):** Se a conexão com o Firebase ou com o ESP32 for perdida, o sistema informa visualmente o operador e tenta utilizar o histórico do banco local (SQLite) do Gateway.

---

## 🖥 Informações da tela

### 1. Barra Lateral (Ativos Industriais)
*   **Lista de Máquinas:** Exibe todas as máquinas cadastradas no banco.
*   **Identificação:** Mostra o nome, o Setor (ex: Usinagem) e o ID (MAC Address) do equipamento.
*   **Indicador Visual (LED):** Uma bolinha que fica verde se a máquina estiver operando normalmente, ou vermelha se estiver em estado de "Emergência".

### 2. Aba: Monitoramento (Monitoramento Operacional)
Foco em dados do "agora" para controle imediato.

*   **Cards de Status (Top):**
    *   **Ativo/Setor:** Identifica a máquina selecionada.
    *   **Vibração Atual:** O valor instantâneo da oscilação em Hertz (Hz). Muda para vermelho se passar do limite seguro.
    *   **Status do Motor:** Mostra se a máquina física está "LIGADA", "DESLIGADA" ou em "FALHA".
*   **Painel de Comando:** Botões operacionais que enviam comandos reais para o ESP32 (Ligar, Desligar, Resetar Sensores, Modo Demo). *Estes botões são bloqueados automaticamente se o ESP32 estiver offline.*
*   **Fluxo de Vibração (Gráfico de Área):** Um gráfico dinâmico que plota a frequência vibracional dos últimos segundos.

### 3. Aba: Histórico (Relatório de Desempenho Mensal)
Centro de Inteligência e Manutenção Preditiva. Consome dados pesados (até 1000 amostras) da nuvem.

*   **KPIs de Performance:**
    *   **Média Mensal:** A vibração média de todo o período, útil para estabelecer o *baseline* (comportamento normal) da máquina.
    *   **Pico de Stress:** A maior vibração já registrada no mês.
    *   **Índice de Confiabilidade (Saúde do Ativo):** Um valor percentual (0 a 100%). É a nota de saúde da máquina, calculada com base na frequência em que o equipamento entrou em estado crítico. Quanto mais emergências, menor o percentual, indicando necessidade iminente de manutenção.
    *   **Total de Alertas:** Quantas vezes o sistema precisou acionar um alerta crítico.
*   **Análise de Tendência Diária (Gráfico de Barras/Linhas):** Agrupa os dados dia a dia. As barras azuis mostram a média do dia, e a linha amarela traça os picos. Permite ver se o desgaste está aumentando ao longo da semana.
*   **Utilização do Motor (Gráfico de Rosca):** Mostra a porcentagem de tempo que a máquina operou versus o tempo que ficou ociosa/desligada.
*   **Perfil de Intensidade (Histograma):** Divide as vibrações em "baldes" (ex: 0-20Hz, 21-40Hz). Ajuda a entender qual é a zona de operação padrão em que a máquina passa a maior parte do tempo.
*   **Auditoria de Registros (Tabela):** Uma lista detalhada log a log, indicando a data, hora, frequência, estado do motor e diagnóstico final (Normal ou Falha).

### 4. Aba: Configurações
*   **Gestão de Metadados:** Formulário para atualizar o **Nome** (ex: Bomba de Sucção 03) e o **Setor/Localização** (ex: Pavilhão Sul) do ativo físico.
*   **Sincronização:** Ao salvar, as alterações são aplicadas no banco local do Gateway e re-sincronizadas com o Firebase para manter todo o sistema atualizado.

---

## 🚀 Como Rodar o Front-End

### Pré-requisitos
*   Node.js (v18+)
*   O back-end (`GatewayIndustria4` em .NET) deve estar rodando na porta `5001`.

### Instalação

1. Clone ou acesse a pasta do repositório:
```bash
cd dash_board_esp32
```

2. Instale as dependências:
```bash
npm install
```

3. Rode o servidor de desenvolvimento:
```bash
npm run dev
```

4. Acesse no navegador:
```
http://localhost:3000
```

> **Aviso de Proxy (CORS):** O front-end utiliza o recurso de `rewrites` do Next.js (configurado no `next.config.ts`) para rotear todas as chamadas de `/api/backend/*` para o servidor C# (`http://127.0.0.1:5001/api/*`). Isso elimina erros de Cross-Origin (CORS).

---

## 🛠 Tecnologias Utilizadas
*   **React / Next.js 16** (App Router, Turbopack)
*   **Tailwind CSS v4** (Estilização, Variáveis de Tema)
*   **Recharts** (Visualização de Dados/Gráficos Industriais)
*   **Lucide React** (Ícones vetoriais modernos)
*   **Firebase / Firestore** (SDK Web Modular para consumo analítico)
