import React, { useState } from 'react';
import { 
  ShieldCheck, 
  UserPlus, 
  Users, 
  Key, 
  Trash2, 
  Check, 
  Camera, 
  Trophy, 
  User, 
  CheckCircle2, 
  AlertCircle,
  Lock,
  Phone,
  Mail,
  Edit2,
  X
} from 'lucide-react';
import { Usuario, UserRole } from '../types';

interface UsersManagementViewProps {
  users: Usuario[];
  currentUser: Usuario;
  onUpdateUser: (updatedUser: Usuario) => void;
  onAddUser: (newUser: Omit<Usuario, 'id'>) => Usuario;
  onDeleteUser: (userId: number) => void;
}

export const UsersManagementView: React.FC<UsersManagementViewProps> = ({
  users,
  currentUser,
  onUpdateUser,
  onAddUser,
  onDeleteUser,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPasswordUserId, setEditingPasswordUserId] = useState<number | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New user form state
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('123456');
  const [newUserRole, setNewUserRole] = useState<UserRole>('voluntario');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRoleChange = (userId: number, newRole: UserRole) => {
    const userToEdit = users.find(u => u.id === userId);
    if (!userToEdit) return;

    if (userId === currentUser.id && newRole !== 'admin') {
      if (!window.confirm('Atenção: Você está alterando o seu próprio papel de administrador. Tem certeza?')) {
        return;
      }
    }

    onUpdateUser({
      ...userToEdit,
      papel: newRole
    });

    showToast(`Permissão de "${userToEdit.nome}" atualizada para ${getRoleLabel(newRole)}!`);
  };

  const handleToggleStatus = (userId: number) => {
    const userToEdit = users.find(u => u.id === userId);
    if (!userToEdit) return;

    if (userId === currentUser.id) {
      alert('Você não pode desativar o seu próprio usuário de administrador conectado.');
      return;
    }

    const updated = {
      ...userToEdit,
      ativo: userToEdit.ativo === false ? true : false
    };

    onUpdateUser(updated);
    showToast(`Usuário "${userToEdit.nome}" ${updated.ativo ? 'ativado' : 'desativado'}.`);
  };

  const handleSaveNewPassword = (userId: number) => {
    if (!newPasswordInput || newPasswordInput.length < 4) {
      alert('A nova senha deve ter no mínimo 4 caracteres.');
      return;
    }

    const userToEdit = users.find(u => u.id === userId);
    if (!userToEdit) return;

    onUpdateUser({
      ...userToEdit,
      senha: newPasswordInput
    });

    setEditingPasswordUserId(null);
    setNewPasswordInput('');
    showToast(`Senha de "${userToEdit.nome}" alterada com sucesso!`);
  };

  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim()) {
      alert('Preencha os campos obrigatórios.');
      return;
    }

    const emailNorm = newUserEmail.trim().toLowerCase();
    if (users.some(u => u.email.toLowerCase() === emailNorm)) {
      alert('Este e-mail já está cadastrado.');
      return;
    }

    onAddUser({
      nome: newUserName.trim(),
      email: emailNorm,
      telefone: newUserPhone.trim(),
      senha: newUserPassword,
      papel: newUserRole,
      ativo: true,
      criadoEm: new Date().toISOString().split('T')[0]
    });

    setShowAddModal(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPhone('');
    setNewUserPassword('123456');
    setNewUserRole('voluntario');
    showToast('Novo usuário cadastrado com sucesso!');
  };

  const handleDelete = (userId: number, userName: string) => {
    if (userId === currentUser.id) {
      alert('Você não pode excluir o usuário com o qual está conectado agora.');
      return;
    }

    if (window.confirm(`Tem certeza que deseja remover o usuário "${userName}"?`)) {
      onDeleteUser(userId);
      showToast(`Usuário "${userName}" removido.`);
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'Administrador Geral';
      case 'videomaker':
        return 'Videomaker (Audiovisual)';
      case 'voluntario':
        return 'Voluntário / Captação';
      default:
        return 'Colaborador';
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <ShieldCheck className="w-3 h-3 text-amber-600" />
            <span>Admin</span>
          </span>
        );
      case 'videomaker':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
            <Camera className="w-3 h-3 text-teal-600" />
            <span>Videomaker</span>
          </span>
        );
      case 'voluntario':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Trophy className="w-3 h-3 text-emerald-600" />
            <span>Voluntário</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <User className="w-3 h-3 text-slate-500" />
            <span>Colaborador</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-12">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 sm:top-auto sm:bottom-5 sm:right-5 sm:left-auto sm:translate-x-0 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs sm:text-sm font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-plum-50 text-plum-900 text-[11px] font-bold border border-plum-200">
              <ShieldCheck className="w-3.5 h-3.5 text-plum-700" />
              <span>Controle de Acessos & Permissões</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Gestão de Usuários & Níveis de Acesso
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Gerencie quem pode acessar o sistema e defina o papel de cada colaborador.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-plum-700 hover:bg-plum-800 text-white font-bold text-xs sm:text-sm shadow-xs transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-solar-400" />
            <span>Novo Usuário</span>
          </button>
        </div>

        {/* Resumo de Usuários e Permissões */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-slate-100">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total de Usuários</span>
            <span className="text-lg font-extrabold text-slate-900 mt-0.5 block">{users.length} cadastrados</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Administradores</span>
            <span className="text-lg font-extrabold text-amber-700 mt-0.5 block">
              {users.filter(u => u.papel === 'admin').length} com acesso total
            </span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Videomakers</span>
            <span className="text-lg font-extrabold text-teal-700 mt-0.5 block">
              {users.filter(u => u.papel === 'videomaker').length} equipe de vídeo
            </span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Voluntários</span>
            <span className="text-lg font-extrabold text-emerald-700 mt-0.5 block">
              {users.filter(u => u.papel === 'voluntario' || u.papel === 'comum').length} captadores
            </span>
          </div>
        </div>
      </div>

      {/* Tabela e Cards de Usuários */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <span>Lista de Usuários Cadastrados</span>
          </h2>
          <span className="text-xs text-slate-400">Clique para alterar permissões e senhas</span>
        </div>

        {/* Lista Responsiva de Usuários */}
        <div className="space-y-3">
          {users.map((user) => {
            const isSelf = user.id === currentUser.id;
            const isEditingPassword = editingPasswordUserId === user.id;

            return (
              <div 
                key={user.id}
                className={`p-4 rounded-2xl border transition ${
                  user.ativo === false 
                    ? 'bg-slate-50/50 border-slate-200 opacity-60' 
                    : isSelf
                    ? 'bg-emerald-50/20 border-emerald-200'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Dados do Usuário */}
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 shrink-0">
                      {user.nome.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                          {user.nome}
                        </span>
                        {isSelf && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Você
                          </span>
                        )}
                        {getRoleBadge(user.papel)}
                        {user.ativo === false && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                            Inativo
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-500 flex items-center gap-3 mt-1 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {user.email}
                        </span>
                        {user.telefone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {user.telefone}
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400">
                          Senha: <strong className="font-mono text-slate-600">{user.senha || 'admin123'}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Controle de Permissão & Ações */}
                  <div className="flex items-center gap-2 flex-wrap sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    {/* Seletor de Permissão Rápida */}
                    <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
                      <label className="text-[10px] font-bold text-slate-500 px-1.5 uppercase">
                        Nível:
                      </label>
                      <select
                        value={user.papel}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                        className="text-xs font-bold bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                      >
                        <option value="admin">Administrador (Total)</option>
                        <option value="videomaker">Videomaker (Vídeos & Logos)</option>
                        <option value="voluntario">Voluntário (Captação)</option>
                        <option value="comum">Colaborador Geral</option>
                      </select>
                    </div>

                    {/* Botão Redefinir Senha */}
                    <button
                      onClick={() => {
                        if (isEditingPassword) {
                          setEditingPasswordUserId(null);
                        } else {
                          setEditingPasswordUserId(user.id);
                          setNewPasswordInput(user.senha || 'admin123');
                        }
                      }}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                      title="Redefinir senha deste usuário"
                    >
                      <Key className="w-3.5 h-3.5 text-amber-600" />
                      <span>{isEditingPassword ? 'Fechar' : 'Senha'}</span>
                    </button>

                    {/* Botão Ativar / Desativar */}
                    {!isSelf && (
                      <button
                        onClick={() => handleToggleStatus(user.id)}
                        className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                          user.ativo === false
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {user.ativo === false ? 'Reativar' : 'Desativar'}
                      </button>
                    )}

                    {/* Botão Excluir */}
                    {!isSelf && (
                      <button
                        onClick={() => handleDelete(user.id, user.nome)}
                        className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition cursor-pointer"
                        title="Remover usuário"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Área de Redefinição de Senha Aberta */}
                {isEditingPassword && (
                  <div className="mt-3 pt-3 border-t border-slate-200/80 bg-slate-50/70 p-3 rounded-xl flex flex-col sm:flex-row items-center gap-2">
                    <span className="text-xs font-bold text-slate-700 whitespace-nowrap">
                      Nova senha para {user.nome}:
                    </span>
                    <input
                      type="text"
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      placeholder="Digite a nova senha"
                      className="w-full sm:w-48 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      onClick={() => handleSaveNewPassword(user.id)}
                      className="w-full sm:w-auto px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Salvar Senha</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL ADICIONAR NOVO USUÁRIO */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Cadastrar Novo Usuário</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="ex: Carlos Alberto"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">E-mail de Login *</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="ex: carlos@bonsamaritano.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    placeholder="(98) 98000-0000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Senha Inicial *</label>
                  <input
                    type="text"
                    required
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="Mínimo 4 caracteres"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nível de Permissão *</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="voluntario">Voluntário / Captador de Patrocínios</option>
                  <option value="videomaker">Videomaker / Equipe de Gravação</option>
                  <option value="admin">Administrador Geral (Acesso Total)</option>
                  <option value="comum">Colaborador Geral</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-plum-700 hover:bg-plum-800 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-solar-400" />
                  <span>Cadastrar Usuário</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
