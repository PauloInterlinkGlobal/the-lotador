# Reposicionamento Espacial e Correção de Sobreposições do Cenário

Plano arquitetural e de engenharia para corrigir as sobreposições visuais entre os novos objetos de cenário (abrigo da paragem, árvores, placa e barraca) e as fachadas dos edifícios urbanos, garantindo uma circulação fluida, corredores pedonais limpos e colisão sólida precisa.

## User Review & Critical Decisions

> [!IMPORTANT]
> As decisões de alinhamento foram confirmadas diretamente pelo utilizador:
> - **Posicionamento do Abrigo**: Avançado para a faixa intermédia do passeio (`z ≈ 5.2`), descolando-o das montras e portas do edifício traseiro ("Armazém de Alimentos").
> - **Posicionamento das Árvores**: Reubicadas nas extremidades laterais do passeio (`x ≈ ±22.0`, `z ≈ 4.8`), fora da linha de fachadas das lojas para que a copa e o tronco nunca entrem dentro das paredes dos edifícios.
> - **Eliminação de Conflitos Procedurais**: Remoção dos adereços antigos gerados por código (especialmente a banca com sombrinha vermelha do `BuildingManager` que ficava encostada/visível por trás dos vidros do abrigo) para dar exclusividade e destaque aos novos assets pixel art.

---

## 1. Overview & Core Concept

- **Problema Atual**: No layout anterior, o abrigo da paragem (`z = 7.5`) e as árvores (`z = 8.5`) foram posicionados demasiado perto do plano das fachadas dos edifícios (`z = 9.0`), fazendo com que copas de árvores atravessassem as lojas laterais e o abrigo cobrisse as montras dos edifícios de trás. Adicionalmente, adereços procedurais antigos (como uma sombrinha vermelha de frutas) colidiam com a traseira do abrigo.
- **Objetivo**: Reestruturar a grelha de coordenadas do cenário em `sceneryPlacements.ts`, limpar adereços em conflito em `BuildingManager.ts`, alinhar as zonas de spawn dos passageiros em `GameEngine.ts` e assegurar que as caixas de colisão e o Y-sorting permaneçam impecáveis.

---

## 2. User Experience & Visual Design

### Composição Visual da Paragem de Luanda

```
                                  [ FACHADAS DOS EDIFÍCIOS: z = 9.0 a 12.0 ]
   [CANTINA / OFICINA]          [NOSSO SUPER]          [ARMAZÉM]          [CONVENIÊNCIA]          [FARMÁCIA]
─────────────────────────────────────────────────────────────────────────────────────────────────────────────
   🌳 Árvore Esq.                                     🚏 ABRIGO                                 🌳 Árvore Dir.
   (x = -22.0, z = 4.8)                               (x = -4.0, z = 5.2)                       (x = 22.0, z = 4.8)
                          🪑 Banco 1                                       🪑 Banco 2
                          (x = -10.5, z = 3.6)                             (x = 5.5, z = 3.6)
                                                                                                🏪 Água Fresca
   🪧 Placa Táxi                                                                                (x = 15.0, z = 4.2)
   (x = -16.0, z = 1.0)
─────────────────────────────────────────────────────────────────────────────────────────────────────────────
   ▲ Cone 1                     ▲ Cone 2                     ▲ Cone 3                     ▲ Cone 4
   (x = -13.5, z = -1.9)        (x = -4.5, z = -1.9)         (x = 4.5, z = -1.9)          (x = 13.5, z = -1.9)
═════════════════════════════════════════════════════════════════════════════════════════════════════════════
               [ BAIA 3: KILAMBA ]          [ BAIA 2: CACUACO ]          [ BAIA 1: VIANA ]
               (x = 9, z = -4)              (x = 0, z = -4)              (x = -9, z = -4)
```

### Melhorias Visuais Concretas
1. **Profundidade em Três Planos Claros**:
   - **Plano de Fundo (`z = 9.0` a `12.0`)**: Edifícios angolanos com montras, letreiros e iluminação livres de qualquer invasão de árvores ou abrigos.
   - **Plano de Vivência da Paragem (`z = 2.0` a `6.0`)**: Abrigo da paragem, bancos de espera, barraca de água fresca e árvores nas alas exteriores, deixando corredores pedonais generosos.
   - **Plano da Via e Baias (`z = -1.9` a `-4.0`)**: Cones de trânsito alinhados e baias de candongueiros para entrada e saída dos táxis.
2. **Eliminação de Artefatos**: Remoção de sombrinhas e bancas 3D procedurais que colidiam por trás das paredes do abrigo.

---

## 3. Key Technical Decisions & Trade-Offs

- **Avançar o Abrigo vs. Recuar os Edifícios**:
  - *Decisão*: Avançar o abrigo para `z = 5.2` mantendo os edifícios em `z = 12.0` (com fachada em `z = 9.0`).
  - *Porquê*: O passeio tem 18 unidades de profundidade (entre `z = -2.85` e `z = 15.0`). Posicionar o abrigo em `z = 5.2` cria uma baia natural de espera no centro do passeio, mantendo mais de 3.5 unidades de espaço livre até às montras e mais de 6 unidades até à borda da estrada, garantindo total liberdade de movimento ao jogador.
- **Árvores nas Extremidades**:
  - *Decisão*: Posicionar as árvores em `x = -22.0` e `x = 22.0` com `z = 4.8`.
  - *Porquê*: Com largura de ~4.8u e altura de ~6.7u, a copa das árvores fica completamente desafogada das paredes dos edifícios, emoldurando o ecrã com vegetação urbana sem oclusões indesejadas.
- **Sincronização de Zonas de Spawn e IA**:
  - *Decisão*: Atualizar o array `waitingZones` de `GameEngine.ts` com as novas coordenadas dos bancos, abrigo e barraca.
  - *Porquê*: Os passageiros passam a juntar-se naturalmente junto aos novos locais sem nunca nascerem dentro das caixas de colisão.

---

## 4. Technical Architecture & Implementation Steps

```
┌─────────────────────────────────┐
│  src/data/sceneryPlacements.ts  │ ◄── Define novas coordenadas limpas para Level 1 e aliases
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│  src/game/BuildingManager.ts    │ ◄── Remove adereços procedurais redundantes (banca vermelha)
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│  src/game/GameEngine.ts         │ ◄── Sincroniza waitingZones e spawn seguro dos passageiros
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│ SceneryObstacleManager.ts       │ ◄── Recalcula colliders no solo e Y-sorting depth
└─────────────────────────────────┘
```

### Etapas de Execução:
1. **Atualizar `src/data/sceneryPlacements.ts`**:
   - Reposicionar abrigo para `(x: -4.0, z: 5.2)`.
   - Reposicionar árvores para `(x: -22.0, z: 4.8)` e `(x: 22.0, z: 4.8)`.
   - Reposicionar bancos para `(x: -10.5, z: 3.6)` e `(x: 5.5, z: 3.6)`.
   - Reposicionar barraca de água para `(x: 15.0, z: 4.2)`.
   - Reposicionar placa de paragem para `(x: -16.0, z: 1.0)`.
   - Aplicar essas coordenadas de forma harmoniosa em todas as variantes de mapa.
2. **Limpar Adereços Conflituantes em `src/game/BuildingManager.ts`**:
   - Em `generateUrbanProps()`, desativar a geração de bancas de fruta com sombrinha (`createStreetFruitStall`), mantendo a iluminação pública e elementos perimetrais.
3. **Ajustar Zonas de Espera em `src/game/GameEngine.ts`**:
   - Ajustar `waitingZones` em `spawnPassenger()` para refletir as novas coordenadas, mantendo a verificação `isClearForSpawn`.
4. **Verificação e Testes**:
   - Executar `tsc --noEmit` e `compile_applet`.
   - Validar que colisores e renderOrder funcionam sem sobreposições.
