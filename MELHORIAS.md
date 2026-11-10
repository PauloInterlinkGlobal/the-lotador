# Lotador — melhorias aplicadas

## Passageiros (arte real dos 6 NPCs)
- `src/assets/images/npcs_passengers.png` + frames em `atlasData.ts` (medidos pelo canal alpha).
- BUG raiz: `updatePassengers` trocava o sprite de TODOS os passageiros novos pelo "trabalhador" genérico
  (tipos COMERCIANTE_BEGE, MAMA_ROXO, etc. não estavam no mapeamento). Agora `passengerSpriteKey()` cobre todos os tipos.
- Proporção real do frame (não esticar), andar animado por código (bob + balanço + squash), correção do pool de meshes.
- `SpriteIcon` (menus/guia) também usa a arte real.

## Regras / lógica
- Táxis agora saem por tempo (`remainingWaitTime` nunca era decrementado). 110s no nível 1, desce até 70s. Aviso aos 10s.
- Passageiros só nascem para rotas que existem no nível (antes ~12% pediam rotas sem táxi). Máx. 5 à espera por rota.
- Passageiro a seguir o jogador/rival volta a esperar se o táxi da rota saiu (antes ficava preso para sempre).
- Rota por baia coerente com o nº de baias do nível (nível de 2 baias já não voltava a gerar CACUACO).
- Partida do táxi cheio usa timer do jogo (antes `setTimeout`, que continuava com o jogo em pausa).

## Rivais
- Escolhem o passageiro livre MAIS PRÓXIMO, com táxi disponível, e sem outro rival já a perseguir.
- Largam o passageiro se o táxi saiu (antes bloqueavam).
- Se o rival lota o táxi, o jogador NÃO recebe o bónus/combo/objetivo e perde o combo.

## Cenário / posições
- Passageiros nascem em zonas de espera (bancos, abrigo, placa, barraca), longe do jogador (>=3.5) e entre si (>=1.4).
- Zungueiras e fiscais contornam bancos/abrigo/barraca em vez de os atravessar.

## Cenário sobreposto (ronda 2) — ver `src/data/layout.ts`
Medido a partir da geometria real: fachadas da fila central em z≈8.75–9.25; rampa/toldo/apron até z≈7.3.
- Candeeiros, caixotes, bancas, ATM e pneus estavam em z 8.6–9.2 (DENTRO das lojas) → agora z=7.0, em vãos livres entre o mobiliário.
- Árvores (z=8.5, dentro das lojas) → z=5.0, x=±20.5, escala 0.75. Abrigo (z=7.5) → z=5.0 escala 0.8. Placa e barraca reduzidas a 0.8 e afastadas.
- Jogador podia andar até z=11 (dentro das lojas) → limite z=6.9. Patrulhas (zungueiras/fiscal) a z 8.5/7.2 → corredores z=2.2 e z=6.4.
- Prédios da fila central sobrepunham-se uns aos outros (passo fixo 7.6 com larguras até 9.0) → agora encostados com vão de 0.5 e centrados; alas laterais afastadas.
- Passageiros nascem só em zonas de espera (z 1.6–3.8), nunca atrás do mobiliário.
- Etiquetas dos passageiros subidas para cima da cabeça.
