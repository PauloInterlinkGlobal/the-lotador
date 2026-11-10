/**
 * LOTADOR — Mapa de zonas do passeio (eixo Z, a câmara olha para +Z).
 *
 * Medido a partir da geometria real dos prédios (BuildingManager):
 *   - Fachadas da fila central: z ≈ 8.75 – 9.25 (centro z=12, profundidade 5.5–6.5)
 *   - Rampa/degraus/toldo avançam ~1.4 → ocupam z ≈ 7.3 – 8.75
 *   => Tudo o que é "jogável" ou cenário tem de ficar com z <= 7.0.
 *
 *   z -1.9        cones (separam rua e passeio)
 *   z  0.5 – 2.4  corredor da frente (placa, zungueira)
 *   z  2.6 – 3.6  zona de espera de passageiros
 *   z  4.2 – 5.8  mobiliário: bancos, abrigo, barraca, árvores
 *   z  6.2 – 6.9  corredor de trás (zungueira 2, fiscal) — limite andável
 *   z  7.0        props decorativos (candeeiros, caixotes, bancas, ATM)
 *   z >= 7.3      apron/toldos/fachadas dos prédios (proibido)
 */
export const LAYOUT = {
  /** Limite máximo de Z para jogador, passageiros, rivais e patrulhas. */
  WALK_MAX_Z: 6.9,
  /** Z onde ficam os props decorativos colados ao prédio (sem colisão). */
  PROP_Z: 7.0,
  /** Corredor da frente (patrulhas) e de trás. */
  LANE_FRONT_Z: 2.2,
  LANE_BACK_Z: 6.4,
  /** Limites X do passeio jogável. */
  WALK_MIN_X: -26,
  WALK_MAX_X: 26,
} as const;
