# Painel de Despacho — Dispatch Board

Aplicação React + TypeScript de escala de recursos (veículos, equipes, técnicos),
com arrastar-e-soltar, timeline estilo Gantt virtualizada e arquitetura
offline-first com atualizações otimistas e resolução de conflitos de sincronização.

## Rodando o projeto

```bash
npm install
npm run dev
```

Abra o endereço mostrado pelo Vite (geralmente `http://localhost:5173`).

```bash
npm run build      # build de produção (tsc + vite build)
npm run typecheck  # apenas checagem de tipos
```

## Onde está cada requisito

### 1. Drag-and-drop scheduling

- `src/components/UnassignedJobs.tsx` — cada serviço na fila é `draggable`;
  o `dataTransfer` carrega `{ kind: 'job', jobId }`.
- `src/components/Timeline/ResourceRow.tsx` — cada linha (recurso) é o alvo
  de drop. No `onDrop`, calcula o minuto exato sob o cursor a partir de
  `getBoundingClientRect()` da própria pista, sem depender de `scrollLeft`
  manualmente (o browser já resolve isso).
- `src/components/Timeline/AssignmentCard.tsx` — cartões já atribuídos também
  são arrastáveis (para mover entre recursos/horários) e redimensionáveis
  pela borda direita (Pointer Events, para alterar a duração do serviço).
- Todo movimento é ajustado (`snapToGrid`) para a grade de 15 minutos.

### 2. Timeline / Gantt com virtualização

- `src/components/Timeline/TimelineView.tsx` usa `react-window`
  (`FixedSizeList`) para virtualizar verticalmente as linhas de recursos —
  com centenas de recursos, só as linhas visíveis (+ overscan do próprio
  react-window) existem no DOM.
- Virtualização horizontal é feita à mão em `ResourceRow.tsx`: o horizonte
  do board é de 14 dias, mas cada linha só monta os cartões de atribuição
  cuja janela de tempo intersecta o intervalo atualmente visível
  (`src/store/viewportStore.ts`), calculado a partir do `scrollLeft` real
  do contêiner. Isso é o mesmo princípio usado por bibliotecas de Gantt
  para lidar com milhares de itens: nunca renderizar o que está fora da
  viewport, independente da largura total do conteúdo.
- A coluna de nomes dos recursos fica fixa (`position: sticky`) enquanto a
  área de tempo rola horizontalmente; o cabeçalho de horas acompanha o
  scroll via `transform: translateX(...)`.

### 3. Offline-first com atualizações otimistas e conflitos

- `src/db/db.ts` — todo o estado (recursos, serviços, atribuições, fila de
  sincronização, conflitos) vive em IndexedDB via Dexie. A UI lê e escreve
  sempre localmente primeiro; nunca espera uma resposta de rede para
  atualizar a tela.
- `src/services/syncEngine.ts` — cada escrita (`assignJob`, `moveAssignment`,
  `unassign`) grava local e imediatamente enfileira uma `SyncOp` com a
  versão-base da atribuição. A fila é drenada em FIFO sempre que há
  conectividade, com retry e backoff exponencial em falhas de rede.
- `src/api/mockServer.ts` simula um backend real: latência de rede,
  falhas transitórias (~8%) e — importante — um "despachante fantasma" que
  edita atribuições do lado do servidor de tempos em tempos, simulando um
  colega em outro dispositivo. Isso gera conflitos genuínos de concorrência
  otimista (comparação de `version`), não um conflito só encenado.
- Quando o servidor rejeita um push por divergência de versão, o registro
  entra em `src/components/ConflictModal.tsx`, mostrando as duas versões
  (local e remota) lado a lado para o usuário escolher qual prevalece.
- O botão **Online/Offline** na barra superior alterna `navigator.onLine`
  para fins de demonstração: desligue-o, arraste alguns serviços (as
  mudanças aparecem na hora, com um indicador "pendente" no cartão),
  religue e observe a fila sendo sincronizada — e, ocasionalmente, um
  conflito aparecendo para resolução.

## Estrutura

```
src/
  api/mockServer.ts        backend simulado (latência, falhas, edições concorrentes)
  services/syncEngine.ts   fila de sincronização, retry/backoff, detecção de conflito
  db/db.ts                 esquema IndexedDB (Dexie)
  store/scheduleStore.ts   estado da aplicação (zustand), ponte UI ↔ DB ↔ sync
  store/viewportStore.ts   janela de tempo visível (para virtualização horizontal)
  components/Timeline/     grade de recursos, cabeçalho de tempo, cartões
  components/              fila de serviços, barra de status, modal de conflito
```

## Notas de design

Paleta e tipografia seguem uma linguagem de "console de despacho": fundo
grafite escuro, acento âmbar de sinalização, dados em monoespaçada
(JetBrains Mono) e títulos em Space Grotesk — pensado para uma tela que
fica aberta o dia inteiro numa central de operações.
# tremoot-test
