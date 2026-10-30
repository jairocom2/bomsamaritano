import React from 'react';
import { 
  Building2, 
  DollarSign, 
  LayoutDashboard, 
  FileSpreadsheet,
  FileText,
  RotateCcw,
  Camera,
  Trophy,
  Users,
  LogOut,
  FolderTree
} from 'lucide-react';
import { Usuario, UserRole } from '../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  totalCaixa: number;
  pendingVideos: number;
  pendingLogos: number;
  onResetData: () => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  currentUser: Usuario | null;
  onLogout: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  mobileLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  totalCaixa,
  pendingVideos,
  onResetData,
  userRole,
  currentUser,
  onLogout,
}) => {
  // Tabs solicitadas na versão Desktop (Sidebar) e Mobile:
  // 1. Visão Geral
  // 2. Patrocinadores
  // 3. Finanças(entrada/saída)
  // 4. Voluntário Ranking
  // 5. Relatórios & prestação
  // 6. Cadastros (Categorias e Voluntários)
  // 7. Usuário & Permissões
  // 8. Planilhas e Backup
  const adminMenuItems: MenuItem[] = [
    { 
      id: 'overview', 
      label: 'Visão Geral', 
      mobileLabel: 'Geral',
      icon: LayoutDashboard 
    },
    { 
      id: 'sponsors', 
      label: 'Patrocinadores', 
      mobileLabel: 'Parceiros',
      icon: Building2, 
      badge: pendingVideos > 0 ? `${pendingVideos}` : undefined 
    },
    { 
      id: 'finance', 
      label: 'Finanças(entrada/saída)', 
      mobileLabel: 'Finanças',
      icon: DollarSign 
    },
    { 
      id: 'volunteers', 
      label: 'Voluntário Ranking', 
      mobileLabel: 'Ranking',
      icon: Trophy 
    },
    { 
      id: 'reports', 
      label: 'Relatórios & prestação', 
      mobileLabel: 'Relatórios',
      icon: FileText 
    },
    { 
      id: 'categories', 
      label: 'Cadastros (Categorias e Voluntários)', 
      mobileLabel: 'Cadastros',
      icon: FolderTree 
    },
    { 
      id: 'users', 
      label: 'Usuário & Permissões', 
      mobileLabel: 'Acessos',
      icon: Users 
    },
    { 
      id: 'backup', 
      label: 'Planilhas e Backup', 
      mobileLabel: 'Backup',
      icon: FileSpreadsheet 
    },
  ];

  // Tabs para o perfil Voluntário
  const volunteerMenuItems: MenuItem[] = [
    { 
      id: 'volunteers', 
      label: 'Voluntário Ranking', 
      mobileLabel: 'Ranking',
      icon: Trophy 
    },
    { 
      id: 'sponsors', 
      label: 'Patrocinadores', 
      mobileLabel: 'Parceiros',
      icon: Building2 
    },
    { 
      id: 'reports', 
      label: 'Relatórios & prestação', 
      mobileLabel: 'Relatórios',
      icon: FileText 
    },
  ];

  // Tabs para Videomaker
  const videomakerMenuItems: MenuItem[] = [
    {
      id: 'videomaker',
      label: 'Gravação de Vídeos & Logos',
      mobileLabel: 'Vídeos',
      icon: Camera,
      badge: pendingVideos > 0 ? `${pendingVideos}` : undefined
    }
  ];

  const currentMenuItems = 
    userRole === 'admin' 
      ? adminMenuItems 
      : userRole === 'videomaker' 
        ? videomakerMenuItems 
        : volunteerMenuItems;

  return (
    <>
      {/* =========================================================================
          DESKTOP SIDEBAR (Aparece apenas em telas médias e grandes: md:flex)
          Utiliza a paleta de cores oficial da logo (Plum #653052 e Laranja Solar #f58a34)
          ========================================================================= */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 h-screen sticky top-0 bg-white border-r border-slate-200/90 z-30 shrink-0 select-none shadow-2xs">
        {/* Sidebar Brand Header com a Logo Oficial */}
        <div className="p-4 border-b border-slate-100 flex flex-col items-center justify-center bg-gradient-to-b from-plum-50/60 to-white">
          <img 
            src="/assets/aistudio/BOM_SAMARITANO_-_LOGO_5027b56d.png" 
            alt="Projeto Bom Samaritano" 
            className="h-16 w-auto object-contain drop-shadow-2xs"
          />
          <div className="text-center mt-1.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-solar-600 block">
              {userRole === 'videomaker' ? 'Painel do Videomaker' : 'Gestão & Patrocínios'}
            </span>
          </div>
        </div>

        {/* Saldo Líquido em Caixa (Visível para o Administrador) */}
        {userRole === 'admin' && (
          <div className="px-3.5 pt-3.5 pb-1">
            <div className="bg-plum-50/50 border border-plum-100 rounded-2xl p-3">
              <span className="text-[10px] uppercase font-bold text-plum-900/60 tracking-wider block">
                Saldo Líquido em Caixa
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className={`text-lg lg:text-xl font-black tracking-tight ${totalCaixa >= 0 ? 'text-plum-800' : 'text-rose-600'}`}>
                  R$ {totalCaixa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] font-bold text-solar-700 bg-solar-50 px-2 py-0.5 rounded-md border border-solar-200/80">
                  2025/2026
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Sidebar Navigation Items List */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Navegação
          </p>
          {currentMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs lg:text-sm rounded-xl transition duration-150 cursor-pointer text-left ${
                  isActive
                    ? 'bg-plum-700 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-plum-900 hover:bg-plum-50/70 font-semibold'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-solar-400' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-black shrink-0 ${
                    isActive ? 'bg-solar-500 text-white' : 'bg-solar-100 text-solar-800 border border-solar-200'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer: User Profile & Actions */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          {currentUser && (
            <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-plum-100 border border-plum-200 text-plum-800 flex items-center justify-center font-black text-xs shrink-0">
                  {currentUser.nome.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-800 truncate block leading-tight">
                    {currentUser.nome}
                  </span>
                  <span className="text-[10px] text-solar-700 font-semibold capitalize block truncate">
                    {currentUser.papel === 'admin' ? 'Administrador' : currentUser.papel === 'videomaker' ? 'Videomaker' : 'Voluntário'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {userRole === 'admin' && (
                  <button
                    onClick={onResetData}
                    title="Restaurar backup original"
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={onLogout}
                  title="Sair da conta"
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* =========================================================================
          MOBILE TOP HEADER (Permanece para telas de smartphone: md:hidden)
          Com logo oficial e paleta da identidade visual
          ========================================================================= */}
      <header className="md:hidden bg-white border-b border-slate-200/90 sticky top-0 z-30 shadow-2xs print:hidden">
        <div className="px-3.5 py-2 flex items-center justify-between">
          {/* Logo Oficial & Brand Mobile */}
          <div className="flex items-center gap-2">
            <img 
              src="/assets/aistudio/BOM_SAMARITANO_-_LOGO_5027b56d.png" 
              alt="Projeto Bom Samaritano" 
              className="h-9 w-auto object-contain"
            />
            <div>
              <span className="font-extrabold text-xs tracking-tight text-plum-950 block leading-tight">
                Bom Samaritano
              </span>
              <span className="text-[9px] text-solar-600 font-bold uppercase tracking-wider block">
                {userRole === 'videomaker' ? 'Videomaker' : 'Gestão & Patrocínios'}
              </span>
            </div>
          </div>

          {/* User profile & actions on Mobile */}
          <div className="flex items-center gap-2">
            {userRole === 'admin' && (
              <div className="bg-plum-50 border border-plum-100 px-2 py-0.5 rounded-lg text-right">
                <span className="text-[9px] uppercase font-bold text-plum-700/70 block leading-none">Saldo</span>
                <span className={`text-[11px] font-black ${totalCaixa >= 0 ? 'text-plum-800' : 'text-rose-600'}`}>
                  R$ {totalCaixa >= 1000 ? `${(totalCaixa / 1000).toFixed(1)}k` : totalCaixa.toFixed(0)}
                </span>
              </div>
            )}

            {currentUser && (
              <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-200">
                <div className="w-7 h-7 rounded-lg bg-plum-100 border border-plum-200 flex items-center justify-center font-bold text-xs text-plum-800 shrink-0">
                  {currentUser.nome.charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={onLogout}
                  title="Sair da conta"
                  className="p-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-600 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* =========================================================================
          MOBILE BOTTOM BAR (Permanece para smartphone: md:hidden)
          Com as cores da paleta da logo
          ========================================================================= */}
      {userRole === 'admin' && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-1.5 py-1.5 flex items-center gap-1 overflow-x-auto md:hidden print:hidden scrollbar-none">
          {adminMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition cursor-pointer shrink-0 relative min-w-[58px] ${
                  isActive 
                    ? 'text-plum-800 font-bold bg-plum-50' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${
                    isActive 
                      ? 'text-plum-700 stroke-[2.5]' 
                      : 'text-slate-400'
                  }`} />
                  {item.badge && (
                    <span className="absolute -top-1 -right-2.5 bg-solar-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-xs">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[64px]">
                  {item.mobileLabel}
                </span>
              </button>
            );
          })}
        </nav>
      )}

      {(userRole === 'voluntario' || userRole === 'comum') && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-2 py-1.5 flex items-center justify-around md:hidden print:hidden">
          {volunteerMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition cursor-pointer relative ${
                  isActive 
                    ? 'text-plum-800 font-bold bg-plum-50' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Icon className={`w-5 h-5 ${
                  isActive 
                    ? 'text-plum-700 stroke-[2.5]' 
                    : 'text-slate-400'
                }`} />
                <span className="text-[10px] mt-0.5 tracking-tight">{item.mobileLabel}</span>
              </button>
            );
          })}
        </nav>
      )}
    </>
  );
};
