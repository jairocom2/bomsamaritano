import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  Sparkles, 
  Video, 
  MessageSquare, 
  CheckCircle, 
  Clock, 
  Phone, 
  Edit3, 
  Trash2, 
  Download,
  Filter
} from 'lucide-react';
import { Patrocinador } from '../types';
import { exportCSV } from '../utils/exportUtils';

interface SponsorsTabProps {
  sponsors: Patrocinador[];
  onAddSponsor: (sponsor: Omit<Patrocinador, 'id'>) => void;
  onUpdateSponsor: (sponsor: Patrocinador) => void;
  onDeleteSponsor: (id: number) => void;
  onOpenVideoAI: (sponsor: Patrocinador) => void;
  onOpenMessageAI: (sponsor: Patrocinador) => void;
}

export const SponsorsTab: React.FC<SponsorsTabProps> = ({
  sponsors,
  onAddSponsor,
  onUpdateSponsor,
  onDeleteSponsor,
  onOpenVideoAI,
  onOpenMessageAI,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Recebido' | 'A Receber'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<Patrocinador | null>(null);

  // Form State
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
    observacoes: ''
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
      observacoes: 'Patrocínio solidário'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sp: Patrocinador) => {
    setEditingSponsor(sp);
    setFormData({
      nome: sp.nome,
      contato: sp.contato,
      valor_cota: sp.valor_cota,
      forma_pagamento: sp.forma_pagamento,
      data: sp.data,
      status: sp.status,
      video_gravado: sp.video_gravado,
      logo_enviada: sp.logo_enviada,
      divulgar_nome: sp.divulgar_nome,
      observacoes: sp.observacoes
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim()) return;

    if (editingSponsor) {
      onUpdateSponsor({
        ...editingSponsor,
        ...formData
      });
    } else {
      onAddSponsor(formData);
    }
    setIsModalOpen(false);
  };

  const filtered = sponsors.filter(s => {
    const matchesSearch = s.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.contato.includes(searchTerm) ||
                          s.observacoes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalValor = sponsors.reduce((acc, s) => acc + s.valor_cota, 0);
  const totalRecebido = sponsors.filter(s => s.status === 'Recebido').reduce((acc, s) => acc + s.valor_cota, 0);
  const totalPendente = sponsors.filter(s => s.status === 'A Receber').reduce((acc, s) => acc + s.valor_cota, 0);

  return (
    <div className="space-y-6">
      {/* Header and Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-emerald-400" />
            Patrocinadores & Cotas Empresariais
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Gerencie empresas parceiras, cotas Ouro/Prata, comprovantes e ativação de marketing
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportCSV(sponsors, 'patrocinadores_bom_samaritano')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar CSV
          </button>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-medium transition shadow-md shadow-emerald-950/40"
          >
            <Plus className="w-4 h-4" />
            Novo Patrocinador
          </button>
        </div>
      </div>

      {/* Mini KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 uppercase font-semibold">Cotas Totais</span>
          <p className="text-xl font-bold text-white mt-1">R$ {totalValor.toFixed(2)}</p>
          <span className="text-xs text-slate-500">{sponsors.length} patrocinadores cadastrados</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 uppercase font-semibold">Valor Recebido</span>
          <p className="text-xl font-bold text-emerald-400 mt-1">R$ {totalRecebido.toFixed(2)}</p>
          <span className="text-xs text-emerald-500/80 font-medium">{Math.round((totalRecebido / (totalValor || 1)) * 100)}% captado</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 uppercase font-semibold">Pendente / A Receber</span>
          <p className="text-xl font-bold text-amber-400 mt-1">R$ {totalPendente.toFixed(2)}</p>
          <span className="text-xs text-amber-500/80 font-medium">Cobrança necessária</span>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome da empresa, contato ou categoria..."
            className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700/80 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 ml-1" />
          <div className="flex rounded-lg bg-slate-800 p-1 border border-slate-700/80">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                filterStatus === 'all' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos ({sponsors.length})
            </button>
            <button
              onClick={() => setFilterStatus('Recebido')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                filterStatus === 'Recebido' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Recebido
            </button>
            <button
              onClick={() => setFilterStatus('A Receber')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                filterStatus === 'A Receber' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              A Receber
            </button>
          </div>
        </div>
      </div>

      {/* Sponsors Table / Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/60 text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Empresa / Patrocinador</th>
                <th className="py-3.5 px-4 font-semibold">Cota & Pgto</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-center">Logo</th>
                <th className="py-3.5 px-4 font-semibold text-center">Vídeo</th>
                <th className="py-3.5 px-4 font-semibold text-center">Divulgação</th>
                <th className="py-3.5 px-4 font-semibold text-right">Ações de IA & Gestão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Nenhum patrocinador encontrado com os filtros atuais.
                  </td>
                </tr>
              ) : (
                filtered.map((sponsor) => (
                  <tr key={sponsor.id} className="hover:bg-slate-800/40 transition">
                    {/* Nome & Contato */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{sponsor.nome}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-500" />
                        <span>{sponsor.contato}</span>
                        {sponsor.observacoes && (
                          <span className="text-slate-500">• {sponsor.observacoes}</span>
                        )}
                      </div>
                    </td>

                    {/* Cota & Forma */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-emerald-400">
                        R$ {sponsor.valor_cota.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-xs text-slate-400">
                        {sponsor.forma_pagamento} • {sponsor.data}
                      </div>
                    </td>

                    {/* Status Badge (Click to toggle) */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => {
                          onUpdateSponsor({
                            ...sponsor,
                            status: sponsor.status === 'Recebido' ? 'A Receber' : 'Recebido'
                          });
                        }}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition ${
                          sponsor.status === 'Recebido'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20'
                        }`}
                        title="Clique para alternar status"
                      >
                        {sponsor.status === 'Recebido' ? (
                          <CheckCircle className="w-3.5 h-3.5" />
                        ) : (
                          <Clock className="w-3.5 h-3.5" />
                        )}
                        {sponsor.status}
                      </button>
                    </td>

                    {/* Logo Enviada Toggle */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => onUpdateSponsor({ ...sponsor, logo_enviada: !sponsor.logo_enviada })}
                        className={`text-xs px-2 py-0.5 rounded font-medium transition ${
                          sponsor.logo_enviada ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {sponsor.logo_enviada ? 'Sim' : 'Não'}
                      </button>
                    </td>

                    {/* Vídeo Gravado Toggle */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => onUpdateSponsor({ ...sponsor, video_gravado: !sponsor.video_gravado })}
                        className={`text-xs px-2 py-0.5 rounded font-medium transition ${
                          sponsor.video_gravado ? 'bg-teal-950/60 text-teal-400 border border-teal-800' : 'bg-amber-950/60 text-amber-400 border border-amber-800'
                        }`}
                      >
                        {sponsor.video_gravado ? 'Gravado' : 'Pendente'}
                      </button>
                    </td>

                    {/* Divulgar Nome Toggle */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => onUpdateSponsor({ ...sponsor, divulgar_nome: !sponsor.divulgar_nome })}
                        className={`text-xs px-2 py-0.5 rounded font-medium transition ${
                          sponsor.divulgar_nome ? 'bg-indigo-950/60 text-indigo-400' : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {sponsor.divulgar_nome ? 'Autorizado' : 'Privado'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* IA Video Script */}
                        <button
                          onClick={() => onOpenVideoAI(sponsor)}
                          className="p-1.5 text-amber-300 hover:text-amber-200 hover:bg-amber-500/20 rounded-lg transition"
                          title="Gerar Roteiro de Vídeo com IA"
                        >
                          <Video className="w-4 h-4" />
                        </button>

                        {/* IA Message Generator */}
                        <button
                          onClick={() => onOpenMessageAI(sponsor)}
                          className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 rounded-lg transition"
                          title="Criar Mensagem WhatsApp / Cobrança ou Agradecimento"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => handleOpenEdit(sponsor)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                          title="Editar"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => onDeleteSponsor(sponsor.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-400" />
              {editingSponsor ? 'Editar Patrocinador' : 'Novo Patrocinador'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Nome da Empresa / Parceiro *</label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Comercial Boa Esperança"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Contato / Telefone</label>
                  <input
                    type="text"
                    value={formData.contato}
                    onChange={(e) => setFormData({ ...formData, contato: e.target.value })}
                    placeholder="(98) 9XXXX-XXXX"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Valor da Cota (R$) *</label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    required
                    value={formData.valor_cota}
                    onChange={(e) => setFormData({ ...formData, valor_cota: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Forma de Pagamento</label>
                  <select
                    value={formData.forma_pagamento}
                    onChange={(e) => setFormData({ ...formData, forma_pagamento: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Pix">Pix</option>
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Transferência">Transferência</option>
                    <option value="Boleto">Boleto</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Recebido' | 'A Receber' })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Recebido">Recebido</option>
                    <option value="A Receber">A Receber</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Data</label>
                  <input
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Observações / Categoria da Cota</label>
                <input
                  type="text"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  placeholder="Ex: Patrocínio ouro, cota prata, etc."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.logo_enviada}
                    onChange={(e) => setFormData({ ...formData, logo_enviada: e.target.checked })}
                    className="rounded bg-slate-800 text-emerald-600 focus:ring-0"
                  />
                  Logo Enviada
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.video_gravado}
                    onChange={(e) => setFormData({ ...formData, video_gravado: e.target.checked })}
                    className="rounded bg-slate-800 text-emerald-600 focus:ring-0"
                  />
                  Vídeo Gravado
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.divulgar_nome}
                    onChange={(e) => setFormData({ ...formData, divulgar_nome: e.target.checked })}
                    className="rounded bg-slate-800 text-emerald-600 focus:ring-0"
                  />
                  Divulgar Nome
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition shadow-md shadow-emerald-950/40"
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
