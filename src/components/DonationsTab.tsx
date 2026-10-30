import React, { useState } from 'react';
import { 
  Gift, 
  Plus, 
  Search, 
  MessageSquare, 
  CheckCircle, 
  Clock, 
  Phone, 
  Edit3, 
  Trash2, 
  Download,
  Filter,
  UserCheck
} from 'lucide-react';
import { Doador } from '../types';
import { exportCSV } from '../utils/exportUtils';

interface DonationsTabProps {
  donations: Doador[];
  onAddDonation: (donation: Omit<Doador, 'id'>) => void;
  onUpdateDonation: (donation: Doador) => void;
  onDeleteDonation: (id: number) => void;
  onOpenMessageAI: (donation: Doador) => void;
}

export const DonationsTab: React.FC<DonationsTabProps> = ({
  donations,
  onAddDonation,
  onUpdateDonation,
  onDeleteDonation,
  onOpenMessageAI,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDonation, setEditingDonation] = useState<Doador | null>(null);

  const [formData, setFormData] = useState({
    nome: '',
    contato: '',
    tipo_doacao: 'Alimentos',
    quantidade: '10 cestas',
    data: new Date().toISOString().slice(0, 10),
    responsavel: 'Ana',
    status: 'Recebido' as 'Recebido' | 'A Receber',
    divulgar_nome: false,
    observacoes: ''
  });

  const handleOpenAdd = () => {
    setEditingDonation(null);
    setFormData({
      nome: '',
      contato: '',
      tipo_doacao: 'Alimentos',
      quantidade: '5 cestas',
      data: new Date().toISOString().slice(0, 10),
      responsavel: 'Ana',
      status: 'Recebido',
      divulgar_nome: false,
      observacoes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dn: Doador) => {
    setEditingDonation(dn);
    setFormData({
      nome: dn.nome,
      contato: dn.contato,
      tipo_doacao: dn.tipo_doacao,
      quantidade: dn.quantidade,
      data: dn.data,
      responsavel: dn.responsavel,
      status: dn.status,
      divulgar_nome: dn.divulgar_nome,
      observacoes: dn.observacoes
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim()) return;

    if (editingDonation) {
      onUpdateDonation({
        ...editingDonation,
        ...formData
      });
    } else {
      onAddDonation(formData);
    }
    setIsModalOpen(false);
  };

  const filtered = donations.filter(d => {
    const matchesSearch = d.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          d.tipo_doacao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          d.responsavel.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          d.observacoes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || d.tipo_doacao === filterType;
    return matchesSearch && matchesType;
  });

  const distinctTypes = Array.from(new Set(donations.map(d => d.tipo_doacao)));

  return (
    <div className="space-y-6">
      {/* Header and Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Gift className="w-6 h-6 text-amber-400" />
            Doações Físicas & Arrecadações Solidárias
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Controle de cestas básicas, roupas, agasalhos, calçados e brinquedos arrecadados
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportCSV(donations, 'doacoes_bom_samaritano')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar CSV
          </button>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-medium transition shadow-md shadow-amber-950/40"
          >
            <Plus className="w-4 h-4" />
            Nova Doação
          </button>
        </div>
      </div>

      {/* Summary Category Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 uppercase font-semibold">Alimentos</span>
          <p className="text-xl font-bold text-amber-400 mt-1">18 Cestas</p>
          <span className="text-xs text-slate-500">10 recebidas / 8 a entregar</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 uppercase font-semibold">Vestuário</span>
          <p className="text-xl font-bold text-teal-400 mt-1">25 Peças</p>
          <span className="text-xs text-slate-500">Roupas femininas e infantis</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 uppercase font-semibold">Calçados</span>
          <p className="text-xl font-bold text-indigo-400 mt-1">12 Pares</p>
          <span className="text-xs text-slate-500">Calçados adultos e infantis</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 uppercase font-semibold">Brinquedos</span>
          <p className="text-xl font-bold text-rose-400 mt-1">5 Caixas</p>
          <span className="text-xs text-slate-500">Para o dia da grande ação</span>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por doador, tipo ou responsável..."
            className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700/80 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 ml-1" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="all">Todos os Tipos ({donations.length})</option>
            {distinctTypes.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Donations Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/60 text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Doador / Comunidade</th>
                <th className="py-3.5 px-4 font-semibold">Item & Quantidade</th>
                <th className="py-3.5 px-4 font-semibold">Responsável</th>
                <th className="py-3.5 px-4 font-semibold">Data</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-center">Divulgação</th>
                <th className="py-3.5 px-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Nenhuma doação encontrada com os filtros atuais.
                  </td>
                </tr>
              ) : (
                filtered.map((donation) => (
                  <tr key={donation.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{donation.nome}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-500" />
                        <span>{donation.contato}</span>
                        {donation.observacoes && (
                          <span className="text-slate-500">• {donation.observacoes}</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-amber-400">{donation.quantidade}</span>
                      <span className="text-xs text-slate-400 block">{donation.tipo_doacao}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-xs text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                        <UserCheck className="w-3 h-3 text-slate-400" />
                        {donation.responsavel}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-400">
                      {donation.data}
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => {
                          onUpdateDonation({
                            ...donation,
                            status: donation.status === 'Recebido' ? 'A Receber' : 'Recebido'
                          });
                        }}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition ${
                          donation.status === 'Recebido'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {donation.status === 'Recebido' ? (
                          <CheckCircle className="w-3.5 h-3.5" />
                        ) : (
                          <Clock className="w-3.5 h-3.5" />
                        )}
                        {donation.status}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        donation.divulgar_nome ? 'bg-indigo-950/60 text-indigo-400' : 'bg-slate-800 text-slate-500'
                      }`}>
                        {donation.divulgar_nome ? 'Sim' : 'Anônimo'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenMessageAI(donation)}
                          className="p-1.5 text-amber-400 hover:text-amber-300 hover:bg-amber-500/20 rounded-lg transition"
                          title="Gerar Mensagem de Agradecimento com IA"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(donation)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                          title="Editar"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteDonation(donation.id)}
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

      {/* Modal Add / Edit Donation */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Gift className="w-5 h-5 text-amber-400" />
              {editingDonation ? 'Editar Doação' : 'Registrar Nova Doação'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Nome do Doador / Entidade *</label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Igreja Batista, Família Souza"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
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
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Tipo de Doação</label>
                  <select
                    value={formData.tipo_doacao}
                    onChange={(e) => setFormData({ ...formData, tipo_doacao: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Alimentos">Alimentos (Cestas/Quilos)</option>
                    <option value="Roupas">Roupas / Agasalhos</option>
                    <option value="Sapatos">Sapatos / Calçados</option>
                    <option value="Brinquedos">Brinquedos</option>
                    <option value="Material de Higiene">Material de Higiene</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Quantidade / Descrição *</label>
                  <input
                    type="text"
                    required
                    value={formData.quantidade}
                    onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })}
                    placeholder="Ex: 10 cestas, 15 pares, 3 caixas"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Voluntário Responsável</label>
                  <input
                    type="text"
                    value={formData.responsavel}
                    onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                    placeholder="Ex: Ana, João, Michel"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Status de Entrega</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Recebido' | 'A Receber' })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
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
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Observações</label>
                <input
                  type="text"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  placeholder="Ex: Prometeu entregar até sexta, roupas infantis, etc."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 border-t border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.divulgar_nome}
                    onChange={(e) => setFormData({ ...formData, divulgar_nome: e.target.checked })}
                    className="rounded bg-slate-800 text-amber-600 focus:ring-0"
                  />
                  Autorizou divulgar nome nas redes / prestação de contas
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
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium transition shadow-md shadow-amber-950/40"
                >
                  {editingDonation ? 'Salvar Alterações' : 'Salvar Doação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
