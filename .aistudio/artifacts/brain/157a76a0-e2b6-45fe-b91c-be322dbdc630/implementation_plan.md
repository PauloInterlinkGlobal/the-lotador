# THE LOTADOR – Integração dos 6 Personagens da Imagem de Referência

Plano de direção de arte e engenharia para substituir os passageiros e NPCs do jogo *The Lotador* pelos 6 personagens idênticos à imagem de referência fornecida, com estética "clean cartoon / flat vector art" e integração completa tanto no motor do jogo web como na geração de sprite sheet horizontal pronta para exportação e uso no Godot Engine.

## User Review & Critical Decisions

> [!IMPORTANT]
> **Decisões Confirmadas na Fase de Alinhamento:**
> - **Fidelidade Total à Imagem de Referência**: Os 6 personagens (Trabalhador de camisa bege com bolsa tiracolo, Estudante de farda e gravata, Mama de vestido roxo estampado com sacolas, Executivo de camisa azul com pasta, Moça de camiseta amarela e tranças, e Jovem de moletom verde) serão reproduzidos exatamente com as roupas, proporções, paleta e silhuetas da imagem.
> - **Sprite Sheet Horizontal Única**: Geração de folha horizontal limpa com os 6 personagens lado a lado em pose neutra (idle), com iluminação uniforme e pronta para recorte.
> - **Integração no Jogo Web + Exportação para Godot**: Os 6 personagens serão os novos passageiros e NPCs em circulação nas paragens de Luanda no jogo web Three.js, e a interface disponibilizará um modal de inspeção e download direto da sprite sheet com metadados de recorte para Godot.
> - **Atributos de Jogabilidade Calibrados**: Cada um dos 6 personagens terá velocidade, paciência na paragem e recompensa em Kwanzas (Kz) compatíveis com seu perfil social e urbano.

## 1. Overview & Core Concept

- **O que faz**: Atualiza o visual dos pedestres e passageiros de *The Lotador*, substituindo figuras genéricas pelos 6 arquétipos da imagem de referência. Adiciona ainda a opção de descarregar a sprite sheet gerada em alta resolução.
- **Estilo Artístico**: 2D Flat Vector / Clean Cartoon contemporâneo com traços precisos, sombreamento suave, iluminação quente e cores urbanas saturadas sem texturas fotográficas pesadas.
- **Público-alvo**: Jogadores e desenvolvedores de jogos que buscam autenticidade urbana de Luanda e facilidade de integração em motores de jogos 2D/2.5D (Web e Godot).

## 2. Análise Detalhada dos 6 Personagens da Imagem

| # | Arquétipo | Descrição Visual Exata | Atributos de Jogo |
|---|---|---|---|
| **1** | **Comerciante / Trabalhador** | Homem negro adulto com barba cerrada, camisa de manga curta bege/cáqui, bolsa tiracolo de couro transversal, calça jeans escura, sapatos pretos. | *Velocidade*: 3.3 u/s · *Paciência*: 48s · *Tarifa*: 150 Kz · *XP*: 25 |
| **2** | **Estudante Uniformizado** | Jovem estudante com farda branca impecável, gravata azul-escura com nó reto, calça social azul-marinho, ténis pretos e mochila azul anil. | *Velocidade*: 4.0 u/s · *Paciência*: 35s · *Tarifa*: 100 Kz · *XP*: 20 |
| **3** | **Mama / Quitandeira** | Mulher madura com turbante/pano amarelo na cabeça, vestido roxo estampado com padrões étnicos laranjas, duas sacolas de compras (verde e vermelha). | *Velocidade*: 2.4 u/s · *Paciência*: 60s · *Tarifa*: 200 Kz · *XP*: 35 |
| **4** | **Executivo / Doutor** | Homem adulto com corte degradê, camisa social azul-celeste com mangas dobradas, calça preta com vinco, sapatos castanhos, pasta executiva preta e relógio. | *Velocidade*: 3.5 u/s · *Paciência*: 25s · *Tarifa*: 280 Kz · *XP*: 45 |
| **5** | **Jovem Moça Estilosa** | Jovem mulher com tranças afro longas, t-shirt amarela vibrante, calça jeans azul-claro com barra dobrada, ténis brancos e bolsinha tiracolo preta. | *Velocidade*: 3.8 u/s · *Paciência*: 40s · *Tarifa*: 160 Kz · *XP*: 30 |
| **6** | **Jovem de Moletom Verde** | Rapaz jovem com moletom verde com capuz e cordões brancos, calça jeans clássica, ténis brancos, mochila preta e mãos nos bolsos. | *Velocidade*: 4.2 u/s · *Paciência*: 20s · *Tarifa*: 170 Kz · *XP*: 30 |

## 3. Key Product Decisions & Trade-Offs

- **Sprite Sheet Horizontal Única vs Imagens Soltas**:
  - *Decisão*: Criar a sprite sheet horizontal contendo os 6 personagens alinhados em pose idle e gerar o mapeamento em `atlasData.ts` e `spriteAtlas.ts`.
  - *Razão*: Reduz draw calls no motor Three.js, mantém escala e alinhamento consistentes entre personagens e atende exatamente à especificação de importação para Godot Engine (`SpriteFrames` ou `TextureRect`).
- **Modal de Exportação para o Utilizador / Godot**:
  - *Decisão*: Incluir um botão discreto de asset ("Exportar Sprites / Godot") na interface para visualizar a folha completa em tamanho real, com opções de download em PNG e especificações JSON de recorte de cada personagem.
  - *Razão*: Permite ao utilizador inspecionar e descarregar o asset diretamente, validando o trabalho de Direção de Arte.

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────┐
│                   IMAGE GENERATION                     │
│  generate_image: Sprite sheet horizontal dos 6         │
│  personagens em 2D flat vector clean cartoon           │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│               ATLAS & TEXTURE MAPPING                  │
│  src/utils/atlasData.ts: frame slices (P1 a P6)        │
│  src/utils/spriteAtlas.ts: renderers vetoriais fiéis   │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                    GAME ENGINE (3D)                    │
│  src/game/GameEngine.ts:                               │
│  - spawn dos 6 novos personagens na paragem            │
│  - animação de passada e atributos individuais         │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│               UI & EXPORTAÇÃO GODOT                    │
│  src/components/SpriteSheetModal.tsx:                  │
│  - Visualizador da folha e download do ficheiro PNG    │
│  - Tabela com dimensões e coordenadas de cada sprite   │
└────────────────────────────────────────────────────────┘
```

### Ordem de Execução
1. Executar a geração da sprite sheet horizontal contendo os 6 personagens com fidelidade estrita à referência.
2. Atualizar as definições em `src/types/game.ts` para os 6 perfis baseados na imagem (`COMERCIANTE_BEGE`, `ESTUDANTE_GRAVATA`, `MAMA_ROXO`, `EXECUTIVO_AZUL`, `JOVEM_AMARELO`, `JOVEM_VERDE`).
3. Mapear as coordenadas exatas dos 6 personagens em `src/utils/atlasData.ts`.
4. Atualizar `src/utils/spriteAtlas.ts` para renderizar os 6 personagens com os seus detalhes exatos (roupas, acessórios, sacolas, pasta, tranças, sapatos).
5. Ajustar a lógica de spawn, atributos e animação em `src/game/GameEngine.ts`.
6. Criar o modal `SpriteSheetModal.tsx` com opção de download do asset e guia de corte para Godot.
7. Validar build com `compile_applet`.
