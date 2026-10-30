import { BackupData } from '../types';

export const initialBackupData: BackupData = {
  metadata: {
    projeto: 'Projeto Bom Samaritano',
    anoBackup: '2025',
    localizacao: 'Maranhão (Pinheiro, BR-316, Santa Luzia)',
    totalItens: 27
  },
  patrocinadores: [
    {
      id: 1,
      nome: 'Supermercado Pinheirense',
      contato: '(98) 98123-0001',
      valor_cota: 1500,
      forma_pagamento: 'Pix',
      data: '2025-10-10',
      status: 'Recebido',
      video_gravado: true,
      logo_enviada: true,
      divulgar_nome: true,
      observacoes: 'Patrocínio ouro',
      voluntario: 'João'
    },
    {
      id: 2,
      nome: 'Posto BR 316',
      contato: '(98) 98123-0002',
      valor_cota: 800,
      forma_pagamento: 'Dinheiro',
      data: '2025-10-11',
      status: 'Recebido',
      video_gravado: false,
      logo_enviada: true,
      divulgar_nome: true,
      observacoes: 'Patrocínio prata',
      voluntario: 'Ana'
    },
    {
      id: 3,
      nome: 'Loja da Moda',
      contato: '(98) 98123-0003',
      valor_cota: 500,
      forma_pagamento: 'Pix',
      data: '2025-10-12',
      status: 'A Receber',
      video_gravado: false,
      logo_enviada: false,
      divulgar_nome: true,
      observacoes: 'Aguardando pagamento',
      voluntario: 'Michel'
    },
    {
      id: 4,
      nome: 'Padaria Pão Nosso',
      contato: '(98) 98123-0004',
      valor_cota: 300,
      forma_pagamento: 'Transferência',
      data: '2025-10-13',
      status: 'Recebido',
      video_gravado: true,
      logo_enviada: false,
      divulgar_nome: true,
      observacoes: 'Gravou vídeo de agradecimento',
      voluntario: 'Ana'
    },
    {
      id: 5,
      nome: 'Auto Peças Santa Luzia',
      contato: '(98) 98123-0005',
      valor_cota: 1000,
      forma_pagamento: 'Pix',
      data: '2025-10-14',
      status: 'Recebido',
      video_gravado: true,
      logo_enviada: true,
      divulgar_nome: true,
      observacoes: 'Patrocínio ouro',
      voluntario: 'João'
    }
  ],
  doadores: [
    {
      id: 1,
      nome: 'Maria Oliveira',
      contato: '(98) 98200-1111',
      tipo_doacao: 'Roupas',
      quantidade: '25 peças',
      data: '2025-10-09',
      responsavel: 'Ana',
      status: 'Recebido',
      divulgar_nome: false,
      observacoes: 'Doação de roupas femininas'
    },
    {
      id: 2,
      nome: 'José Pereira',
      contato: '(98) 98200-2222',
      tipo_doacao: 'Alimentos',
      quantidade: '10 cestas',
      data: '2025-10-10',
      responsavel: 'João',
      status: 'A Receber',
      divulgar_nome: false,
      observacoes: 'Prometeu entregar até sexta'
    },
    {
      id: 3,
      nome: 'Cláudia Santos',
      contato: '(98) 98200-3333',
      tipo_doacao: 'Sapatos',
      quantidade: '12 pares',
      data: '2025-10-11',
      responsavel: 'Ana',
      status: 'Recebido',
      divulgar_nome: false,
      observacoes: 'Inclui calçados infantis'
    },
    {
      id: 4,
      nome: 'Pedro Silva',
      contato: '(98) 98200-4444',
      tipo_doacao: 'Brinquedos',
      quantidade: '5 caixas',
      data: '2025-10-12',
      responsavel: 'João',
      status: 'Recebido',
      divulgar_nome: false,
      observacoes: 'Brinquedos para o dia do evento'
    },
    {
      id: 5,
      nome: 'Igreja Esperança',
      contato: '(98) 98200-5555',
      tipo_doacao: 'Alimentos',
      quantidade: '8 cestas',
      data: '2025-10-13',
      responsavel: 'Ana',
      status: 'A Receber',
      divulgar_nome: false,
      observacoes: 'Será entregue no domingo'
    }
  ],
  financeiro: [
    {
      id: 1,
      tipo: 'Entrada',
      categoria: 'Patrocínio',
      descricao: 'Supermercado Pinheirense',
      data: '2025-10-10',
      valor: 1500,
      origem: 'Patrocínio',
      status: 'Pago'
    },
    {
      id: 2,
      tipo: 'Entrada',
      categoria: 'Patrocínio',
      descricao: 'Posto BR 316',
      data: '2025-10-11',
      valor: 800,
      origem: 'Patrocínio',
      status: 'Pago'
    },
    {
      id: 3,
      tipo: 'Entrada',
      categoria: 'Patrocínio',
      descricao: 'Loja da Moda',
      data: '2025-10-12',
      valor: 500,
      origem: 'Patrocínio',
      status: 'Pendente'
    },
    {
      id: 4,
      tipo: 'Saída',
      categoria: 'Alimentação',
      descricao: 'Compra de cestas básicas',
      data: '2025-10-13',
      valor: 600,
      origem: 'Doação',
      status: 'Pago'
    },
    {
      id: 5,
      tipo: 'Saída',
      categoria: 'Transporte',
      descricao: 'Aluguel de caminhão',
      data: '2025-10-14',
      valor: 400,
      origem: 'Outro',
      status: 'Pago'
    },
    {
      id: 6,
      tipo: 'Saída',
      categoria: 'Mídia',
      descricao: 'Impressão de faixas e panfletos',
      data: '2025-10-15',
      valor: 300,
      origem: 'Outro',
      status: 'Pago'
    },
    {
      id: 7,
      tipo: 'Entrada',
      categoria: 'Doação',
      descricao: 'Brinquedos recebidos (estimativa)',
      data: '2025-10-12',
      valor: 0,
      origem: 'Doação',
      status: 'Pago'
    },
    {
      id: 8,
      tipo: 'Entrada',
      categoria: 'Doação',
      descricao: 'Roupas e sapatos (estimativa)',
      data: '2025-10-11',
      valor: 0,
      origem: 'Doação',
      status: 'Pago'
    },
    {
      id: 9,
      tipo: 'Saída',
      categoria: 'Evento',
      descricao: 'Decoração e som',
      data: '2025-10-18',
      valor: 900,
      origem: 'Outro',
      status: 'Pendente'
    },
    {
      id: 10,
      tipo: 'Saída',
      categoria: 'Administração',
      descricao: 'Material de escritório',
      data: '2025-10-16',
      valor: 150,
      origem: 'Outro',
      status: 'Pago'
    }
  ],
  contas: [
    {
      id: 1,
      tipo: 'Pagar',
      descricao: 'Compra de cestas básicas',
      valor: 600,
      categoria: 'Alimentação',
      vencimento: '2025-10-20',
      status: 'Em Aberto',
      responsavel: 'Ana',
      observacoes: 'Aguardando pagamento'
    },
    {
      id: 2,
      tipo: 'Pagar',
      descricao: 'Som do evento',
      valor: 400,
      categoria: 'Serviços',
      vencimento: '2025-10-24',
      status: 'Em Aberto',
      responsavel: 'João',
      observacoes: 'Pago parcialmente'
    },
    {
      id: 3,
      tipo: 'Receber',
      descricao: 'Loja da Moda (Cota Prata/Bronze)',
      valor: 500,
      categoria: 'Patrocínio',
      vencimento: '2025-10-25',
      status: 'Em Aberto',
      responsavel: 'Michel',
      observacoes: 'Aguardando transferência'
    },
    {
      id: 4,
      tipo: 'Pagar',
      descricao: 'Impressão de faixas e cartazes',
      valor: 300,
      categoria: 'Mídia',
      vencimento: '2025-10-19',
      status: 'Pago',
      responsavel: 'Ana',
      observacoes: 'Quitado'
    },
    {
      id: 5,
      tipo: 'Receber',
      descricao: 'Supermercado Pinheirense (Cota Ouro)',
      valor: 1500,
      categoria: 'Patrocínio',
      vencimento: '2025-10-10',
      status: 'Recebido',
      responsavel: 'João',
      observacoes: 'Confirmado via Pix'
    }
  ],
  users: [
    {
      id: 1,
      nome: 'Administrador Geral',
      email: 'admin@bonsamaritano.com',
      senha: 'admin123',
      papel: 'admin',
      ativo: true,
      criadoEm: '2025-10-01'
    },
    {
      id: 2,
      nome: 'Equipe Videomaker',
      email: 'videomaker@bonsamaritano.com',
      senha: 'video123',
      papel: 'videomaker',
      ativo: true,
      criadoEm: '2025-10-02'
    },
    {
      id: 3,
      nome: 'João (Captação)',
      email: 'joao@bonsamaritano.com',
      senha: 'joao123',
      papel: 'voluntario',
      ativo: true,
      criadoEm: '2025-10-03'
    },
    {
      id: 4,
      nome: 'Ana Beatriz',
      email: 'ana@bonsamaritano.com',
      senha: 'ana123',
      papel: 'voluntario',
      ativo: true,
      criadoEm: '2025-10-04'
    }
  ],
  voluntarios: [
    { id: 1, nome: 'João', telefone: '(98) 98111-1111', ativo: true },
    { id: 2, nome: 'Ana', telefone: '(98) 98222-2222', ativo: true },
    { id: 3, nome: 'Michel', telefone: '(98) 98333-3333', ativo: true },
    { id: 4, nome: 'Cláudia Santos', telefone: '(98) 98444-4444', ativo: true },
    { id: 5, nome: 'Pedro Silva', telefone: '(98) 98555-5555', ativo: true }
  ],
  categorias: [
    // Categorias de Entrada
    { id: 1, nome: 'Patrocínio', tipo: 'entrada' },
    { id: 2, nome: 'Doação Espontânea', tipo: 'entrada' },
    { id: 3, nome: 'Oferta / Campanha', tipo: 'entrada' },
    { id: 4, nome: 'Renda de Evento', tipo: 'entrada' },
    { id: 5, nome: 'Outra Entrada', tipo: 'entrada' },
    // Categorias de Saída (Despesas)
    { id: 6, nome: 'Alimentação / Cestas', tipo: 'saida' },
    { id: 7, nome: 'Transporte / Frete', tipo: 'saida' },
    { id: 8, nome: 'Mídia / Gráfica', tipo: 'saida' },
    { id: 9, nome: 'Evento / Som', tipo: 'saida' },
    { id: 10, nome: 'Decoração / Faixas', tipo: 'saida' },
    { id: 11, nome: 'Administração', tipo: 'saida' },
    { id: 12, nome: 'Aluguel', tipo: 'saida' },
    { id: 13, nome: 'Outra Despesa', tipo: 'saida' },
    // Formas de Pagamento
    { id: 14, nome: 'Pix', tipo: 'forma_pagamento' },
    { id: 15, nome: 'Dinheiro / Espécie', tipo: 'forma_pagamento' },
    { id: 16, nome: 'Transferência Bancária', tipo: 'forma_pagamento' },
    { id: 17, nome: 'Boleto', tipo: 'forma_pagamento' },
    { id: 18, nome: 'Cartão de Crédito', tipo: 'forma_pagamento' },
    // Cotas de Patrocínio
    { id: 19, nome: 'Cota Ouro (R$ 1.500)', tipo: 'patrocinio_cota' },
    { id: 20, nome: 'Cota Prata (R$ 1.000)', tipo: 'patrocinio_cota' },
    { id: 21, nome: 'Cota Bronze (R$ 500)', tipo: 'patrocinio_cota' },
    { id: 22, nome: 'Apoio Cultural', tipo: 'patrocinio_cota' }
  ]
};
