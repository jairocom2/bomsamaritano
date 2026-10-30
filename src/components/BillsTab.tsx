import React, { useState } from 'react';
import { 
  CalendarClock, 
  Plus, 
  Search, 
  Download, 
  Filter, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  UserCheck
} from 'lucide-react';
import { Conta } from '../types';
import { exportCSV } from '../utils/exportUtils';

interface BillsTabProps {
  bills: Conta[];
  onAddBill: (b: Omit<Conta, 'id'>) => void;
  onUpdateBill: (b: Conta) => void;
  onDeleteBill: (id: number) => void;
}

export const BillsTab: React.FC<BillsTabProps> = ({
  bills,
  onAddBill,
  onUpdateBill,
  onDeleteBill,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState<'all' | 'Pagar' | 'Receber'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Em Aberto' | 'Pago' | 'Recebido'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Conta | null>(null);

  const [formData, setFormData] = useState({
    tipo: 'Pagar' as 'Pagar' | 'Receber',
    descricao: '',
    valor: 200,
    categoria: 'Alimentação',
    vencimento: new Date().toISOString().slice(0, 10),
    status: 'Em Aberto' as 'Em Aberto' | 'Pago' | 'Recebido',
    responsavel: 'Ana',
    observacoes: ''
  });

  const handleOpenAdd = () => {
    setEditingBill(null);
    setFormData({
      tipo: 'Pagar',
      descricao: '',
      valor: 200,
      categoria: 'Alimentação',
      vencimento: new Date().toISOString().slice(0, 10),
      status: 'Em Aberto',
      responsavel: 'Ana',
      observacoes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: Conta) => {
    setEditingBill(b);
    setFormData({
      tipo: b.tipo,
      descricao: b.descricao,
      valor: b.valor,
      categoria: b.categoria,
      vencimento: b.vencimento,
      status: b.status,
      responsavel: b.responsavel,
      observacoes: b.observacoes
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.descricao.trim()) return;

    if (editingBill) {
      onUpdateBill({
        ...editingBill,
        ...formData
      });
    } else {
      onAddBill(formData);
    }
    setIsModalOpen(false);
  };

  const filtered = bills.filter(b => {
    const matchesSearch = b.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.responsavel.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.observacoes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = filterTipo === 'all' || b.tipo === filterTipo;
    const matchesStatus = filterStatus === 'all' || b.status === filterStatus;
    return matchesSearch && matchesTipo && matchesStatus;
  });

  const totalPagarAberto = bills
    .filter(b => b.tipo === 'Pagar' && b.status === 'Em Aberto')
    .reduce((acc, b) => acc + b.valor, 0);

  const totalReceberAberto = bills
    .filter(b => b.tipo === 'Receber' && b.status === 'Em Aberto')
    .reduce((acc, b) => acc + b.valor, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <CalendarClock className="w-6 h-6 text-indigo-400" />
            Contas a Pagar & a Receber
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Cronograma de vencimentos operacionais, fornecedores do evento e créditos de patrocínio
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportCSV(bills, 'contas_bom_samaritano')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar CSV
          </button>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-medium transition shadow-md shadow-indigo-950/40"
          >
            <Plus className="w-4 h-4" />
            Nova Conta
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-rose-400 uppercase font-semibold flex items-center gap-1">
              <ArrowDownLeft className="w-4 h-4" />
              Contas a Pagar em Aberto
            </span>
            <p className="text-2xl font-bold text-white mt-1">R$ {totalPagarAberto.toFixed(2)}</p>
            <span className="text-xs text-slate-500">Ex: Cestas básicas (R$ 600) e Som (R$ 400)</span>
          </div>
          <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-400 uppercase font-semibold flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4" />
              Valores a Receber em Aberto
            </span>
            <p className="text-2xl font-bold text-white mt-1">R$ {totalReceberAberto.toFixed(2)}</p>
            <span className="text-xs text-slate-500">Ex: Loja da Moda (R$ 500)</span>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por descrição, categoria, responsável..."
            className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700/80 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 ml-1" />
          <div className="flex rounded-lg bg-slate-800 p-1 border border-slate-700">
            <button
              onClick={() => setFilterTipo('all')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                filterTipo === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterTipo('Pagar')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                filterTipo === 'Pagar' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              A Pagar
            </button>
            <button
              onClick={() => setFilterTipo('Receber')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                filterTipo === 'Receber' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              A Receber
            </button>
          </div>

          <div className="flex rounded-lg bg-slate-800 p-1 border border-slate-700">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                filterStatus === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Status: Todos
            </button>
            <button
              onClick={() => setFilterStatus('Em Aberto')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                filterStatus === 'Em Aberto' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Em Aberto
            </button>
            <button
              onClick={() => setFilterStatus('Pago')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                filterStatus === 'Pago' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Quitados
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/60 text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Tipo</th>
                <th className="py-3.5 px-4 font-semibold">Descrição</th>
                <th className="py-3.5 px-4 font-semibold">Categoria</th>
                <th className="py-3.5 px-4 font-semibold">Vencimento</th>
                <th className="py-3.5 px-4 font-semibold">Responsável</th>
                <th className="py-3.5 px-4 font-semibold">Valor</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Nenhuma conta encontrada com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded font-bold ${
                        item.tipo === 'Receber'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {item.tipo}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{item.descricao}</div>
                      {item.observacoes && (
                        <div className="text-xs text-slate-400 mt-0.5">{item.observacoes}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-xs">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {item.categoria}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-xs font-medium text-slate-300">
                      {item.vencimento}
                    </td>

                    <td className="py-3.5 px-4 text-xs">
                      <span className="inline-flex items-center gap-1 text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                        <UserCheck className="w-3 h-3 text-slate-400" />
                        {item.responsavel}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`font-bold ${
                        item.tipo === 'Receber' ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => {
                          const nextStatus = item.status === 'Em Aberto' 
                            ? (item.tipo === 'Pagar' ? 'Pago' : 'Recebido') 
                            : 'Em Aberto';
                          onUpdateBill({
                            ...item,
                            status: nextStatus
                          });
                        }}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold transition ${
                          item.status === 'Em Aberto'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        }`}
                        title="Alternar Status"
                      >
                        {item.status === 'Em Aberto' ? (
                          <AlertCircle className="w-3 h-3" />
                        ) : (
                          <CheckCircle className="w-3 h-3" />
                        )}
                        {item.status}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                          title="Editar"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteBill(item.id)}
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

      {/* Modal Add / Edit Bill */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-indigo-400" />
              {editingBill ? 'Editar Conta' : 'Nova Conta Operacional'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Tipo de Conta</label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'Pagar' | 'Receber' })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Pagar">Conta a Pagar (Despesa)</option>
                    <option value="Receber">Conta a Receber (Crédito)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Valor (R$) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.valor}
                    onChange={(e) => setFormData({ ...formData, valor: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Descrição do Compromisso *</label>
                <input
                  type="text"
                  required
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Ex: Compra de cestas básicas, Aluguel do som"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Categoria</label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Alimentação">Alimentação</option>
                    <option value="Serviços">Serviços / Som</option>
                    <option value="Patrocínio">Patrocínio</option>
                    <option value="Mídia">Mídia e Gráfica</option>
                    <option value="Transporte">Transporte</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Responsável Interno</label>
                  <input
                    type="text"
                    value={formData.responsavel}
                    onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                    placeholder="Ex: Ana, João, Michel"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Vencimento</label>
                  <input
                    type="date"
                    value={formData.vencimento}
                    onChange={(e) => setFormData({ ...formData, vencimento: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Em Aberto' | 'Pago' | 'Recebido' })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Em Aberto">Em Aberto</option>
                    <option value="Pago">Pago</option>
                    <option value="Recebido">Recebido</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Observações</label>
                <input
                  type="text"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  placeholder="Ex: Aguardando transferência, Quitado parcialmente"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
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
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition shadow-md shadow-indigo-950/40"
                >
                  {editingBill ? 'Salvar Alterações' : 'Salvar Conta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
