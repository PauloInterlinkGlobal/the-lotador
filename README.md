# 🚐 THE LOTADOR — Arcade 3D das Paragens de Luanda

**The Lotador** é um jogo arcade 3D ambientado nas vibrantes paragens de candongueiros (táxis coletivos azuis e brancos) de Luanda, Angola.

O jogador assume o papel de um **Lotador** — o profissional urbano responsável por chamar os passageiros, organizar o embarque rápido nas carrinhas certas e lotar os candongueiros antes dos rivais e antes que o tempo esgote.

---

## 🎯 1. Objetivo Central do Jogo

O objetivo do jogador é construir uma carreira vitoriosa nas paragens de Luanda, subindo de **Aprendiz** a **Mestre da Paragem**:

1. **Lotação Rápida:** Chamar passageiros na rua com o megafone e voz, agrupá-los e levá-los até a porta do candongueiro azul correto.
2. **Cumprimento de Metas:** Em cada turno/nível, alcançar os objetivos estipulados (número de passageiros lotados, arrecadação de Kwanzas (Kz), combos seguidos e sprints).
3. **Evitar Conflitos e Multas:** Desviar-se de zungueiras (vendedoras ambulantes) para não derrubar bacias e fugir da atenção dos fiscais de trânsito.
4. **Vencer a Concorrência:** Disputar passageiros contra rivais veteranos (Manuel e Kito Relâmpago) na Hora de Ponta.

---

## 🏆 2. Condições de Vitória e Derrota

### ✅ Condição de Vitória (Fase Concluída)
- O jogador cumpre todos os **objetivos principais** definidos para a fase antes que o tempo de turno se esgote.
- **Sistema de Avaliação por Estrelas (1 a 3 Estrelas):**
  - ⭐ **1 Estrela:** Cumprir todos os objetivos obrigatórios do nível.
  - ⭐⭐ **2 Estrelas:** Concluir a fase com bónus de tempo restante superior ao limiar do nível.
  - ⭐⭐⭐ **3 Estrelas:** Concluir com folga máxima de tempo e sem nenhuma colisão com fiscais ou zungueiras.

### ❌ Condição de Derrota (Tempo Esgotado)
- O cronómetro chega a `00:00` sem que os passageiros ou o valor mínimo de Kz tenham sido entregues na carrinha.
- O jogador recebe estatísticas parciais e tem a opção imediata de reiniciar o turno.

---

## 📈 3. Curva de Dificuldade e Progressão de Níveis

A progressão do jogo é orientada a dados (**Data-Driven**) através do ficheiro `src/data/levels.ts`. Cada nível possui uma configuração estrita de dificuldade (`LevelConfig`):

| Níveis | Rota / Paragem | Tier | Inovações na Jogabilidade |
|---|---|---|---|
| **Nível 1** | **Viana** | `APRENDIZ` | **TUTORIAL GUIADO:** Aprendizagem das 6 etapas básicas sem pressão de rivais ou obstáculos. |
| **Nível 2** | **Viana** | `APRENDIZ` | Lotação de 3 passageiros com tempo generoso. |
| **Níveis 3–4** | **Cazenga** | `APRENDIZ` | Surgem as primeiras **Zungueiras** (Dona Maria) com bacias na rua; metas de Kz associadas. |
| **Níveis 5–7** | **Cacuaco / Kilamba** | `LOTADOR` | Chegada do primeiro **Rival** (Manuel Veterano); mecânica de combos de embarque e corridas. |
| **Níveis 8–10** | **Talatona / Mutamba / Samba** | `LOTADOR EXPERIENTE / PROFISSIONAL` | **Fiscal de Trânsito** ativo (com apito e penalizações), trânsito denso e disputas ferozes. |
| **Níveis 11+** | **Todas as Linhas** | `MESTRE DA PARAGEM` | **Modo Infinito:** Níveis gerados proceduralmente (`generateLevel`) com metas e velocidade progressivas. |

---

## 🎓 4. Tutorial Interativo (Nível 1)

O primeiro nível é um tutorial completo estruturado numa máquina de estados:

$$\text{INTRO} \longrightarrow \text{CHAMAR} \longrightarrow \text{EMBARCAR} \longrightarrow \text{CONDUZIR} \longrightarrow \text{ENTREGAR} \longrightarrow \text{CONCLUÍDO}$$

1. **INTRO:** Apresentação do papel do lotador (jogo e cronómetro pausados).
2. **CHAMAR:** Alvo 3D pulsante sobre o passageiro de Viana (`📢 PASSAGEIRO VIANA`). O jogador aproxima-se e aciona o botão **CHAMAR [E]**.
3. **EMBARCAR:** O passageiro segue o jogador. Alvo 3D sobre o candongueiro azul (`🚐 CANDONGUEIRO VIANA`). O jogador guia o cliente até à porta da carrinha.
4. **CONDUZIR / LOTAR:** Junto à carrinha, o botão muda para **LOTAR! [Espaço]**. O passageiro embarca e o contador é atualizado.
5. **ENTREGAR:** Confirmação de gorjeta (+150 Kz e +15 XP) com efeitos visuais e sonoros.
6. **CONCLUIDO:** Chuva de confetes, bónus de **+500 Kz** e desbloqueio oficial da **Fase 2**.

---

## ⚡ 6. Eventos Aleatórios da Paragem (Dinâmica Urbana de Luanda)

A partir da Fase 3, surgem imprevistos e oportunidades urbanas em tempo real:
- **🚨 Operação de Fiscalização (Blitz):** O Fiscal António apita na rotunda! Não cometas infrações nem corras na sua frente para evitar multas de 100 Kz. Se passares sem infrações, recebes bónus de reputação!
- **💵 Troco Complicado (Nota de 5.000 Kz):** Um passageiro paga com nota alta e pede troco rápido. Um botão pulsante **DAR TROCO!** surge no HUD para ganhar gorjeta imediata de +200 Kz e +40 XP!
- **🚐 Engarrafamento na Estrada:** Trânsito denso na via. A procura por candongueiros sobe drasticamente e o valor arrecadado por passageiro sobe em **+50% Kz**!
- **🌧️ Chuva Tropical:** Tempestade rápida na capital! Os clientes correm mais depressa para se abrigarem nas carrinhas azuis.

---

## 🎮 7. Controles do Jogo

### 🖥️ Desktop (Teclado e Rato)
- **Movimentação:** Teclas `W, A, S, D` ou `Setas do Teclado`.
- **Chamar Passageiros:** Tecla `E` ou clique no botão amarelo **CHAMAR**.
- **Lotar / Embarcar:** Barra de `Espaço` ou clique no botão laranja **LOTAR!**.
- **Correr (Sprint):** Tecla `Shift` (consome barra de energia/estamina).
- **Pausa:** Tecla `P` ou `Escape`.

### 📱 Dispositivos Móveis (Ecrã Táctil)
- **Manípulo Virtual (Joystick Flutuante):** Arraste o polegar na zona inferior esquerda.
- **Botão CHAMAR / LOTAR!:** Botão circular superior direito (muda dinamicamente de amarelo para laranja quando perto da porta do candongueiro).
- **Botão CORRER:** Botão circular azul inferior direito (mantenha pressionado para correr).
- **Orientação:** Bloqueio automático para o formato Horizontal (Landscape).

---

## 🛠️ 6. Arquitetura e Tecnologias

- **Frontend:** React 19 SPA com TypeScript.
- **Motor Gráfico:** Three.js com câmara isométrica, materiais estilizados, sprite sheet atlas 2D e iluminação solar.
- **Interface e Estilização:** Tailwind CSS v4 com tipografia Anybody, Space Grotesk e Work Sans.
- **Áudio Imersivo:** Efeitos sonoros sintetizados via Web Audio API (sem dependência de ficheiros externos de terceiros).
- **Persistência de Dados:** Armazenamento resiliente no `localStorage` com as chaves `LOTADOR_SAVE_V1` e `LOTADOR_SETTINGS_V1`.
- **Otimização Móvel:** Dynamic Resolution Scaling (DRS), object pooling com zero Garbage Collector em partículas e compatibilidade com Capacitor.
