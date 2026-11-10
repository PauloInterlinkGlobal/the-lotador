import React, { useState } from 'react';
import { SpriteIcon } from './SpriteIcon';
import { LUANDA_PASSENGER_ARCHETYPES } from '../types/game';

interface SpriteSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SpriteSheetModal: React.FC<SpriteSheetModalProps> = ({ isOpen, onClose }) => {
  const [selectedTab, setSelectedTab] = useState<'SHEET' | 'CHARACTERS' | 'GODOT'>('SHEET');
  const [copiedGodot, setCopiedGodot] = useState(false);

  if (!isOpen) return null;

  const spriteSheetUrl = '/src/assets/images/spritesheet_characters_horizontal_1792329724097.jpg';

  const characters = [
    {
      id: 'comerciante_bege',
      name: 'Comerciante de Bege',
      role: 'Trabalhador Autônomo',
      desc: 'Camisa cáqui manga curta, bolsa transversal de couro, calça jeans escura e barba cuidada.',
      speed: '3.3 u/s',
      patience: '48s',
      fare: '150 Kz',
      xp: '25 XP',
      color: '#d4a373',
      spriteKey: 'passenger_comerciante_bege',
      individualUrl: '/src/assets/images/npc_comerciante_bege_1792329725390.jpg',
      godotRect: 'Rect2(0, 0, 170, 1024)',
    },
    {
      id: 'estudante_gravata',
      name: 'Estudante Uniformizado',
      role: 'Aluno do Ensino Médio',
      desc: 'Farda branca impecável, gravata azul-marinho, calça social azul e mochila escolar.',
      speed: '4.0 u/s',
      patience: '35s',
      fare: '100 Kz',
      xp: '20 XP',
      color: '#38bdf8',
      spriteKey: 'passenger_estudante_gravata',
      individualUrl: '/src/assets/images/npc_estudante_gravata_1792329726168.jpg',
      godotRect: 'Rect2(170, 0, 170, 1024)',
    },
    {
      id: 'mama_quitandeira',
      name: 'Mama Quitandeira',
      role: 'Comerciante Tradicional',
      desc: 'Turbante amarelo, vestido roxo com motivos africanos alaranjados e sacolas de compras.',
      speed: '2.4 u/s',
      patience: '60s',
      fare: '200 Kz',
      xp: '35 XP',
      color: '#9333ea',
      spriteKey: 'passenger_mama_quitandeira',
      individualUrl: '/src/assets/images/npc_mama_quitandeira_1792329727269.jpg',
      godotRect: 'Rect2(340, 0, 170, 1024)',
    },
    {
      id: 'executivo_azul',
      name: 'Executivo de Azul',
      role: 'Profissional Corporativo',
      desc: 'Camisa social azul-celeste, calça de alfaiataria preta, pasta executiva e relógio.',
      speed: '3.5 u/s',
      patience: '25s',
      fare: '280 Kz',
      xp: '45 XP',
      color: '#0284c7',
      spriteKey: 'passenger_executivo_azul',
      individualUrl: '/src/assets/images/npc_executivo_azul_1792329726315.jpg',
      godotRect: 'Rect2(510, 0, 170, 1024)',
    },
    {
      id: 'moca_amarela',
      name: 'Jovem Moça Estilosa',
      role: 'Estudante Universitária',
      desc: 'T-shirt amarela vibrante, calça jeans clara, bolsinha tiracolo e tranças afro compridas.',
      speed: '3.8 u/s',
      patience: '40s',
      fare: '160 Kz',
      xp: '30 XP',
      color: '#eab308',
      spriteKey: 'passenger_moca_amarela',
      individualUrl: null,
      godotRect: 'Rect2(680, 0, 170, 1024)',
    },
    {
      id: 'jovem_verde',
      name: 'Jovem de Moletom Verde',
      role: 'Jovem Urbano',
      desc: 'Moletom verde com capuz e cordões brancos, ténis brancos e mãos nos bolsos.',
      speed: '4.2 u/s',
      patience: '22s',
      fare: '170 Kz',
      xp: '30 XP',
      color: '#16a34a',
      spriteKey: 'passenger_jovem_verde',
      individualUrl: null,
      godotRect: 'Rect2(850, 0, 174, 1024)',
    },
  ];

  const godotSnippet = `# ==========================================
# LOTADOR: Script de Importação para Godot 4.x
# Criação de AtlasTexture para cada passageiro
# ==========================================
extends Node

var spritesheet_texture: Texture2D = preload("res://assets/spritesheet_characters_horizontal.jpg")

var passenger_regions = {
    "comerciante_bege": Rect2(0, 0, 170, 1024),
    "estudante_gravata": Rect2(170, 0, 170, 1024),
    "mama_quitandeira": Rect2(340, 0, 170, 1024),
    "executivo_azul": Rect2(510, 0, 170, 1024),
    "moca_amarela": Rect2(680, 0, 170, 1024),
    "jovem_verde": Rect2(850, 0, 174, 1024)
}

func get_passenger_atlas(passenger_key: String) -> AtlasTexture:
    if not passenger_regions.has(passenger_key):
        return null
    var atlas = AtlasTexture.new()
    atlas.atlas = spritesheet_texture
    atlas.region = passenger_regions[passenger_key]
    return atlas
`;

  const copyGodotCode = () => {
    navigator.clipboard.writeText(godotSnippet);
    setCopiedGodot(true);
    setTimeout(() => setCopiedGodot(false), 2000);
  };

  const handleDownloadImage = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl sticker-border hard-shadow-lg flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-[#f9f9ff]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ffd700] sticker-border-sm flex items-center justify-center">
              <span className="material-symbols-outlined text-[#161c28]">palette</span>
            </div>
            <div>
              <h2 className="font-anybody font-black text-xl text-[#161c28] tracking-tight">
                ASSETS DE PERSONAGENS & GODOT
              </h2>
              <p className="font-space text-xs text-slate-500">
                6 Novos Passageiros da Paragem de Luanda • Clean Vector Art
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-[#161c28] flex items-center justify-center font-bold sticker-border-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 pt-3 bg-white border-b border-slate-200 gap-2 shrink-0">
          <button
            onClick={() => setSelectedTab('SHEET')}
            className={`px-4 py-2 font-space font-bold text-xs rounded-t-xl transition-all cursor-pointer ${
              selectedTab === 'SHEET'
                ? 'bg-[#161c28] text-white shadow'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            🖼️ Sprite Sheet Horizontal
          </button>
          <button
            onClick={() => setSelectedTab('CHARACTERS')}
            className={`px-4 py-2 font-space font-bold text-xs rounded-t-xl transition-all cursor-pointer ${
              selectedTab === 'CHARACTERS'
                ? 'bg-[#161c28] text-white shadow'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            👥 6 Arquétipos & Atributos
          </button>
          <button
            onClick={() => setSelectedTab('GODOT')}
            className={`px-4 py-2 font-space font-bold text-xs rounded-t-xl transition-all cursor-pointer ${
              selectedTab === 'GODOT'
                ? 'bg-[#161c28] text-white shadow'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ⚙️ Guia Godot Engine (GDScript)
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {selectedTab === 'SHEET' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#eef2ff] p-4 rounded-2xl border border-indigo-200">
                <div>
                  <h3 className="font-space font-black text-sm text-[#161c28]">
                    Folha Horizontal com os 6 Personagens
                  </h3>
                  <p className="font-space text-xs text-slate-600 mt-0.5">
                    Imagem em resolução 1024×1024 contendo os 6 passageiros alinhados para fatiamento limpo.
                  </p>
                </div>
                <button
                  onClick={() => handleDownloadImage(spriteSheetUrl, 'lotador_spritesheet_characters_horizontal.jpg')}
                  className="px-4 py-2 bg-[#ffd700] hover:bg-[#ffe16d] text-[#161c28] font-space font-black text-xs rounded-xl sticker-border-sm hard-shadow-sm flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-base">download</span>
                  DESCARREGAR SPRITE SHEET
                </button>
              </div>

              {/* Image Preview Box */}
              <div className="relative w-full bg-[#f1f5f9] rounded-2xl p-4 border border-slate-300 flex flex-col items-center justify-center overflow-hidden">
                <img
                  src={spriteSheetUrl}
                  alt="Sprite sheet horizontal com 6 personagens de Luanda"
                  referrerPolicy="no-referrer"
                  className="max-h-80 w-auto object-contain rounded-xl shadow-md border border-slate-200"
                />
                <div className="w-full grid grid-cols-6 gap-1 mt-3 text-center text-[10px] font-space font-bold text-slate-600">
                  <div className="bg-white/80 py-1 rounded border border-slate-200">1. Comerciante</div>
                  <div className="bg-white/80 py-1 rounded border border-slate-200">2. Estudante</div>
                  <div className="bg-white/80 py-1 rounded border border-slate-200">3. Mama</div>
                  <div className="bg-white/80 py-1 rounded border border-slate-200">4. Executivo</div>
                  <div className="bg-white/80 py-1 rounded border border-slate-200">5. Jovem Moça</div>
                  <div className="bg-white/80 py-1 rounded border border-slate-200">6. Moletom Verde</div>
                </div>
              </div>

              {/* Status Note */}
              <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-xs font-space">
                <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                <span>
                  <strong>Ativos no Jogo Web:</strong> Estes 6 personagens já circulam em tempo real nas paragens de Luanda no jogo!
                </span>
              </div>
            </div>
          )}

          {selectedTab === 'CHARACTERS' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {characters.map((c, index) => (
                <div
                  key={c.id}
                  className="bg-white rounded-2xl sticker-border hard-shadow p-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="w-6 h-6 rounded-full bg-[#161c28] text-white font-space font-black text-xs flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span
                        className="text-[10px] font-space font-black uppercase px-2 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: c.color }}
                      >
                        {c.role}
                      </span>
                    </div>

                    {/* Sprite Display */}
                    <div className="h-32 bg-[#f8fafc] rounded-xl flex items-center justify-center p-2 mb-3 border border-slate-200 overflow-hidden relative">
                      {c.individualUrl ? (
                        <img
                          src={c.individualUrl}
                          alt={c.name}
                          referrerPolicy="no-referrer"
                          className="h-full object-contain filter drop-shadow"
                        />
                      ) : (
                        <SpriteIcon name={c.spriteKey} className="w-20 h-28 filter drop-shadow" />
                      )}
                    </div>

                    <h4 className="font-anybody font-black text-sm text-[#161c28]">{c.name}</h4>
                    <p className="font-space text-xs text-slate-500 mt-1 mb-3 line-clamp-2">{c.desc}</p>
                  </div>

                  {/* Attributes Badges */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-space">
                      <div className="bg-slate-100 p-1.5 rounded-lg flex items-center justify-between">
                        <span className="text-slate-500">Velocidade:</span>
                        <strong className="text-[#161c28]">{c.speed}</strong>
                      </div>
                      <div className="bg-slate-100 p-1.5 rounded-lg flex items-center justify-between">
                        <span className="text-slate-500">Paciência:</span>
                        <strong className="text-[#161c28]">{c.patience}</strong>
                      </div>
                      <div className="bg-amber-50 p-1.5 rounded-lg flex items-center justify-between text-amber-800">
                        <span>Tarifa:</span>
                        <strong>{c.fare}</strong>
                      </div>
                      <div className="bg-blue-50 p-1.5 rounded-lg flex items-center justify-between text-blue-800">
                        <span>Experiência:</span>
                        <strong>{c.xp}</strong>
                      </div>
                    </div>

                    {c.individualUrl && (
                      <button
                        onClick={() => handleDownloadImage(c.individualUrl!, `${c.id}.jpg`)}
                        className="w-full mt-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#161c28] font-space font-bold text-[10px] rounded-lg border border-slate-300 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-xs">download</span>
                        Descarregar Textura 1:1
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedTab === 'GODOT' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-900 text-white p-4 rounded-2xl">
                <div>
                  <h3 className="font-space font-black text-sm text-[#ffd700]">
                    Integração Direta com Godot 4.x
                  </h3>
                  <p className="font-space text-xs text-slate-400 mt-0.5">
                    Código pronto para fatiar o sprite sheet usando classes padrão AtlasTexture e SpriteFrames.
                  </p>
                </div>
                <button
                  onClick={copyGodotCode}
                  className="px-3.5 py-2 bg-[#ffd700] hover:bg-[#ffe16d] text-[#161c28] font-space font-black text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">
                    {copiedGodot ? 'done' : 'content_copy'}
                  </span>
                  {copiedGodot ? 'COPIADO!' : 'COPIAR GDSCRIPT'}
                </button>
              </div>

              {/* Code Snippet Box */}
              <div className="bg-[#1e1e2e] p-4 rounded-2xl border border-slate-700 font-mono text-xs text-emerald-400 overflow-x-auto">
                <pre>{godotSnippet}</pre>
              </div>

              {/* Slicing Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-100 font-space font-black text-xs text-[#161c28] border-b border-slate-200">
                  Tabela de Coordenadas de Recorte (1024 × 1024)
                </div>
                <div className="divide-y divide-slate-100 font-space text-xs">
                  {characters.map((c) => (
                    <div key={c.id} className="px-4 py-2 flex items-center justify-between">
                      <span className="font-bold text-[#161c28]">{c.name}</span>
                      <code className="bg-slate-100 px-2 py-0.5 rounded font-mono text-slate-700">
                        {c.godotRect}
                      </code>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 bg-[#f9f9ff]">
          <span className="font-space text-xs text-slate-500">
            Design: Clean Cartoon / Flat Vector Art • Direção de Arte de Luanda
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#161c28] hover:bg-slate-800 text-white font-space font-black text-xs rounded-xl cursor-pointer"
          >
            FECHAR
          </button>
        </div>
      </div>
    </div>
  );
};
