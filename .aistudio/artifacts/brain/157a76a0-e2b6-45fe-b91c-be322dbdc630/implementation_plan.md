# LOTADOR – Luanda Taxi Craze: Ciclo Completo de Jogabilidade com Baias e Rivais

Plano arquitetural e de engenharia para consolidar o ciclo de jogo do Lotador de Candongueiros em Luanda, priorizando a dinâmica das 3 baias de táxis, passageiros com rotas e perfis distintos, inteligência artificial de lotadores rivais com escalonamento progressivo de dificuldade por nível/paragem, e interface adaptável com deteção automática de teclado e joystick tátil.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> **Decisões Confirmadas nas Perguntas de Alinhamento:**
> 1. **Prioridade Central**: Ciclo completo de jogabilidade com as 3 baias de táxi ativas, atração vocal de passageiros e disputas com rivais na paragem.
> 2. **Dinâmica de Rivais Progressiva**: Rivais começam passivos ou ausentes nas fases iniciais (Mutamba) para aprendizagem de rotas e aceleram a agressividade vocal e de roubo de passageiros em paragens avançadas (Viana, Mercado dos Correios, Talatona e Samba).
> 3. **Controles Adaptativos**: Deteção automática de dispositivos touch (joystick virtual e botões dedicados de "Chamar" e "Correr") vs. teclado no desktop (WASD/Setas, Espaço para Chamar, Shift para Correr).

- **Três Baias de Candongueiros**:
  - Baia 1: Rota Viana (azul e branco clássico)
  - Baia 2: Rota Cacuaco (listras e variantes)
  - Baia 3: Rota Kilamba / Benfica (expresso)
- **Ciclo de Estados do Passageiro**:
  - `IDLE` (paciência a drenar) → `CALLED` (atraído pela voz) → `FOLLOWING` (segue o lotador) → `BOARDING` (alcance < 2.25u da baia correta com vaga) → `BOARDED` (arrecada Kz + XP) ou `LOST` (paciência zerada)
- **Disputa de Passageiros ("É MEU!")**:
  - Quando um rival e o jogador chamam o mesmo passageiro ou cruzam trajetórias, desencadeia mini-disputa de autoridade vocal ou proximidade.

---

### 1. Overview & Core Concept

- **O que é**: Um jogo de ação e estratégia arcade 2.5D ambientado nas icónicas paragens de táxis candongueiros de Luanda, Angola. O jogador encarna um lotador cujo objetivo é organizar a fila, chamar passageiros com a rota certa, levá-los até a baia correspondente e encher os táxis antes que os rivais roubem os clientes ou que a paciência dos passageiros se esgote.
- **Público-alvo**: Jogadores mobile e web apreciadores de arcades frenéticos estilo *Overcooked* e *Crazy Taxi*, com imersão cultural rica (gírias, ambiente sonoro e visual autêntico de Luanda).
- **Valor agregado**: Combinação de tomada de decisão espacial (gerir 3 rotas simultâneas), gestão de recursos (estamina de corrida e raio vocal) e competição contra IAs com comportamentos distintos.

---

### 2. User Experience & Visual Design

#### Fluxo de Jogabilidade em Partida
```
┌────────────────────────────────────────────────────────┐
│              ENTRADA NA PARAGEM / BANNER               │
│        Meta de Kz, tempo e rotas ativas das 3 baias    │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                    CICLO PRINCIPAL                     │
│  1. Movimentação (Joystick / WASD) + Corrida (Shift)   │
│  2. Chamar ("Viana! Viana! Cacuaco!") no raio vocal    │
│  3. Conduzir grupo de passageiros até a baia correta   │
│  4. Evitar ou vencer disputas com lotadores rivais     │
│  5. Despachar táxi cheio e recolher bónus              │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                FIM DE RONDA & PROGRESSÃO               │
│   Cumprimento de 100% dos objetivos → Subida de Nível  │
│   Objetivos parciais → Recolha de Kz/XP sem promoção   │
└────────────────────────────────────────────────────────┘
```

#### Identidade Visual & Diretrizes Anti-Slop
- **Paleta de Cores (60-30-10)**:
  - 60% Asfalto e terra da paragem (tons quentes de terra batida `#3d2b1f`, cinza asfalto `#1e2430` e texturas urbanas).
  - 30% Estruturas, calçadas e candongueiros (branco marfim `#f8fafc`, azul táxi de Luanda `#0288d1`, amarelo quente `#ffd700`).
  - 10% Acentos funcionais de chamada vocal e estamina (laranja elétrico `#fe6b00`, verde embarque `#2e7d32`, vermelho paciência crítica `#ba1a1a`).
- **Disciplina Tipográfica**: `Plus Jakarta Sans` para interface e textos narrativos, com numerais tabulares `font-mono tabular-nums` para tempo, saldo em Kz e lotação dos carros (`12/12`). Sem badge sandwiches decorativos.
- **Controles Touch Fluidos**: Joystick virtual dinâmico ou fixo no canto inferior esquerdo com área de toque mínima de $48\times 48\text{px}$, botão de "CHAMAR" no quadrante direito inferior e botão "CORRER" ergonómico, respeitando a zona natural de alcance do polegar.

---

### 3. Key Product Decisions & Trade-Offs

- **Decisão 1: Dificuldade progressiva dos Rivais por Zona/Nível**
  - *Abordagem*: No Nível 1/Tutorial e Mutamba, não há rivais roubando passageiros, permitindo ao jogador compreender as baias e a chamada. A partir do Nível 2 (Viana Express), entra Manuel Veterano (movimento pausado e previsível). Em níveis superiores entram Kito Relâmpago (rápido) e Zeca Furacão (alto raio vocal).
  - *Motivo*: Evita frustração precoce e introduz a mecânica competitiva como uma curva de maestria recompensadora.
- **Decisão 2: Três Baias com Rotas Fixas vs Rotas Dinâmicas**
  - *Abordagem*: 3 baias fixas no topo da grade: Baia 1 (x: 5, y: 3), Baia 2 (x: 13, y: 3), Baia 3 (x: 21, y: 3), cada uma com o seu letreiro de rota destacado e indicador de lotação.
  - *Motivo*: Cria pontos focais claros para o jogador guiar os passageiros sem confusão espacial.
- **Decisão 3: Detecção de Entrada Híbrida (Mobile vs Desktop)**
  - *Abordagem*: Deteta ponteiro tátil primário (`(pointer: coarse)`) e interações de toque para expor o joystick virtual na tela, enquanto mantém suporte total e sem atrito a WASD/Setas e barra de espaço para teclado físico.
  - *Motivo*: A mesma base de código funciona impecavelmente tanto em smartphones e tablets quanto no navegador de desktop.

---

### 4. Technical Architecture & Data Strategy

#### Diagrama de Arquitetura do Ciclo de Jogo
```
┌────────────────────────────────────────────────────────┐
│                   InputManager                         │
│  - Virtual Joystick (touch) & Keyboard (WASD/Espaço)   │
│  - Stamina Drain/Regen (18 pts/s correndo, 12 regen)   │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                   GameEngine (Loop)                    │
│                                                        │
│  ┌───────────────────┐        ┌─────────────────────┐  │
│  │   Player System   │        │     NPC Rivals      │  │
│  │  - Posição/Voz    │◄──────►│  - Patrulha / Busca │  │
│  │  - Estamina       │ Disputa│  - Chamada Vocal    │  │
│  └─────────┬─────────┘        └──────────┬──────────┘  │
│            │                             │             │
│            ▼                             ▼             │
│  ┌──────────────────────────────────────────────────┐  │
│  │               Passenger Manager                  │  │
│  │  - Perfis (Trabalhador, Estudante, Idoso, etc.)  │  │
│  │  - Estados: IDLE → CALLED → FOLLOWING → BOARDING │  │
│  └─────────────────────────┬────────────────────────┘  │
│                            │                           │
│                            ▼                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │                 Taxi Bay System                  │  │
│  │  - Baia 1 (Viana) | Baia 2 (Cacuaco) | Baia 3    │  │
│  │  - Lotação (12/12) → Despacho → Recompensa Kz/XP │  │
│  └──────────────────────────────────────────────────┘  │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                    Game HUD & Overlays                 │
│  - Lotação de cada baia, relógio, Kz e barra estamina  │
│  - Balões de fala ("Viana!", "É Meu!") e feedback sonoro│
└────────────────────────────────────────────────────────┘
```

#### Entidades e Componentes Chave

1. **`TaxiBay`**:
   - `id`: 1, 2, 3
   - `route`: `'VIANA' | 'CACUACO' | 'KILAMBA'`
   - `position`: Vector3 das baias no mapa
   - `currentCapacity`: contagem atual / 12
   - `state`: `'WAITING' | 'FULL' | 'DISPATCHING' | 'ARRIVING'`
2. **`Passenger`**:
   - `profile`: `Trabalhador`, `Estudante`, `Idoso`, `Jovem`, `Executivo`, `Impaciente`, `VIP`
   - `state`: `'idle' | 'called' | 'following' | 'boarding' | 'boarded' | 'lost'`
   - `destination`: rota desejada
   - `patience`: 0 a 100 com velocidade de perda específica do perfil
   - `leaderId`: ID do jogador ou do rival a quem está a seguir
3. **`NPCRival`**:
   - `id`, `name`, `speed`, `vocalRadius`, `specialty`
   - Lógica de IA com máquina de estados (Patrulhar paragem → Identificar grupo livre → Aproximar-se → Chamar → Conduzir à baia)
4. **`InputHUD`**:
   - Joystick virtual analógico com zona de deadzone e normalização vetorial
   - Botões de toque destacados: Chamar (com animação de onda sonora) e Correr (com indicador de estamina)

---

### 5. Verificação e Critérios de Aceite

- **Baias de Embarque**: Três baias ativas no topo da rua com identificadores visuais das rotas; passageiros entram apenas na baia cuja rota coincide com seu destino.
- **Ciclo Vocal de Passageiros**: O botão "Chamar" emite onda sonora e converte passageiros no raio de 3.5u em seguidores; passageiros perdem paciência se não forem guiados a tempo.
- **Comportamento dos Rivais**: Em fases com rivais ativos, os NPCs chamam passageiros autonomamente e disputam clientes com falas características ("É MEU!").
- **Controles Híbridos**: Teclado reage instantaneamente sem atrasos e o joystick na tela adapta-se suavemente ao toque sem interferir na visualização da grade.
- **Compilação**: Sucesso estrito em `compile_applet` e validação com linter.
