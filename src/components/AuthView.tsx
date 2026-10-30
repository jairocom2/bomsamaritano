import React, { useState } from 'react';
import { 
  HeartHandshake, 
  Lock, 
  Mail, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  KeyRound, 
  ShieldCheck, 
  Camera, 
  Trophy,
  ArrowLeft
} from 'lucide-react';
import { Usuario, UserRole } from '../types';

interface AuthViewProps {
  users: Usuario[];
  onLoginSuccess: (user: Usuario) => void;
  onRegisterUser: (newUser: Omit<Usuario, 'id'>) => Usuario;
  onResetPassword: (email: string, novaSenha: string) => boolean;
}

export const AuthView: React.FC<AuthViewProps> = ({
  users,
  onLoginSuccess,
  onRegisterUser,
  onResetPassword,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('voluntario');

  // Forgot state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);

  // Feedback messages
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const clearMessages = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // Quick fill for testing
  const handleQuickLogin = (email: string, pass: string) => {
    setLoginEmail(email);
    setLoginPassword(pass);
    clearMessages();
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    const normalizedEmail = loginEmail.trim().toLowerCase();
    const user = users.find(u => 
      u.email.toLowerCase() === normalizedEmail || 
      (normalizedEmail === 'admin' && u.papel === 'admin')
    );

    if (!user) {
      setErrorMessage('Usuário ou e-mail não encontrado. Verifique os dados ou crie uma conta.');
      return;
    }

    if (user.ativo === false) {
      setErrorMessage('Esta conta foi desativada pelo Administrador. Entre em contato com a equipe.');
      return;
    }

    const effectivePassword = user.senha || 'admin123';
    if (loginPassword !== effectivePassword) {
      setErrorMessage('Senha incorreta. Tente novamente ou use a opção "Esqueci a senha".');
      return;
    }

    // Success
    onLoginSuccess(user);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setErrorMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (regPassword.length < 4) {
      setErrorMessage('A senha deve ter no mínimo 4 caracteres.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('A confirmação de senha não coincide com a senha digitada.');
      return;
    }

    const emailNormalized = regEmail.trim().toLowerCase();
    const alreadyExists = users.some(u => u.email.toLowerCase() === emailNormalized);
    if (alreadyExists) {
      setErrorMessage('Este e-mail já está cadastrado no sistema.');
      return;
    }

    const created = onRegisterUser({
      nome: regName.trim(),
      email: emailNormalized,
      senha: regPassword,
      papel: regRole,
      telefone: regPhone.trim(),
      ativo: true,
      criadoEm: new Date().toISOString().split('T')[0]
    });

    setSuccessMessage(`Conta criada com sucesso! Você já pode entrar com suas credenciais.`);
    setLoginEmail(created.email);
    setLoginPassword(regPassword);
    setMode('login');
  };

  const handleForgotCheckEmail = (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    const emailNorm = forgotEmail.trim().toLowerCase();
    const user = users.find(u => u.email.toLowerCase() === emailNorm);

    if (!user) {
      setErrorMessage('E-mail não localizado na base de usuários.');
      return;
    }

    setForgotStep(2);
    setSuccessMessage(`Identificamos a conta de "${user.nome}". Digite agora a nova senha desejada.`);
  };

  const handleForgotResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!forgotNewPassword || forgotNewPassword.length < 4) {
      setErrorMessage('A nova senha deve ter no mínimo 4 caracteres.');
      return;
    }

    const success = onResetPassword(forgotEmail.trim().toLowerCase(), forgotNewPassword);
    if (success) {
      setSuccessMessage('Senha redefinida com sucesso! Você já pode entrar com a nova senha.');
      setLoginEmail(forgotEmail);
      setLoginPassword(forgotNewPassword);
      setMode('login');
      setForgotStep(1);
    } else {
      setErrorMessage('Erro ao redefinir a senha.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header com a Logo Oficial */}
        <div className="text-center flex flex-col items-center">
          <img 
            src="/assets/aistudio/BOM_SAMARITANO_-_LOGO_5027b56d.png" 
            alt="Projeto Bom Samaritano" 
            className="h-20 sm:h-24 w-auto object-contain drop-shadow-xs mb-3"
          />
          <p className="text-xs sm:text-sm text-plum-900/70 font-semibold">
            Sistema de Gestão Financeira, Patrocinadores & Equipe
          </p>
        </div>
      </div>

      <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 px-4 shadow-sm border border-slate-200 rounded-3xl sm:px-8">
          
          {/* Mensagens de Feedback */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-2xl bg-plum-50 border border-plum-200 text-plum-900 text-xs sm:text-sm flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-solar-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ===================== MODO LOGIN ===================== */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h2 className="text-lg font-bold text-plum-950">Acessar o Sistema</h2>
                <p className="text-xs text-slate-500">Entre com seu e-mail e senha para continuar</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  E-mail ou Usuário
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="ex: admin@bonsamaritano.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-solar-400 focus:border-plum-600 focus:bg-white text-slate-800 placeholder-slate-400"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Senha
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      clearMessages();
                      setMode('forgot');
                      setForgotEmail(loginEmail);
                      setForgotStep(1);
                    }}
                    className="text-xs font-bold text-solar-600 hover:text-solar-700 cursor-pointer"
                  >
                    Esqueci a senha
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Sua senha de acesso"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-solar-400 focus:border-plum-600 focus:bg-white text-slate-800 placeholder-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-plum-700 hover:bg-plum-800 active:bg-plum-900 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>Entrar no Sistema</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center border-t border-slate-100">
                <span className="text-xs text-slate-500">Não possui uma conta? </span>
                <button
                  type="button"
                  onClick={() => {
                    clearMessages();
                    setMode('register');
                  }}
                  className="text-xs font-bold text-solar-600 hover:text-solar-700 hover:underline cursor-pointer"
                >
                  Cadastre-se agora
                </button>
              </div>

              {/* Botões de Acesso Rápido para Facilitar a Demonstração */}
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center">
                  Acessos Rápidos (Demonstração / Padrão):
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('admin@bonsamaritano.com', 'admin123')}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-plum-50/50 border border-slate-200 text-left transition cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                      <ShieldCheck className="w-3.5 h-3.5 text-plum-700" />
                      <span>Admin Geral</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block">Senha: admin123</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('videomaker@bonsamaritano.com', 'video123')}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-solar-50/50 border border-slate-200 text-left transition cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                      <Camera className="w-3.5 h-3.5 text-solar-600" />
                      <span>Videomaker</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block">Senha: video123</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* ===================== MODO CRIAR CONTA ===================== */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="border-b border-slate-100 pb-2">
                <button
                  type="button"
                  onClick={() => {
                    clearMessages();
                    setMode('login');
                  }}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Voltar para o Login</span>
                </button>
                <h2 className="text-lg font-bold text-plum-950">Criar Nova Conta</h2>
                <p className="text-xs text-slate-500">Cadastre-se para colaborar no Projeto Bom Samaritano</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nome Completo *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-solar-400 focus:border-plum-600 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  E-mail *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="seuemail@exemplo.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-solar-400 focus:border-plum-600 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Função / Papel Desejado
                </label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-solar-400 focus:border-plum-600 text-slate-800"
                >
                  <option value="voluntario">Voluntário / Captador de Patrocínio</option>
                  <option value="videomaker">Videomaker / Audiovisual</option>
                  <option value="comum">Colaborador Geral</option>
                </select>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  * O administrador poderá ajustar suas permissões a qualquer momento.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Senha *
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Mínimo 4 caracteres"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-solar-400 focus:border-plum-600 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Confirmar Senha *
                  </label>
                  <input
                    type="password"
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Repita a senha"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-solar-400 focus:border-plum-600 text-slate-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-plum-700 hover:bg-plum-800 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer mt-3"
              >
                <span>Criar Minha Conta</span>
                <CheckCircle2 className="w-4 h-4 text-solar-400" />
              </button>

              <div className="pt-2 text-center border-t border-slate-100">
                <span className="text-xs text-slate-500">Já tem cadastro? </span>
                <button
                  type="button"
                  onClick={() => {
                    clearMessages();
                    setMode('login');
                  }}
                  className="text-xs font-bold text-solar-600 hover:text-solar-700 hover:underline cursor-pointer"
                >
                  Entrar com login e senha
                </button>
              </div>
            </form>
          )}

          {/* ===================== MODO ESQUECI SENHA ===================== */}
          {mode === 'forgot' && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <button
                  type="button"
                  onClick={() => {
                    clearMessages();
                    setMode('login');
                  }}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Voltar para o Login</span>
                </button>
                <h2 className="text-lg font-bold text-plum-950">Recuperação de Senha</h2>
                <p className="text-xs text-slate-500">
                  {forgotStep === 1 
                    ? 'Informe seu e-mail cadastrado para redefinir o acesso' 
                    : 'Defina a nova senha da sua conta'}
                </p>
              </div>

              {forgotStep === 1 ? (
                <form onSubmit={handleForgotCheckEmail} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      E-mail Cadastrado
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="ex: admin@bonsamaritano.com"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-solar-400 focus:border-plum-600 text-slate-800"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-plum-800 hover:bg-plum-900 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Localizar Conta</span>
                    <KeyRound className="w-4 h-4 text-solar-400" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleForgotResetSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Nova Senha de Acesso
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type="password"
                        required
                        value={forgotNewPassword}
                        onChange={(e) => setForgotNewPassword(e.target.value)}
                        placeholder="Digite a nova senha"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-solar-400 focus:border-plum-600 text-slate-800"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-plum-700 hover:bg-plum-800 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Salvar Nova Senha & Entrar</span>
                    <CheckCircle2 className="w-4 h-4 text-solar-400" />
                  </button>
                </form>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
