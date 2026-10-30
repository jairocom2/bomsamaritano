import React, { useState } from 'react';
import { 
  FolderTree, 
  UserCheck, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Award, 
  Phone, 
  CheckCircle2, 
  Building2,
  Users
} from 'lucide-react';
import { VoluntarioItem, CategoriaItem, BackupData } from '../types';

interface CategoriesManagementViewProps {
  voluntarios: VoluntarioItem[];
  categorias: CategoriaItem[];
  data: BackupData;
  onAddVoluntario: (vol: Omit<VoluntarioItem, 'id'>) => void;
  onUpdateVoluntario: (vol: VoluntarioItem) => void;
  onDeleteVoluntario: (id: number) => void;
  onAddCategoria: (cat: Omit<CategoriaItem, 'id'>) => void;
  onUpdateCategoria: (cat: CategoriaItem) => void;
  onDeleteCategoria: (id: number) => void;
}

export const CategoriesManagementView: React.FC<CategoriesManagementViewProps> = ({
  voluntarios,
  categorias,
  data,
  onAddVoluntario,
  onUpdateVoluntario,
  onDeleteVoluntario,
  onAddCategoria,
  onUpdateCategoria,
  onDeleteCategoria,
}) => {
  const [activeTab, setActiveTab] = useState<'voluntarios' | 'saida' | 'entrada' | 'pagamento' | 'cotas'>('voluntarios');
  
  // New Volunteer state
  const [newVolNome, setNewVolNome] = useState('');
  const [newVolTelefone, setNewVolTelefone] = useState('');

  // Edit Volunteer state
  const [editingVol, setEditingVol] = useState<VoluntarioItem | null>(null);

  // New Category state
  const [newCatNome, setNewCatNome] = useState('');

  // Edit Category state
  const [editingCat, setEditingCat] = useState<CategoriaItem | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Submit New Volunteer
  const handleCreateVoluntario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVolNome.trim()) return;

    if (voluntarios.some(v => v.nome.trim().toLowerCase() === newVolNome.trim().toLowerCase())) {
      alert('Já existe um voluntário com este nome cadastrado.');
      return;
    }

    onAddVoluntario({
      nome: newVolNome.trim(),
      telefone: newVolTelefone.trim() || undefined,
      ativo: true
    });

    setNewVolNome('');
    setNewVolTelefone('');
    showToast(`Voluntário(a) "${newVolNome.trim()}" cadastrado com sucesso!`);
  };

  // Submit Edit Volunteer
  const handleSaveEditVoluntario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVol || !editingVol.nome.trim()) return;

    onUpdateVoluntario(editingVol);
    setEditingVol(null);
    showToast(`Voluntário atualizado com sucesso!`);
  };

  // Submit New Category
  const handleCreateCategoria = (e: React.FormEvent, tipo: CategoriaItem['tipo']) => {
    e.preventDefault();
    if (!newCatNome.trim()) return;

    if (categorias.some(c => c.tipo === tipo && c.nome.trim().toLowerCase() === newCatNome.trim().toLowerCase())) {
      alert('Esta categoria já existe.');
      return;
    }

    onAddCategoria({
      nome: newCatNome.trim(),
      tipo
    });

    setNewCatNome('');
    showToast(`Categoria adicionada com sucesso!`);
  };

  // Submit Edit Category
  const handleSaveEditCategoria = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCat || !editingCat.nome.trim()) return;

    onUpdateCategoria(editingCat);
    setEditingCat(null);
    showToast(`Categoria atualizada com sucesso!`);
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-12">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 sm:top-auto sm:bottom-5 sm:right-5 sm:left-auto sm:translate-x-0 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs sm:text-sm font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-plum-50 text-plum-900 text-[11px] font-bold border border-plum-200">
              <FolderTree className="w-3.5 h-3.5 text-plum-700" />
              <span>Painel do Administrador • Cadastros Auxiliares</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Cadastros de Categorias & Voluntários
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Gerencie a lista de voluntários para captação e as categorias de despesas, entradas e formas de pagamento.
            </p>
          </div>
        </div>

        {/* Abas Superiores de Navegação */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 border-t border-slate-100">
          <button
            onClick={() => setActiveTab('voluntarios')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'voluntarios'
                ? 'bg-plum-700 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Voluntários ({voluntarios.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('saida')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'saida'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
            <span>Despesas / Saídas ({categorias.filter(c => c.tipo === 'saida').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('entrada')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'entrada'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-teal-500" />
            <span>Entradas / Receitas ({categorias.filter(c => c.tipo === 'entrada').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('pagamento')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'pagamento'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-indigo-500" />
            <span>Formas de Pagamento ({categorias.filter(c => c.tipo === 'forma_pagamento').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('cotas')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'cotas'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>Cotas de Patrocínio ({categorias.filter(c => c.tipo === 'patrocinio_cota').length})</span>
          </button>
        </div>
      </div>

      {/* ===================== ABA 1: VOLUNTÁRIOS ===================== */}
      {activeTab === 'voluntarios' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Formulário de Adicionar Voluntário */}
          <div className="md:col-span-1 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3 h-fit">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Cadastrar Novo Voluntário</span>
            </h2>
            <p className="text-xs text-slate-500">
              Os voluntários cadastrados aqui aparecem automaticamente na seleção ao cadastrar novos patrocinadores.
            </p>

            <form onSubmit={handleCreateVoluntario} className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nome do Voluntário *
                </label>
                <input
                  type="text"
                  required
                  value={newVolNome}
                  onChange={(e) => setNewVolNome(e.target.value)}
                  placeholder="Ex: Carlos Santos"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Telefone / WhatsApp
                </label>
                <input
                  type="text"
                  value={newVolTelefone}
                  onChange={(e) => setNewVolTelefone(e.target.value)}
                  placeholder="(98) 98000-0000"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-plum-700 hover:bg-plum-800 text-white font-bold text-xs sm:text-sm shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-solar-400" />
                <span>Adicionar Voluntário</span>
              </button>
            </form>
          </div>

          {/* Lista de Voluntários Cadastrados */}
          <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-700" />
                <span>Voluntários da Captação ({voluntarios.length})</span>
              </h2>
              <span className="text-xs text-slate-400">Total de parceiros vinculados</span>
            </div>

            <div className="space-y-2.5">
              {voluntarios.map((vol) => {
                const countSponsors = data.patrocinadores.filter(s => s.voluntario?.trim().toLowerCase() === vol.nome.trim().toLowerCase()).length;
                const totalValor = data.patrocinadores
                  .filter(s => s.voluntario?.trim().toLowerCase() === vol.nome.trim().toLowerCase())
                  .reduce((acc, s) => acc + s.valor_cota, 0);

                if (editingVol?.id === vol.id) {
                  return (
                    <form 
                      key={vol.id} 
                      onSubmit={handleSaveEditVoluntario}
                      className="p-3 bg-emerald-50/50 border border-emerald-300 rounded-xl flex flex-col sm:flex-row items-center gap-2"
                    >
                      <input
                        type="text"
                        required
                        value={editingVol.nome}
                        onChange={(e) => setEditingVol({ ...editingVol, nome: e.target.value })}
                        className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                      />
                      <input
                        type="text"
                        value={editingVol.telefone || ''}
                        onChange={(e) => setEditingVol({ ...editingVol, telefone: e.target.value })}
                        placeholder="Telefone"
                        className="w-full sm:w-36 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                      <div className="flex items-center gap-1 w-full sm:w-auto justify-end">
                        <button
                          type="submit"
                          className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                          title="Salvar"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingVol(null)}
                          className="p-1.5 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 cursor-pointer"
                          title="Cancelar"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </form>
                  );
                }

                return (
                  <div
                    key={vol.id}
                    className="p-3 bg-slate-50/80 hover:bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0">
                        {vol.nome.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{vol.nome}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-emerald-800 border border-emerald-200">
                            {countSponsors} {countSponsors === 1 ? 'patrocínio' : 'patrocínios'}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          {vol.telefone ? (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {vol.telefone}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Sem telefone</span>
                          )}
                          {totalValor > 0 && (
                            <span className="text-emerald-700 font-semibold">
                              • R$ {totalValor.toFixed(2)} captado
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingVol(vol)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white rounded-lg transition cursor-pointer"
                        title="Editar voluntário"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Deseja remover o voluntário "${vol.nome}"?`)) {
                            onDeleteVoluntario(vol.id);
                            showToast(`Voluntário removido.`);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Excluir voluntário"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ===================== ABA 2 a 5: CATEGORIAS GENÉRICAS ===================== */}
      {activeTab !== 'voluntarios' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Form Adicionar Categoria */}
          <div className="md:col-span-1 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3 h-fit">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Plus className="w-4 h-4 text-emerald-600" />
              <span>
                Nova Categoria: {
                  activeTab === 'saida' ? 'Despesa' : 
                  activeTab === 'entrada' ? 'Receita' : 
                  activeTab === 'pagamento' ? 'Forma de Pagamento' : 'Cota de Patrocínio'
                }
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Esta categoria estará disponível instantaneamente em todos os formulários e filtros de relatórios.
            </p>

            <form onSubmit={(e) => handleCreateCategoria(e, activeTab === 'pagamento' ? 'forma_pagamento' : activeTab === 'cotas' ? 'patrocinio_cota' : activeTab)} className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nome da Categoria *
                </label>
                <input
                  type="text"
                  required
                  value={newCatNome}
                  onChange={(e) => setNewCatNome(e.target.value)}
                  placeholder={
                    activeTab === 'saida' ? 'Ex: Combustível / Transporte' :
                    activeTab === 'entrada' ? 'Ex: Bazar Beneficente' :
                    activeTab === 'pagamento' ? 'Ex: Cartão de Débito' : 'Ex: Cota Especial (R$ 2.000)'
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-plum-700 hover:bg-plum-800 text-white font-bold text-xs sm:text-sm shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-solar-400" />
                <span>Cadastrar Categoria</span>
              </button>
            </form>
          </div>

          {/* Lista de Categorias Ativas do Tipo Selecionado */}
          <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-slate-700" />
                <span>
                  Categorias Cadastradas ({categorias.filter(c => c.tipo === (activeTab === 'pagamento' ? 'forma_pagamento' : activeTab === 'cotas' ? 'patrocinio_cota' : activeTab)).length})
                </span>
              </h2>
              <span className="text-xs text-slate-400">Clique no ícone de lápis para renomear</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {categorias
                .filter(c => c.tipo === (activeTab === 'pagamento' ? 'forma_pagamento' : activeTab === 'cotas' ? 'patrocinio_cota' : activeTab))
                .map((cat) => {
                  if (editingCat?.id === cat.id) {
                    return (
                      <form
                        key={cat.id}
                        onSubmit={handleSaveEditCategoria}
                        className="p-2.5 bg-emerald-50/50 border border-emerald-300 rounded-xl flex items-center gap-1.5"
                      >
                        <input
                          type="text"
                          required
                          value={editingCat.nome}
                          onChange={(e) => setEditingCat({ ...editingCat, nome: e.target.value })}
                          className="flex-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                        />
                        <button
                          type="submit"
                          className="p-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCat(null)}
                          className="p-1 rounded-md bg-slate-200 text-slate-700 hover:bg-slate-300 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    );
                  }

                  return (
                    <div
                      key={cat.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2"
                    >
                      <span className="font-bold text-xs sm:text-sm text-slate-800 truncate">
                        {cat.nome}
                      </span>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => setEditingCat(cat)}
                          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-white rounded-md transition cursor-pointer"
                          title="Renomear"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Deseja remover a categoria "${cat.nome}"?`)) {
                              onDeleteCategoria(cat.id);
                              showToast('Categoria removida.');
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
