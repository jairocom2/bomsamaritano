import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  Video, 
  Image as ImageIcon, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Edit3, 
  Trash2, 
  Phone, 
  X,
  UserCheck,
  UserPlus
} from 'lucide-react';
import { Patrocinador, VoluntarioItem, CategoriaItem } from '../types';

interface SponsorsViewProps {
  sponsors: Patrocinador[];
  voluntarios?: VoluntarioItem[];
  categorias?: CategoriaItem[];
  onAddSponsor: (sponsor: Omit<Patrocinador, 'id'>) => void;
  onUpdateSponsor: (sponsor: Patrocinador) => void;
  onDeleteSponsor: (id: number) => void;
  onAddVoluntario?: (vol: Omit<VoluntarioItem, 'id'>) => void;
  onAddCategoria?: (cat: Omit<CategoriaItem, 'id'>) => void;
}

export const SponsorsView: React.FC<SponsorsViewProps> = ({
  sponsors,
  voluntarios = [],
  categorias = [],
  onAddSponsor,
  onUpdateSponsor,
  onDeleteSponsor,
  onAddVoluntario,
  onAddCategoria,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [quickFilter, setQuickFilter] = useState<'all' | 'received' | 'needPayment' | 'needVideo' | 'needLogo'>('all');
  const [selectedVolunteer, setSelectedVolunteer] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<Patrocinador | null>(null);

  // Quick inline add states inside modal
  const [showInlineNewVol, setShowInlineNewVol] = useState(false);
  const [inlineNewVolName, setInlineNewVolName] = useState('');
  const [showInlineNewPayment, setShowInlineNewPayment] = useState(false);
  const [inlineNewPaymentName, setInlineNewPaymentName] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    nome: '',
    contato: '',
    valor_cota: 500,
    forma_pagamento: 'Pix',
    data: new Date().toISOString().slice(0, 10),
    status: 'Recebido' as 'Recebido' | 'A Receber',
    video_gravado: false,
    logo_enviada: false,
    divulgar_nome: true,
    observacoes: '',
    voluntario: 'Ana'
  });

  const handleOpenAdd = () => {
    setEditingSponsor(null);
    setFormData({
      nome: '',
      contato: '',
      valor_cota: 500,
      forma_pagamento: 'Pix',
      data: new Date().toISOString().slice(0, 10),
      status: 'Recebido',
      video_gravado: false,
      logo_enviada: false,
      divulgar_nome: true,
      observacoes: 'Patrocínio',
      voluntario: 'Ana'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: Patrocinador) => {
    setEditingSponsor(s);
    setFormData({
      nome: s.nome,
      contato: s.contato,
      valor_cota: s.valor_cota,
      forma_pagamento: s.forma_pagamento,
      data: s.data,
      status: s.status,
      video_gravado: s.video_gravado,
      logo_enviada: s.logo_enviada,
      divulgar_nome: s.divulgar_nome,
      observacoes: s.observacoes,
      voluntario: s.voluntario || 'Ana'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim()) return;

    if (editingSponsor) {
      onUpdateSponsor({ ...editingSponsor, ...formData });
    } else {
      onAddSponsor(formData);
    }
    setIsModalOpen(false);
  };

  // Distinct volunteers
  const distinctVolunteers = Array.from(
    new Set(sponsors.map(s => s.voluntario?.trim()).filter(Boolean))
  ) as string[];

  // Quick stats
  const totalCotas = sponsors.reduce((acc, s) => acc + s.valor_cota, 0);
  const totalRecebido = sponsors.filter(s => s.status === 'Recebido').reduce((acc, s) => acc + s.valor_cota, 0);
  const totalAReceber = totalCotas - totalRecebido;
  const countAReceber = sponsors.filter(s => s.status === 'A Receber').length;
  const countVideosGravados = sponsors.filter(s => s.video_gravado).length;
  const countLogosEnviadas = sponsors.filter(s => s.logo_enviada).length;

  // Filter logic
  const filtered = sponsors.filter(s => {
    const matchesSearch = s.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.contato.includes(searchTerm) ||
                          (s.voluntario && s.voluntario.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          s.observacoes.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    if (selectedVolunteer !== 'all' && s.voluntario !== selectedVolunteer) {
      return false;
    }

    if (quickFilter === 'received') return s.status === 'Recebido';
    if (quickFilter === 'needPayment') return s.status === 'A Receber';
    if (quickFilter === 'needVideo') return !s.video_gravado;
    if (quickFilter === 'needLogo') return !s.logo_enviada;
    return true;
  });

  return (
    <div className="space-y-4 sm:space-y-5 pb-6">
      {/* Top Header Mobile-Friendly */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-plum-700" />
            Patrocinadores & Mídia
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Controle de empresas parceiras, voluntário captador, logo e vídeo.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-plum-700 hover:bg-plum-800 active:bg-plum-900 text-white text-xs sm:text-sm font-bold transition shadow-xs shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-solar-400" />
          <span>Novo Patrocinador</span>
        </button>
      </div>

      {/* Indicadores Resumidos (Light Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3">
        <div className="bg-white border border-slate-200/90 p-3 sm:p-4 rounded-xl shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Valor Previsto</span>
          <p className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
            R$ {totalCotas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-slate-400 font-medium block mt-0.5">{sponsors.length} parceiros</span>
        </div>

        <div className="bg-white border border-slate-200/90 p-3 sm:p-4 rounded-xl shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Valor Recebido</span>
          <p className="text-lg sm:text-xl font-bold text-emerald-600 mt-0.5">
            R$ {totalRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-emerald-600/80 font-medium block mt-0.5">
            {Math.round((totalRecebido / (totalCotas || 1)) * 100)}% pago
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 p-3 sm:p-4 rounded-xl shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Valor A Receber</span>
          <p className="text-lg sm:text-xl font-bold text-rose-600 mt-0.5">
            R$ {totalAReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-rose-600/80 font-medium block mt-0.5">
            {countAReceber} {countAReceber === 1 ? 'pendente' : 'pendentes'}
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 p-3 sm:p-4 rounded-xl shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Vídeos Gravados</span>
          <p className="text-lg sm:text-xl font-bold text-teal-700 mt-0.5">
            {countVideosGravados} / {sponsors.length}
          </p>
          <span className={`text-[11px] font-medium block mt-0.5 ${countVideosGravados === sponsors.length ? 'text-emerald-600' : 'text-amber-600'}`}>
            {sponsors.length - countVideosGravados} pendentes
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 p-3 sm:p-4 rounded-xl shadow-xs col-span-2 lg:col-span-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Logos Recebidas</span>
          <p className="text-lg sm:text-xl font-bold text-indigo-700 mt-0.5">
            {countLogosEnviadas} / {sponsors.length}
          </p>
          <span className={`text-[11px] font-medium block mt-0.5 ${countLogosEnviadas === sponsors.length ? 'text-emerald-600' : 'text-amber-600'}`}>
            {sponsors.length - countLogosEnviadas} pendentes
          </span>
        </div>
      </div>

      {/* Busca e Filtros Rápidos (Horizontal Scroll para Mobile) */}
      <div className="space-y-2.5">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, voluntário ou cota..."
              className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-xs"
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

          {/* Filtro por Voluntário */}
          <div className="shrink-0 flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs">
            <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <select
              value={selectedVolunteer}
              onChange={(e) => setSelectedVolunteer(e.target.value)}
              className="bg-transparent text-xs text-slate-700 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all">Todos os Voluntários</option>
              {distinctVolunteers.map(vol => (
                <option key={vol} value={vol}>Voluntário: {vol}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Filtros em Pílulas com Scroll Horizontal Suave */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setQuickFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition cursor-pointer shrink-0 ${
              quickFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Todos ({sponsors.length})
          </button>
          <button
            onClick={() => setQuickFilter('received')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition cursor-pointer flex items-center gap-1 shrink-0 ${
              quickFilter === 'received'
                ? 'bg-emerald-600 text-white font-bold'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-emerald-50'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Recebido ({sponsors.filter(s => s.status === 'Recebido').length})
          </button>
          <button
            onClick={() => setQuickFilter('needPayment')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition cursor-pointer flex items-center gap-1 shrink-0 ${
              quickFilter === 'needPayment'
                ? 'bg-rose-600 text-white font-bold'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-rose-500" />
            A Receber ({sponsors.filter(s => s.status === 'A Receber').length})
          </button>
          <button
            onClick={() => setQuickFilter('needVideo')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition cursor-pointer flex items-center gap-1 shrink-0 ${
              quickFilter === 'needVideo'
                ? 'bg-amber-600 text-white font-bold'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Video className="w-3.5 h-3.5 text-amber-500" />
            Falta Vídeo ({sponsors.filter(s => !s.video_gravado).length})
          </button>
          <button
            onClick={() => setQuickFilter('needLogo')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition cursor-pointer flex items-center gap-1 shrink-0 ${
              quickFilter === 'needLogo'
                ? 'bg-indigo-600 text-white font-bold'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />
            Falta Logo ({sponsors.filter(s => !s.logo_enviada).length})
          </button>
        </div>
      </div>

      {/* LISTA MOBILE-FIRST EM CARDS (Perfeito para Celular) */}
      <div className="space-y-3 block sm:hidden">
        {filtered.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-sm">
            Nenhum patrocinador encontrado.
          </div>
        ) : (
          filtered.map((sponsor) => (
            <div 
              key={sponsor.id} 
              className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3"
            >
              {/* Header do Card */}
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <h3 className="font-bold text-slate-900 text-base leading-tight">
                    {sponsor.nome}
                  </h3>
                  
                  {/* Voluntário Responsável */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 pt-0.5">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Voluntário: <strong className="text-slate-800">{sponsor.voluntario || 'Não atribuído'}</strong></span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {sponsor.contato}
                    </span>
                    {sponsor.observacoes && (
                      <span>• {sponsor.observacoes}</span>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-extrabold text-base text-slate-900 block">
                    R$ {sponsor.valor_cota.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[11px] text-slate-400 block">{sponsor.forma_pagamento}</span>
                </div>
              </div>

              {/* Botões Grandes de Toque para Celular */}
              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100">
                {/* 1. Botão Status Pagamento */}
                <button
                  type="button"
                  onClick={() => {
                    onUpdateSponsor({
                      ...sponsor,
                      status: sponsor.status === 'Recebido' ? 'A Receber' : 'Recebido'
                    });
                  }}
                  className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition active:scale-95 cursor-pointer border ${
                    sponsor.status === 'Recebido'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  <span className="text-[10px] uppercase font-normal text-slate-400">Pgto</span>
                  <div className="flex items-center gap-1">
                    {sponsor.status === 'Recebido' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Clock className="w-3.5 h-3.5 text-rose-600" />}
                    <span>{sponsor.status}</span>
                  </div>
                </button>

                {/* 2. Botão Logo */}
                <button
                  type="button"
                  onClick={() => {
                    onUpdateSponsor({
                      ...sponsor,
                      logo_enviada: !sponsor.logo_enviada
                    });
                  }}
                  className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition active:scale-95 cursor-pointer border ${
                    sponsor.logo_enviada
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      : 'bg-slate-50 text-slate-500 border-slate-200'
                  }`}
                >
                  <span className="text-[10px] uppercase font-normal text-slate-400">Logo</span>
                  <div className="flex items-center gap-1">
                    {sponsor.logo_enviada ? <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" /> : <XCircle className="w-3.5 h-3.5 text-slate-400" />}
                    <span>{sponsor.logo_enviada ? 'Logo OK' : 'Não enviou'}</span>
                  </div>
                </button>

                {/* 3. Botão Vídeo */}
                <button
                  type="button"
                  onClick={() => {
                    onUpdateSponsor({
                      ...sponsor,
                      video_gravado: !sponsor.video_gravado
                    });
                  }}
                  className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition active:scale-95 cursor-pointer border ${
                    sponsor.video_gravado
                      ? 'bg-teal-50 text-teal-700 border-teal-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  <span className="text-[10px] uppercase font-normal text-slate-400">Vídeo</span>
                  <div className="flex items-center gap-1">
                    {sponsor.video_gravado ? <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> : <Clock className="w-3.5 h-3.5 text-amber-600" />}
                    <span>{sponsor.video_gravado ? 'Gravado' : 'Pendente'}</span>
                  </div>
                </button>
              </div>

              {/* Botões de Ação Secundários */}
              <div className="flex justify-end gap-2 pt-1 text-slate-400 text-xs">
                <button
                  onClick={() => handleOpenEdit(sponsor)}
                  className="px-2.5 py-1 rounded-lg hover:bg-slate-100 text-slate-600 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Editar
                </button>
                <button
                  onClick={() => onDeleteSponsor(sponsor.id)}
                  className="px-2.5 py-1 rounded-lg hover:bg-rose-50 text-rose-600 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Excluir
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* TABELA RESPONSIVA PARA TELAS MAIORES (Desktop / Tablet) */}
      <div className="hidden sm:block bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Patrocinador</th>
                <th className="py-3 px-4 font-semibold">Voluntário Captador</th>
                <th className="py-3 px-4 font-semibold">Cota</th>
                <th className="py-3 px-4 font-semibold text-center">Pagamento</th>
                <th className="py-3 px-4 font-semibold text-center">Logo Enviada?</th>
                <th className="py-3 px-4 font-semibold text-center">Vídeo Gravado?</th>
                <th className="py-3 px-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    Nenhum patrocinador encontrado.
                  </td>
                </tr>
              ) : (
                filtered.map((sponsor) => (
                  <tr key={sponsor.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{sponsor.nome}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {sponsor.contato}
                        </span>
                        {sponsor.observacoes && (
                          <span>• {sponsor.observacoes}</span>
                        )}
                      </div>
                    </td>

                    {/* Voluntário */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                        {sponsor.voluntario || '-'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">
                        R$ {sponsor.valor_cota.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-xs text-slate-400">{sponsor.forma_pagamento}</div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => {
                          onUpdateSponsor({
                            ...sponsor,
                            status: sponsor.status === 'Recebido' ? 'A Receber' : 'Recebido'
                          });
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition border ${
                          sponsor.status === 'Recebido'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                        }`}
                        title="Alternar pagamento"
                      >
                        {sponsor.status === 'Recebido' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Clock className="w-3.5 h-3.5 text-amber-600" />}
                        <span>{sponsor.status}</span>
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => {
                          onUpdateSponsor({
                            ...sponsor,
                            logo_enviada: !sponsor.logo_enviada
                          });
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition border ${
                          sponsor.logo_enviada
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                        }`}
                        title="Alternar logo"
                      >
                        {sponsor.logo_enviada ? <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" /> : <XCircle className="w-3.5 h-3.5 text-slate-400" />}
                        <span>{sponsor.logo_enviada ? 'Logo OK' : 'Não enviou'}</span>
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => {
                          onUpdateSponsor({
                            ...sponsor,
                            video_gravado: !sponsor.video_gravado
                          });
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition border ${
                          sponsor.video_gravado
                            ? 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100'
                            : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                        }`}
                        title="Alternar vídeo"
                      >
                        {sponsor.video_gravado ? <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> : <Clock className="w-3.5 h-3.5 text-amber-600" />}
                        <span>{sponsor.video_gravado ? 'Gravado' : 'Pendente'}</span>
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(sponsor)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                          title="Editar"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteSponsor(sponsor.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit Sponsor */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                {editingSponsor ? 'Editar Patrocinador' : 'Novo Patrocinador'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome da Empresa / Parceiro *</label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Comercial Pinheirense"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                />
              </div>

              {/* Voluntário que conseguiu o patrocínio */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Voluntário que Conseguiu o Patrocínio *
                  </label>
                  {onAddVoluntario && (
                    <button
                      type="button"
                      onClick={() => setShowInlineNewVol(!showInlineNewVol)}
                      className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                    >
                      {showInlineNewVol ? 'Cancelar' : '+ Cadastrar Novo'}
                    </button>
                  )}
                </div>

                {showInlineNewVol ? (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2 mb-2">
                    <span className="text-[11px] font-bold text-emerald-800 block">Cadastrar Novo Voluntário Rapidamente:</span>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={inlineNewVolName}
                        onChange={(e) => setInlineNewVolName(e.target.value)}
                        placeholder="Nome do voluntário..."
                        className="flex-1 bg-white border border-emerald-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!inlineNewVolName.trim()) return;
                          onAddVoluntario?.({ nome: inlineNewVolName.trim(), ativo: true });
                          setFormData({ ...formData, voluntario: inlineNewVolName.trim() });
                          setInlineNewVolName('');
                          setShowInlineNewVol(false);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 cursor-pointer"
                      >
                        Salvar
                      </button>
                    </div>
                  </div>
                ) : (
                  <select
                    required
                    value={formData.voluntario}
                    onChange={(e) => setFormData({ ...formData, voluntario: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                  >
                    <option value="">Selecione o Voluntário</option>
                    {voluntarios.length > 0 ? (
                      voluntarios.map(v => (
                        <option key={v.id} value={v.nome}>{v.nome}</option>
                      ))
                    ) : (
                      distinctVolunteers.map(v => (
                        <option key={v} value={v}>{v}</option>
                      ))
                    )}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contato / Telefone</label>
                  <input
                    type="text"
                    value={formData.contato}
                    onChange={(e) => setFormData({ ...formData, contato: e.target.value })}
                    placeholder="(98) 9XXXX-XXXX"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Valor da Cota (R$) *</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="50"
                    required
                    value={formData.valor_cota}
                    onChange={(e) => setFormData({ ...formData, valor_cota: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">Forma Pgto</label>
                    {onAddCategoria && (
                      <button
                        type="button"
                        onClick={() => setShowInlineNewPayment(!showInlineNewPayment)}
                        className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                      >
                        {showInlineNewPayment ? 'Cancelar' : '+ Nova'}
                      </button>
                    )}
                  </div>

                  {showInlineNewPayment ? (
                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={inlineNewPaymentName}
                        onChange={(e) => setInlineNewPaymentName(e.target.value)}
                        placeholder="Ex: Cartão"
                        className="flex-1 bg-white border border-emerald-300 rounded-lg px-2 py-1 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!inlineNewPaymentName.trim()) return;
                          onAddCategoria?.({ nome: inlineNewPaymentName.trim(), tipo: 'forma_pagamento' });
                          setFormData({ ...formData, forma_pagamento: inlineNewPaymentName.trim() });
                          setInlineNewPaymentName('');
                          setShowInlineNewPayment(false);
                        }}
                        className="px-2 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                      >
                        OK
                      </button>
                    </div>
                  ) : (
                    <select
                      value={formData.forma_pagamento}
                      onChange={(e) => setFormData({ ...formData, forma_pagamento: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                    >
                      {categorias.filter(c => c.tipo === 'forma_pagamento').length > 0 ? (
                        categorias.filter(c => c.tipo === 'forma_pagamento').map(c => (
                          <option key={c.id} value={c.nome}>{c.nome}</option>
                        ))
                      ) : (
                        <>
                          <option value="Pix">Pix</option>
                          <option value="Dinheiro">Dinheiro</option>
                          <option value="Transferência">Transferência</option>
                          <option value="Boleto">Boleto</option>
                          <option value="Outro">Outro</option>
                        </>
                      )}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status Pagamento</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Recebido' | 'A Receber' })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                  >
                    <option value="Recebido">Recebido</option>
                    <option value="A Receber">A Receber</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Observações / Categoria</label>
                <input
                  type="text"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  placeholder="Ex: Cota Ouro, Prata, etc."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                />
              </div>

              {/* Status de Vídeo e Logo */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-700 block mb-1">Gravação e Logotipo:</span>
                <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.logo_enviada}
                    onChange={(e) => setFormData({ ...formData, logo_enviada: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-0 cursor-pointer"
                  />
                  <span>Logotipo já foi enviado</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.video_gravado}
                    onChange={(e) => setFormData({ ...formData, video_gravado: e.target.checked })}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-0 cursor-pointer"
                  />
                  <span>Vídeo de agradecimento já foi gravado</span>
                </label>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-plum-700 hover:bg-plum-800 text-white text-sm font-bold transition shadow-xs cursor-pointer"
                >
                  {editingSponsor ? 'Salvar Alterações' : 'Cadastrar Patrocinador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
