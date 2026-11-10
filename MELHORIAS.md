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
