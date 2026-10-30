import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Search, 
  Download, 
  Filter, 
  Edit3, 
  Trash2,
  CheckCircle,
  Clock
} from 'lucide-react';
import { TransacaoFinanceira } from '../types';
import { exportCSV } from '../utils/exportUtils';

interface FinancialTabProps {
  transactions: TransacaoFinanceira[];
  onAddTransaction: (t: Omit<TransacaoFinanceira, 'id'>) => void;
  onUpdateTransaction: (t: TransacaoFinanceira) => void;
  onDeleteTransaction: (id: number) => void;
}

export const FinancialTab: React.FC<FinancialTabProps> = ({
  transactions,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'Entrada' | 'Saída'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Pago' | 'Pendente'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<TransacaoFinanceira | null>(null);

  const [formData, setFormData] = useState({
    tipo: 'Saída' as 'Entrada' | 'Saída',
    categoria: 'Alimentação',
    descricao: '',
    data: new Date().toISOString().slice(0, 10),
    valor: 100,
    origem: 'Doação',
    status: 'Pago' as 'Pago' | 'Pendente'
  });

  const handleOpenAdd = () => {
    setEditingTransaction(null);
    setFormData({
      tipo: 'Saída',
      categoria: 'Alimentação',
      descricao: '',
      data: new Date().toISOString().slice(0, 10),
      valor: 100,
      origem: 'Doação',
      status: 'Pago'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: TransacaoFinanceira) => {
    setEditingTransaction(t);
    setFormData({
      tipo: t.tipo,
      categoria: t.categoria,
      descricao: t.descricao,
      data: t.data,
      valor: t.valor,
      origem: t.origem,
      status: t.status
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.descricao.trim()) return;

    if (editingTransaction) {
      onUpdateTransaction({
        ...editingTransaction,
        ...formData
      });
    } else {
      onAddTransaction(formData);
    }
    setIsModalOpen(false);
  };

  const filtered = transactions.filter(t => {
    const matchesSearch = t.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.origem.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || t.tipo === filterType;
    const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Totals
  const entradasPagas = transactions
    .filter(t => t.tipo === 'Entrada' && t.status === 'Pago')
    .reduce((acc, t) => acc + t.valor, 0);

  const entradasPendentes = transactions
    .filter(t => t.tipo === 'Entrada' && t.status === 'Pendente')
    .reduce((acc, t) => acc + t.valor, 0);

  const saidasPagas = transactions
    .filter(t => t.tipo === 'Saída' && t.status === 'Pago')
    .reduce((acc, t) => acc + t.valor, 0);

  const saidasPendentes = transactions
    .filter(t => t.tipo === 'Saída' && t.status === 'Pendente')
    .reduce((acc, t) => acc + t.valor, 0);

  const saldoLiquidoAtual = entradasPagas - saidasPagas;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-teal-400" />
            Fluxo Financeiro & Livro Caixa
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Registro detalhado de todas as entradas, despesas operacionais e prestações de contas
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportCSV(transactions, 'livro_caixa_bom_samaritano')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar CSV
          </button>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs sm:text-sm font-medium transition shadow-md shadow-teal-950/40"
          >
            <Plus className="w-4 h-4" />
            Novo Lançamento
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase font-semibold">Entradas Realizadas</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-bold text-emerald-400 mt-1">R$ {entradasPagas.toFixed(2)}</p>
          <span className="text-xs text-slate-500">Pendente a receber: R$ {entradasPendentes.toFixed(2)}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase font-semibold">Saídas Realizadas</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-xl font-bold text-rose-400 mt-1">R$ {saidasPagas.toFixed(2)}</p>
          <span className="text-xs text-slate-500">Pendente de quitação: R$ {saidasPendentes.toFixed(2)}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase font-semibold">Saldo Atual Disponível</span>
            <DollarSign className="w-4 h-4 text-teal-400" />
          </div>
          <p className="text-xl font-bold text-white mt-1">R$ {saldoLiquidoAtual.toFixed(2)}</p>
          <span className="text-xs text-teal-400 font-medium">Balanço Positivo</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por descrição, categoria ou origem..."
            className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700/80 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 ml-1" />
          <div className="flex rounded-lg bg-slate-800 p-1 border border-slate-700">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                filterType === 'all' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterType('Entrada')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                filterType === 'Entrada' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Entradas
            </button>
            <button
              onClick={() => setFilterType('Saída')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                filterType === 'Saída' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Saídas
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
              onClick={() => setFilterStatus('Pago')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                filterStatus === 'Pago' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Pago
            </button>
            <button
              onClick={() => setFilterStatus('Pendente')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                filterStatus === 'Pendente' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Pendente
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/60 text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Tipo</th>
                <th className="py-3.5 px-4 font-semibold">Descrição</th>
                <th className="py-3.5 px-4 font-semibold">Categoria</th>
                <th className="py-3.5 px-4 font-semibold">Origem</th>
                <th className="py-3.5 px-4 font-semibold">Data</th>
                <th className="py-3.5 px-4 font-semibold">Valor</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Nenhum lançamento financeiro encontrado.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded font-semibold ${
                        item.tipo === 'Entrada'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {item.tipo === 'Entrada' ? '+' : '-'} {item.tipo}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-white">
                      {item.descricao}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {item.categoria}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-400">
                      {item.origem}
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-400">
                      {item.data}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`font-bold ${
                        item.tipo === 'Entrada' ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => {
                          onUpdateTransaction({
                            ...item,
                            status: item.status === 'Pago' ? 'Pendente' : 'Pago'
                          });
                        }}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium transition ${
                          item.status === 'Pago'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}
                        title="Alternar Pago / Pendente"
                      >
                        {item.status === 'Pago' ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
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
                          onClick={() => onDeleteTransaction(item.id)}
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

      {/* Modal Add / Edit Transaction */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-teal-400" />
              {editingTransaction ? 'Editar Lançamento' : 'Novo Lançamento Financeiro'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Tipo de Movimentação</label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'Entrada' | 'Saída' })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="Entrada">Entrada (Receita)</option>
                    <option value="Saída">Saída (Despesa)</option>
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
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Descrição do Lançamento *</label>
                <input
                  type="text"
                  required
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Ex: Compra de 10 cestas de alimentos, Som e microfones"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Categoria</label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="Patrocínio">Patrocínio</option>
                    <option value="Alimentação">Alimentação / Cestas</option>
                    <option value="Transporte">Transporte / Frete</option>
                    <option value="Mídia">Mídia / Gráfica / Panfletos</option>
                    <option value="Evento">Evento / Som / Decoração</option>
                    <option value="Administração">Administração / Escritório</option>
                    <option value="Doação">Doação Estimada</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Origem / Destino</label>
                  <input
                    type="text"
                    value={formData.origem}
                    onChange={(e) => setFormData({ ...formData, origem: e.target.value })}
                    placeholder="Ex: Patrocínio, Doação, Fornecedor X"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Data</label>
                  <input
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Pago' | 'Pendente' })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="Pago">Pago / Concluído</option>
                    <option value="Pendente">Pendente / Em Aberto</option>
                  </select>
                </div>
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
                  className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium transition shadow-md shadow-teal-950/40"
                >
                  {editingTransaction ? 'Salvar Alterações' : 'Salvar Lançamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
