import React, { useState, useEffect } from 'react';
import { initialBackupData } from './data/initialData';
import { BackupData, Patrocinador, TransacaoFinanceira, Usuario, UserRole, VoluntarioItem, CategoriaItem } from './types';
import { Navbar } from './components/Navbar';
import { SponsorsView } from './components/SponsorsView';
import { FinanceView } from './components/FinanceView';
import { OverviewView } from './components/OverviewView';
import { BackupDataTab } from './components/BackupDataTab';
import { VideomakerView } from './components/VideomakerView';
import { ReportsView } from './components/ReportsView';
import { VolunteersView } from './components/VolunteersView';
import { UsersManagementView } from './components/UsersManagementView';
import { CategoriesManagementView } from './components/CategoriesManagementView';
import { AuthView } from './components/AuthView';
import { HeartHandshake, CheckCircle } from 'lucide-react';

const STORAGE_KEY = 'bom_samaritano_gestao_v4';
const USER_STORAGE_KEY = 'bom_samaritano_current_user_v1';

export default function App() {
  const [data, setData] = useState<BackupData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Garantir que users possua a estrutura correta com senhas
        if (!parsed.users || parsed.users.length === 0 || !parsed.users.some((u: Usuario) => u.papel === 'admin' && u.senha)) {
          parsed.users = initialBackupData.users;
        }
        if (!parsed.voluntarios || parsed.voluntarios.length === 0) {
          parsed.voluntarios = initialBackupData.voluntarios;
        }
        if (!parsed.categorias || parsed.categorias.length === 0) {
          parsed.categorias = initialBackupData.categorias;
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Could not read from localStorage', e);
    }
    return initialBackupData;
  });

  // Usuário autenticado atualmente
  const [currentUser, setCurrentUser] = useState<Usuario | null>(() => {
    try {
      const savedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (savedUser) {
        return JSON.parse(savedUser);
      }
    } catch (e) {
      console.warn('Could not read user from localStorage', e);
    }
    return null;
  });

  const [currentTab, setCurrentTab] = useState<string>(() => {
    if (currentUser?.papel === 'videomaker') return 'videomaker';
    if (currentUser?.papel === 'voluntario') return 'volunteers';
    return 'overview';
  });

  const [userRole, setUserRole] = useState<UserRole>(currentUser?.papel || 'admin');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
  }, [data]);

  // Sync current user with localStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    } catch (e) {
      console.warn('Could not sync user to localStorage', e);
    }
  }, [currentUser]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Auth Handlers
  const handleLoginSuccess = (user: Usuario) => {
    setCurrentUser(user);
    setUserRole(user.papel);
    if (user.papel === 'videomaker') {
      setCurrentTab('videomaker');
    } else if (user.papel === 'voluntario' || user.papel === 'comum') {
      setCurrentTab('volunteers');
    } else {
      setCurrentTab('sponsors');
    }
    showToast(`Bem-vindo(a), ${user.nome}!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    showToast('Sessão encerrada com sucesso.');
  };

  const handleRegisterUser = (newUser: Omit<Usuario, 'id'>): Usuario => {
    const id = data.users.length > 0 ? Math.max(...data.users.map(u => u.id)) + 1 : 1;
    const user: Usuario = { ...newUser, id };
    setData(prev => ({
      ...prev,
      users: [...prev.users, user]
    }));
    return user;
  };

  const handleResetPassword = (email: string, novaSenha: string): boolean => {
    const userExists = data.users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (!userExists) return false;

    setData(prev => ({
      ...prev,
      users: prev.users.map(u => u.email.toLowerCase() === email.toLowerCase() ? { ...u, senha: novaSenha } : u)
    }));

    if (currentUser && currentUser.email.toLowerCase() === email.toLowerCase()) {
      setCurrentUser(prev => prev ? { ...prev, senha: novaSenha } : null);
    }
    return true;
  };

  // User Management Handlers (Admin)
  const handleUpdateUser = (updatedUser: Usuario) => {
    setData(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === updatedUser.id ? updatedUser : u)
    }));

    if (currentUser?.id === updatedUser.id) {
      setCurrentUser(updatedUser);
      setUserRole(updatedUser.papel);
    }
  };

  const handleAddUser = (newUserData: Omit<Usuario, 'id'>): Usuario => {
    const id = data.users.length > 0 ? Math.max(...data.users.map(u => u.id)) + 1 : 1;
    const created: Usuario = { ...newUserData, id };
    setData(prev => ({
      ...prev,
      users: [...prev.users, created]
    }));
    return created;
  };

  const handleDeleteUser = (userId: number) => {
    setData(prev => ({
      ...prev,
      users: prev.users.filter(u => u.id !== userId)
    }));
  };

  // Voluntários Handlers
  const handleAddVoluntario = (newVol: Omit<VoluntarioItem, 'id'>) => {
    const list = data.voluntarios || initialBackupData.voluntarios || [];
    const id = list.length > 0 ? Math.max(...list.map(v => v.id)) + 1 : 1;
    const item: VoluntarioItem = { ...newVol, id };
    setData(prev => ({
      ...prev,
      voluntarios: [...(prev.voluntarios || initialBackupData.voluntarios || []), item]
    }));
    showToast(`Voluntário(a) "${item.nome}" cadastrado!`);
  };

  const handleUpdateVoluntario = (updatedVol: VoluntarioItem) => {
    setData(prev => ({
      ...prev,
      voluntarios: (prev.voluntarios || initialBackupData.voluntarios || []).map(v => v.id === updatedVol.id ? updatedVol : v)
    }));
  };

  const handleDeleteVoluntario = (id: number) => {
    setData(prev => ({
      ...prev,
      voluntarios: (prev.voluntarios || initialBackupData.voluntarios || []).filter(v => v.id !== id)
    }));
  };

  // Categorias Handlers
  const handleAddCategoria = (newCat: Omit<CategoriaItem, 'id'>) => {
    const list = data.categorias || initialBackupData.categorias || [];
    const id = list.length > 0 ? Math.max(...list.map(c => c.id)) + 1 : 1;
    const item: CategoriaItem = { ...newCat, id };
    setData(prev => ({
      ...prev,
      categorias: [...(prev.categorias || initialBackupData.categorias || []), item]
    }));
    showToast(`Categoria "${item.nome}" adicionada!`);
  };

  const handleUpdateCategoria = (updatedCat: CategoriaItem) => {
    setData(prev => ({
      ...prev,
      categorias: (prev.categorias || initialBackupData.categorias || []).map(c => c.id === updatedCat.id ? updatedCat : c)
    }));
  };

  const handleDeleteCategoria = (id: number) => {
    setData(prev => ({
      ...prev,
      categorias: (prev.categorias || initialBackupData.categorias || []).filter(c => c.id !== id)
    }));
  };

  // Sponsor Handlers
  const handleAddSponsor = (newSp: Omit<Patrocinador, 'id'>) => {
    const id = data.patrocinadores.length > 0 ? Math.max(...data.patrocinadores.map(s => s.id)) + 1 : 1;
    const sponsor: Patrocinador = { ...newSp, id };
    setData(prev => ({
      ...prev,
      patrocinadores: [...prev.patrocinadores, sponsor],
      financeiro: sponsor.status === 'Recebido' ? [
        ...prev.financeiro,
        {
          id: Math.max(...prev.financeiro.map(f => f.id), 0) + 1,
          tipo: 'Entrada',
          categoria: 'Patrocínio',
          descricao: sponsor.nome,
          data: sponsor.data,
          valor: sponsor.valor_cota,
          origem: 'Patrocínio',
          status: 'Pago'
        }
      ] : prev.financeiro
    }));
    showToast(`Patrocinador "${sponsor.nome}" adicionado!`);
  };

  const handleUpdateSponsor = (updated: Patrocinador) => {
    setData(prev => ({
      ...prev,
      patrocinadores: prev.patrocinadores.map(s => s.id === updated.id ? updated : s)
    }));
  };

  const handleDeleteSponsor = (id: number) => {
    setData(prev => ({
      ...prev,
      patrocinadores: prev.patrocinadores.filter(s => s.id !== id)
    }));
    showToast('Patrocinador removido.');
  };

  // Finance Handlers
  const handleAddTransaction = (newTx: Omit<TransacaoFinanceira, 'id'>) => {
    const id = data.financeiro.length > 0 ? Math.max(...data.financeiro.map(f => f.id)) + 1 : 1;
    const tx: TransacaoFinanceira = { ...newTx, id };
    setData(prev => ({
      ...prev,
      financeiro: [...prev.financeiro, tx]
    }));
    showToast(`Lançamento "${tx.descricao}" salvo!`);
  };

  const handleUpdateTransaction = (updated: TransacaoFinanceira) => {
    setData(prev => ({
      ...prev,
      financeiro: prev.financeiro.map(f => f.id === updated.id ? updated : f)
    }));
  };

  const handleDeleteTransaction = (id: number) => {
    setData(prev => ({
      ...prev,
      financeiro: prev.financeiro.filter(f => f.id !== id)
    }));
    showToast('Lançamento removido.');
  };

  // Reset to original backup
  const handleResetOriginal = () => {
    if (window.confirm('Deseja restaurar os dados originais do backup de 2025?')) {
      setData(initialBackupData);
      localStorage.removeItem(STORAGE_KEY);
      showToast('Dados restaurados para o original!');
    }
  };

  // Key Calculations
  const patrociniosRecebidos = data.patrocinadores
    .filter(p => p.status === 'Recebido')
    .reduce((acc, curr) => acc + curr.valor_cota, 0);

  const despesasPagas = data.financeiro
    .filter(f => f.tipo === 'Saída' && f.status === 'Pago')
    .reduce((acc, curr) => acc + curr.valor, 0);

  const totalCaixa = patrociniosRecebidos - despesasPagas;
  const pendingVideos = data.patrocinadores.filter(s => !s.video_gravado).length;
  const pendingLogos = data.patrocinadores.filter(s => !s.logo_enviada).length;

  // Se não estiver logado, exibe a tela de login/cadastro/recuperação de senha
  if (!currentUser) {
    return (
      <AuthView
        users={data.users}
        onLoginSuccess={handleLoginSuccess}
        onRegisterUser={handleRegisterUser}
        onResetPassword={handleResetPassword}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row font-sans">
      {/* Desktop Sidebar (md:flex) & Mobile Header/Bottom Bar (md:hidden) */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        totalCaixa={totalCaixa}
        pendingVideos={pendingVideos}
        pendingLogos={pendingLogos}
        onResetData={handleResetOriginal}
        userRole={userRole}
        setUserRole={setUserRole}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-8">
          {/* Videomaker Exclusive Screen */}
          {userRole === 'videomaker' && (
            <VideomakerView
              sponsors={data.patrocinadores}
              onUpdateSponsor={handleUpdateSponsor}
            />
          )}

          {/* Gerenciamento de Usuários e Permissões (Apenas Admin) */}
          {userRole === 'admin' && currentTab === 'users' && (
            <UsersManagementView
              users={data.users}
              currentUser={currentUser}
              onUpdateUser={handleUpdateUser}
              onAddUser={handleAddUser}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {/* Gerenciamento de Categorias & Voluntários (Apenas Admin) */}
          {userRole === 'admin' && currentTab === 'categories' && (
            <CategoriesManagementView
              voluntarios={data.voluntarios || []}
              categorias={data.categorias || []}
              data={data}
              onAddVoluntario={handleAddVoluntario}
              onUpdateVoluntario={handleUpdateVoluntario}
              onDeleteVoluntario={handleDeleteVoluntario}
              onAddCategoria={handleAddCategoria}
              onUpdateCategoria={handleUpdateCategoria}
              onDeleteCategoria={handleDeleteCategoria}
            />
          )}

          {/* Reports Screen */}
          {userRole !== 'videomaker' && currentTab === 'reports' && (
            <ReportsView data={data} />
          )}

          {/* Patrocinadores (Admin e Voluntários) */}
          {userRole !== 'videomaker' && currentTab === 'sponsors' && (
            <SponsorsView
              sponsors={data.patrocinadores}
              voluntarios={data.voluntarios || []}
              categorias={data.categorias || []}
              onAddSponsor={handleAddSponsor}
              onUpdateSponsor={handleUpdateSponsor}
              onDeleteSponsor={handleDeleteSponsor}
              onAddVoluntario={handleAddVoluntario}
              onAddCategoria={handleAddCategoria}
            />
          )}

          {/* Voluntários & Ranking (Admin e Voluntários) */}
          {userRole !== 'videomaker' && currentTab === 'volunteers' && (
            <VolunteersView
              sponsors={data.patrocinadores}
              onUpdateSponsor={handleUpdateSponsor}
            />
          )}

          {/* Finanças (Exclusivo Admin) */}
          {userRole === 'admin' && currentTab === 'finance' && (
            <FinanceView
              transactions={data.financeiro}
              categorias={data.categorias || []}
              onAddTransaction={handleAddTransaction}
              onUpdateTransaction={handleUpdateTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              onAddCategoria={handleAddCategoria}
            />
          )}

          {/* Visão Geral (Exclusivo Admin) */}
          {userRole === 'admin' && currentTab === 'overview' && (
            <OverviewView
              data={data}
              onNavigateTab={setCurrentTab}
              onUpdateSponsor={handleUpdateSponsor}
            />
          )}

          {/* Planilha & Backup (Exclusivo Admin) */}
          {userRole === 'admin' && currentTab === 'backup' && (
            <BackupDataTab
              data={data}
              onResetOriginal={handleResetOriginal}
              onLoadCustomData={(newData) => {
                setData(newData);
                showToast('Planilha carregada com sucesso!');
              }}
            />
          )}
        </main>

        {/* Footer discreto em telas desktop */}
        <footer className="hidden md:block border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500 print:hidden mt-auto">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
            <div className="flex items-center gap-2 font-medium text-slate-600">
              <img 
                src="/assets/aistudio/BOM_SAMARITANO_-_LOGO_5027b56d.png" 
                alt="Projeto Bom Samaritano" 
                className="h-6 w-auto object-contain"
              />
              <span className="font-extrabold text-plum-900">Projeto Bom Samaritano</span>
              <span className="text-solar-600 font-semibold">• Semeando amor e avivamento</span>
            </div>
            <p className="text-slate-400">
              Controle de Patrocinadores, Vídeos, Voluntários e Finanças
            </p>
          </div>
        </footer>
      </div>

      {/* Toast Notification Mobile-Friendly */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 sm:top-auto sm:bottom-5 sm:right-5 sm:left-auto sm:translate-x-0 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs sm:text-sm font-semibold animate-in fade-in slide-in-from-top-2 sm:slide-in-from-bottom-2 print:hidden">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
