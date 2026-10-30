import React, { useState } from 'react';
import { 
  Video, 
  Image as ImageIcon, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Phone, 
  Search, 
  UserCheck, 
  MessageCircle, 
  X,
  Filter
} from 'lucide-react';
import { Patrocinador } from '../types';

interface VideomakerViewProps {
  sponsors: Patrocinador[];
  onUpdateSponsor: (sponsor: Patrocinador) => void;
}

export const VideomakerView: React.FC<VideomakerViewProps> = ({
  sponsors,
  onUpdateSponsor,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'needVideo' | 'needLogo' | 'completed'>('needVideo');

  const countVideosGravados = sponsors.filter(s => s.video_gravado).length;
  const countLogosEnviadas = sponsors.filter(s => s.logo_enviada).length;
  const total = sponsors.length;

  const filtered = sponsors.filter(s => {
    const matchesSearch = s.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.contato.includes(searchTerm) ||
                          (s.voluntario && s.voluntario.toLowerCase().includes(searchTerm.toLowerCase()));
    if (!matchesSearch) return false;

    if (filterMode === 'needVideo') return !s.video_gravado;
    if (filterMode === 'needLogo') return !s.logo_enviada;
    if (filterMode === 'completed') return s.video_gravado && s.logo_enviada;
    return true;
  });

  const openWhatsApp = (phone: string, sponsorName: string) => {
    const clean = phone.replace(/\D/g, '');
    const num = clean.length <= 11 ? `55${clean}` : clean;
    const text = encodeURIComponent(`Olá! Sou da equipe de produção audiovisual do Projeto Bom Samaritano. Estou alinhando a gravação do vídeo de agradecimento do ${sponsorName}.`);
    window.open(`https://wa.me/${num}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Top Banner Exclusivo do Videomaker */}
      <div className="bg-white border border-plum-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-plum-50 text-plum-900 text-[11px] font-bold border border-plum-200">
              <Video className="w-3.5 h-3.5 text-plum-700" />
              <span>Espaço do Videomaker • Produção de Mídia</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Gravação de Vídeos & Envio de Logos
            </h1>
            <p className="text-xs text-slate-500">
              Acompanhe quem falta gravar o vídeo de agradecimento e quem falta mandar a logo.
            </p>
          </div>

          {/* Progresso de Gravações */}
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-2.5 rounded-xl shrink-0">
            <div className="text-center px-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Vídeos</span>
              <span className="text-base font-extrabold text-solar-600">
                {countVideosGravados}/{total}
              </span>
            </div>
            <div className="h-7 w-px bg-slate-200" />
            <div className="text-center px-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Logos</span>
              <span className="text-base font-extrabold text-plum-700">
                {countLogosEnviadas}/{total}
              </span>
            </div>
          </div>
        </div>

        {/* Barra de Progresso Visual */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center gap-3">
          <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-solar-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${(countVideosGravados / (total || 1)) * 100}%` }}
            />
          </div>
          <span className="text-xs font-bold text-solar-700 whitespace-nowrap">
            {Math.round((countVideosGravados / (total || 1)) * 100)}% gravados
          </span>
        </div>
      </div>

      {/* Busca e Filtros Rápidos (Horizontal Mobile Scroll) */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar empresa ou voluntário responsável..."
            className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 shadow-xs"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setFilterMode('needVideo')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              filterMode === 'needVideo'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            Falta Gravar ({sponsors.filter(s => !s.video_gravado).length})
          </button>
          <button
            onClick={() => setFilterMode('needLogo')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              filterMode === 'needLogo'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
            Falta Logo ({sponsors.filter(s => !s.logo_enviada).length})
          </button>
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
              filterMode === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Todos ({total})
          </button>
          <button
            onClick={() => setFilterMode('completed')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              filterMode === 'completed'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Concluídos ({sponsors.filter(s => s.video_gravado && s.logo_enviada).length})
          </button>
        </div>
      </div>

      {/* Lista de Cards para o Videomaker (Mobile-First Touch) */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400 text-sm space-y-1">
            <CheckCircle2 className="w-8 h-8 text-teal-600 mx-auto" />
            <p className="font-semibold text-slate-700">Tudo em dia nesta seleção!</p>
            <p className="text-xs text-slate-400">Nenhum parceiro pendente com o filtro atual.</p>
          </div>
        ) : (
          filtered.map((sponsor) => (
            <div 
              key={sponsor.id} 
              className={`bg-white border rounded-2xl p-4 shadow-xs space-y-3 transition ${
                !sponsor.video_gravado ? 'border-amber-200/90' : 'border-slate-200'
              }`}
            >
              {/* Topo do Card */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-tight">
                    {sponsor.nome}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {sponsor.contato}
                    </span>
                    {sponsor.voluntario && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                        <UserCheck className="w-3 h-3 text-emerald-600" />
                        Captação: <strong>{sponsor.voluntario}</strong>
                      </span>
                    )}
                  </div>
                </div>

                {/* Botão de contato rápido */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openWhatsApp(sponsor.contato, sponsor.nome)}
                    className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center gap-1 transition"
                    title="Chamar no WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </button>
                </div>
              </div>

              {/* Botões Grandes de Toque para Vídeo e Logo */}
              <div className="grid grid-cols-2 gap-2.5 pt-1 border-t border-slate-100">
                {/* 1. Botão do Vídeo Gravado */}
                <button
                  type="button"
                  onClick={() => {
                    onUpdateSponsor({
                      ...sponsor,
                      video_gravado: !sponsor.video_gravado
                    });
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer border active:scale-95 ${
                    sponsor.video_gravado
                      ? 'bg-teal-50 text-teal-800 border-teal-200 shadow-2xs'
                      : 'bg-amber-50 text-amber-800 border-amber-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Video className={`w-4 h-4 ${sponsor.video_gravado ? 'text-teal-600' : 'text-amber-600'}`} />
                    <div className="text-left">
                      <span className="text-[10px] uppercase font-normal text-slate-400 block leading-tight">Gravação</span>
                      <span>{sponsor.video_gravado ? 'Vídeo Gravado ✓' : 'Falta Gravar ⏳'}</span>
                    </div>
                  </div>
                  {sponsor.video_gravado ? (
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  )}
                </button>

                {/* 2. Botão da Logo Enviada */}
                <button
                  type="button"
                  onClick={() => {
                    onUpdateSponsor({
                      ...sponsor,
                      logo_enviada: !sponsor.logo_enviada
                    });
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer border active:scale-95 ${
                    sponsor.logo_enviada
                      ? 'bg-indigo-50 text-indigo-800 border-indigo-200 shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ImageIcon className={`w-4 h-4 ${sponsor.logo_enviada ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <div className="text-left">
                      <span className="text-[10px] uppercase font-normal text-slate-400 block leading-tight">Logotipo</span>
                      <span>{sponsor.logo_enviada ? 'Logo OK ✓' : 'Falta Logo ✗'}</span>
                    </div>
                  </div>
                  {sponsor.logo_enviada ? (
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
              </div>

              {sponsor.observacoes && (
                <div className="text-[11px] text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg">
                  Obs: {sponsor.observacoes}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
