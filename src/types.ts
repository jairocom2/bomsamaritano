export interface Patrocinador {
  id: number;
  nome: string;
  contato: string;
  valor_cota: number;
  forma_pagamento: string;
  data: string;
  status: 'Recebido' | 'A Receber';
  video_gravado: boolean;
  logo_enviada: boolean;
  divulgar_nome: boolean;
  observacoes: string;
  voluntario?: string;
}

export interface Doador {
  id: number;
  nome: string;
  contato: string;
  tipo_doacao: string;
  quantidade: string;
  data: string;
  responsavel: string;
  status: 'Recebido' | 'A Receber';
  divulgar_nome: boolean;
  observacoes: string;
}

export interface TransacaoFinanceira {
  id: number;
  tipo: 'Entrada' | 'Saída';
  categoria: string;
  descricao: string;
  data: string;
  valor: number;
  origem: string;
  status: 'Pago' | 'Pendente';
}

export interface Conta {
  id: number;
  tipo: 'Pagar' | 'Receber';
  descricao: string;
  valor: number;
  categoria: string;
  vencimento: string;
  status: 'Em Aberto' | 'Pago' | 'Recebido';
  responsavel: string;
  observacoes: string;
}

export type UserRole = 'admin' | 'videomaker' | 'voluntario' | 'comum';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha?: string;
  papel: UserRole;
  ativo?: boolean;
  criadoEm?: string;
  telefone?: string;
}

export interface VoluntarioItem {
  id: number;
  nome: string;
  telefone?: string;
  ativo?: boolean;
}

export interface CategoriaItem {
  id: number;
  nome: string;
  tipo: 'entrada' | 'saida' | 'patrocinio_cota' | 'forma_pagamento';
}

export interface BackupData {
  patrocinadores: Patrocinador[];
  doadores: Doador[];
  financeiro: TransacaoFinanceira[];
  contas: Conta[];
  users: Usuario[];
  voluntarios?: VoluntarioItem[];
  categorias?: CategoriaItem[];
  metadata: {
    projeto: string;
    anoBackup: string;
    localizacao: string;
    totalItens: number;
  };
}
