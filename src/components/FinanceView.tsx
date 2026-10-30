import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  Edit3, 
  Trash2, 
  Wallet,
  X,
  FolderPlus
} from 'lucide-react';
import { TransacaoFinanceira, CategoriaItem } from '../types';

interface FinanceViewProps {
  transactions: TransacaoFinanceira[];
  categorias?: CategoriaItem[];
  onAddTransaction: (t: Omit<TransacaoFinanceira, 'id'>) => void;
  onUpdateTransaction: (t: TransacaoFinanceira) => void;
  onDeleteTransaction: (id: number) => void;
  onAddCategoria?: (cat: Omit<CategoriaItem, 'id'>) => void;
}

export const FinanceView: React.FC<FinanceViewProps> = ({
  transactions,
  categorias = [],
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
  onAddCategoria,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'Entrada' | 'Saída'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Pago' | 'Pendente'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<TransacaoFinanceira | null>(null);

  // Quick inline add category
  const [showInlineNewCat, setShowInlineNewCat] = useState(false);
  const [inlineNewCatName, setInlineNewCatName] = useState('');

  const [formData, setFormData] = useState({
    tipo: 'Entrada' as 'Entrada' | 'Saída',
    categoria: 'Patrocínio',
    descricao: '',
    data: new Date().toISOString().slice(0, 10),
    valor: 100,
    origem: 'Patrocínio',
    status: 'Pago' as 'Pago' | 'Pendente'
  });

  const handleOpenAdd = (defaultType: 'Entrada' | 'Saída' = 'Entrada') => {
    setEditingTx(null);
    setFormData({
      tipo: defaultType,
      categoria: defaultType === 'Entrada' ? 'Patrocínio' : 'Alimentação',
      descricao: '',
      data: new Date().toISOString().slice(0, 10),
      valor: 100,
      origem: defaultType === 'Entrada' ? 'Patrocínio' : 'Fornecedor',
      status: 'Pago'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: TransacaoFinanceira) => {
    setEditingTx(t);
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

    if (editingTx) {
      onUpdateTransaction({ ...editingTx, ...formData });
    } else {
      onAddTransaction(formData);
    }
    setIsModalOpen(false);
  };

  // Calculations
  const totalEntradasPagas = transactions
    .filter(t => t.tipo === 'Entrada' && t.status === 'Pago')
    .reduce((acc, t) => acc + t.valor, 0);

  const totalEntradasPendentes = transactions
    .filter(t => t.tipo === 'Entrada' && t.status === 'Pendente')
    .reduce((acc, t) => acc + t.valor, 0);

  const totalSaidasPagas = transactions
    .filter(t => t.tipo === 'Saída' && t.status === 'Pago')
    .reduce((acc, t) => acc + t.valor, 0);

  const totalSaidasPendentes = transactions
    .filter(t => t.tipo === 'Saída' && t.status === 'Pendente')
    .reduce((acc, t) => acc + t.valor, 0);

  const saldoAtual = totalEntradasPagas - totalSaidasPagas;

  // Filter
  const filtered = transactions.filter(t => {
    const matchesSearch = t.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.origem.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || t.tipo === filterType;
    const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-4 sm:space-y-5 pb-6">
      {/* Header Mobile-Friendly */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-plum-700" />
            Finanças • Entradas e Saídas
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Fluxo de caixa simples para acompanhar receitas e despesas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenAdd('Entrada')}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-plum-700 hover:bg-plum-800 active:bg-plum-900 text-white text-xs sm:text-sm font-bold transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-solar-400" />
            <span>+ Entrada</span>
          </button>
          <button
            onClick={() => handleOpenAdd('Saída')}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs sm:text-sm font-semibold transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>- Saída</span>
          </button>
        </div>
      </div>

      {/* KPI Cards em Fundo Claro */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
        {/* Entradas */}
        <div className="bg-white border border-slate-200/90 p-3.5 sm:p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Entradas Pagas</span>
            <div className="p-1 rounded-md bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-emerald-600 mt-1">
            R$ {totalEntradasPagas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <div className="mt-1 text-xs text-slate-400">
            {totalEntradasPendentes > 0 ? (
              <span className="text-amber-600 font-medium">
                + R$ {totalEntradasPendentes.toFixed(2)} a receber
              </span>
            ) : (
              <span>Todas compensadas</span>
            )}
          </div>
        </div>

        {/* Saídas */}
        <div className="bg-white border border-slate-200/90 p-3.5 sm:p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Saídas Pagas</span>
            <div className="p-1 rounded-md bg-rose-50 text-rose-600">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-rose-600 mt-1">
            R$ {totalSaidasPagas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <div className="mt-1 text-xs text-slate-400">
            {totalSaidasPendentes > 0 ? (
              <span className="text-amber-600 font-medium">
                + R$ {totalSaidasPendentes.toFixed(2)} pendente
              </span>
            ) : (
              <span>Todas as contas pagas</span>
            )}
          </div>
        </div>

        {/* Saldo Líquido */}
        <div className="bg-white border border-slate-200/90 p-3.5 sm:p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Saldo Líquido</span>
            <div className="p-1 rounded-md bg-teal-50 text-teal-600">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-xl sm:text-2xl font-bold mt-1 ${saldoAtual >= 0 ? 'text-teal-700' : 'text-rose-600'}`}>
            R$ {saldoAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <span className="mt-1 text-xs text-slate-400 block">Disponível em caixa</span>
        </div>
      </div>

      {/* Busca e Filtros Rápidos */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar lançamentos..."
            className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 shadow-xs"
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
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition cursor-pointer shrink-0 ${
              filterType === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Todos ({transactions.length})
          </button>
          <button
            onClick={() => setFilterType('Entrada')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition cursor-pointer shrink-0 ${
              filterType === 'Entrada'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Entradas (+)
          </button>
          <button
            onClick={() => setFilterType('Saída')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition cursor-pointer shrink-0 ${
              filterType === 'Saída'
                ? 'bg-rose-600 text-white'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Saídas (-)
          </button>

          <span className="text-slate-300">|</span>

          <button
            onClick={() => setFilterStatus(filterStatus === 'Pendente' ? 'all' : 'Pendente')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition cursor-pointer shrink-0 ${
              filterStatus === 'Pendente'
                ? 'bg-amber-600 text-white'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Pendentes ({transactions.filter(t => t.status === 'Pendente').length})
          </button>
        </div>
      </div>

      {/* LISTA EM CARDS PARA MOBILE */}
      <div className="space-y-2.5 block sm:hidden">
        {filtered.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-sm">
            Nenhum lançamento encontrado.
          </div>
        ) : (
          filtered.map((item) => (
            <div 
              key={item.id} 
              className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      item.tipo === 'Entrada'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {item.tipo}
                    </span>
                    <span className="text-xs text-slate-400">{item.data}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">{item.descricao}</h3>
                  <span className="text-xs text-slate-500 block">{item.categoria} {item.origem && `• ${item.origem}`}</span>
                </div>

                <div className="text-right shrink-0">
                  <span className={`font-extrabold text-base block ${
                    item.tipo === 'Entrada' ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {item.tipo === 'Entrada' ? '+' : '-'} R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>

                  <button
                    onClick={() => {
                      onUpdateTransaction({
                        ...item,
                        status: item.status === 'Pago' ? 'Pendente' : 'Pago'
                      });
                    }}
                    className={`mt-1 inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border cursor-pointer ${
                      item.status === 'Pago'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {item.status === 'Pago' ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-amber-600" />}
                    <span>{item.status}</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1 border-t border-slate-100 text-xs text-slate-400">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="px-2 py-1 rounded hover:bg-slate-100 text-slate-600 flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Editar
                </button>
                <button
                  onClick={() => onDeleteTransaction(item.id)}
                  className="px-2 py-1 rounded hover:bg-rose-50 text-rose-600 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Excluir
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* TABELA PARA DESKTOP */}
      <div className="hidden sm:block bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Tipo</th>
                <th className="py-3 px-4 font-semibold">Descrição</th>
                <th className="py-3 px-4 font-semibold">Categoria</th>
                <th className="py-3 px-4 font-semibold">Data</th>
                <th className="py-3 px-4 font-semibold">Valor</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    Nenhum lançamento encontrado.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${
                        item.tipo === 'Entrada'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {item.tipo === 'Entrada' ? '+ Entrada' : '- Saída'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {item.descricao}
                      {item.origem && (
                        <span className="text-xs text-slate-400 block font-normal">{item.origem}</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-xs">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {item.categoria}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {item.data}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`font-bold ${
                        item.tipo === 'Entrada' ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {item.tipo === 'Entrada' ? '+' : '-'} R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => {
                          onUpdateTransaction({
                            ...item,
                            status: item.status === 'Pago' ? 'Pendente' : 'Pago'
                          });
                        }}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold cursor-pointer transition border ${
                          item.status === 'Pago'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                        }`}
                        title="Alternar Pago / Pendente"
                      >
                        {item.status === 'Pago' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Clock className="w-3.5 h-3.5 text-amber-600" />}
                        <span>{item.status}</span>
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                          title="Editar"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteTransaction(item.id)}
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

      {/* Modal Add / Edit Transaction */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-teal-600" />
                {editingTx ? 'Editar Movimentação' : 'Nova Movimentação'}
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo</label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'Entrada' | 'Saída' })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white transition"
                  >
                    <option value="Entrada">Entrada (Receita)</option>
                    <option value="Saída">Saída (Despesa)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Valor (R$) *</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    required
                    value={formData.valor}
                    onChange={(e) => setFormData({ ...formData, valor: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição *</label>
                <input
                  type="text"
                  required
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Ex: Compra de alimentos, Som, Panfletos"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">Categoria</label>
                    {onAddCategoria && (
                      <button
                        type="button"
                        onClick={() => setShowInlineNewCat(!showInlineNewCat)}
                        className="text-[10px] font-bold text-teal-600 hover:text-teal-700 cursor-pointer"
                      >
                        {showInlineNewCat ? 'Cancelar' : '+ Nova'}
                      </button>
                    )}
                  </div>

                  {showInlineNewCat ? (
                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={inlineNewCatName}
                        onChange={(e) => setInlineNewCatName(e.target.value)}
                        placeholder="Nome da categoria"
                        className="flex-1 bg-white border border-teal-300 rounded-lg px-2 py-1 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!inlineNewCatName.trim()) return;
                          const targetType = formData.tipo === 'Entrada' ? 'entrada' : 'saida';
                          onAddCategoria?.({ nome: inlineNewCatName.trim(), tipo: targetType });
                          setFormData({ ...formData, categoria: inlineNewCatName.trim() });
                          setInlineNewCatName('');
                          setShowInlineNewCat(false);
                        }}
                        className="px-2 py-1 bg-teal-600 text-white rounded-lg text-xs font-bold"
                      >
                        OK
                      </button>
                    </div>
                  ) : (
                    <select
                      value={formData.categoria}
                      onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white transition"
                    >
                      {categorias.filter(c => c.tipo === (formData.tipo === 'Entrada' ? 'entrada' : 'saida')).length > 0 ? (
                        categorias
                          .filter(c => c.tipo === (formData.tipo === 'Entrada' ? 'entrada' : 'saida'))
                          .map(c => (
                            <option key={c.id} value={c.nome}>{c.nome}</option>
                          ))
                      ) : (
                        <>
                          {formData.tipo === 'Entrada' ? (
                            <>
                              <option value="Patrocínio">Patrocínio</option>
                              <option value="Doação Espontânea">Doação Espontânea</option>
                              <option value="Oferta / Campanha">Oferta / Campanha</option>
                              <option value="Renda de Evento">Renda de Evento</option>
                              <option value="Outra Entrada">Outra Entrada</option>
                            </>
                          ) : (
                            <>
                              <option value="Alimentação / Cestas">Alimentação / Cestas</option>
                              <option value="Transporte / Frete">Transporte / Frete</option>
                              <option value="Mídia / Gráfica">Mídia / Gráfica</option>
                              <option value="Evento / Som">Evento / Som</option>
                              <option value="Decoração / Faixas">Decoração / Faixas</option>
                              <option value="Administração">Administração</option>
                              <option value="Aluguel">Aluguel</option>
                              <option value="Outra Despesa">Outra Despesa</option>
                            </>
                          )}
                        </>
                      )}
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Origem / Destino</label>
                  <input
                    type="text"
                    value={formData.origem}
                    onChange={(e) => setFormData({ ...formData, origem: e.target.value })}
                    placeholder="Ex: Loja X, Fornecedor Y"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Data</label>
                  <input
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Pago' | 'Pendente' })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white transition"
                  >
                    <option value="Pago">Pago / Concluído</option>
                    <option value="Pendente">Pendente / Em Aberto</option>
                  </select>
                </div>
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
                  {editingTx ? 'Salvar Lançamento' : 'Cadastrar Lançamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
