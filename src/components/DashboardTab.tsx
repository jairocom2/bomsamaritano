import React from 'react';
import { 
  Building2, 
  Gift, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Video, 
  ArrowUpRight, 
  FileSpreadsheet, 
  Send,
  Users,
  PackageCheck
} from 'lucide-react';
import { BackupData, Patrocinador } from '../types';

interface DashboardTabProps {
  data: BackupData;
  onNavigateTab: (tab: string) => void;
  onOpenVideoAI: (sponsor: Patrocinador) => void;
  onExportExcel: () => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  data,
  onNavigateTab,
  onOpenVideoAI,
  onExportExcel,
}) => {
  // Calculations
  const patrociniosRecebidos = data.patrocinadores
    .filter(p => p.status === 'Recebido')
    .reduce((acc, curr) => acc + curr.valor_cota, 0);

  const patrociniosPendentes = data.patrocinadores
    .filter(p => p.status === 'A Receber')
    .reduce((acc, curr) => acc + curr.valor_cota, 0);

  const despesasPagas = data.financeiro
    .filter(f => f.tipo === 'Saída' && f.status === 'Pago')
    .reduce((acc, curr) => acc + curr.valor, 0);

  const despesasPendentes = data.financeiro
    .filter(f => f.tipo === 'Saída' && f.status === 'Pendente')
    .reduce((acc, curr) => acc + curr.valor, 0);

  const saldoAtual = patrociniosRecebidos - despesasPagas;

  // Donation item summaries
  const cestasTotal = 18; // José Pereira (10) + Igreja Esperança (8)
  const roupasTotal = 25; // Maria Oliveira (25 peças)
  const sapatosTotal = 12; // Cláudia Santos (12 pares)
  const brinquedosTotal = 5; // Pedro Silva (5 caixas)

  // Expense categories
  const despesasPorCategoria = data.financeiro
    .filter(f => f.tipo === 'Saída')
    .reduce((acc: Record<string, number>, curr) => {
      acc[curr.categoria] = (acc[curr.categoria] || 0) + curr.valor;
      return acc;
    }, {});

  const totalDespesasTodas = Object.values(despesasPorCategoria).reduce((a, b) => a + b, 0);

  // Pending sponsors needing attention
  const sponsorsNeedingAttention = data.patrocinadores.filter(
    s => s.status === 'A Receber' || !s.video_gravado || !s.logo_enviada
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Banner de Reconhecimento do Backup */}
      <div className="bg-gradient-to-r from-emerald-900/40 via-teal-900/30 to-slate-900 border border-emerald-500/30 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500 text-emerald-950 font-bold text-xs uppercase px-2.5 py-0.5 rounded-full">
                Backup Restaurado com Sucesso
              </span>
              <span className="text-slate-400 text-xs">Exercício Outubro/2025</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Projeto Bom Samaritano • Maranhão
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl">
              Identificamos o sistema! Trata-se do ecossistema de gestão beneficente do <strong>Projeto Bom Samaritano</strong> (Pinheiro, BR-316, Santa Luzia), integrando cotas de patrocínio, campanhas de arrecadação física e prestação de contas com IA.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3 w-full md:w-auto">
            <button
              onClick={() => onNavigateTab('ai-suite')}
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition shadow-lg shadow-emerald-900/30"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              Central de IA
            </button>
            <button
              onClick={onExportExcel}
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-sm transition"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              Baixar Planilha (.xlsx)
            </button>
          </div>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Patrocínios Recebidos */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Patrocínios Recebidos</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">
              R$ {patrociniosRecebidos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-2">
            <span>A receber: R$ {patrociniosPendentes.toFixed(2)}</span>
            <span className="text-emerald-400 font-medium">
              {Math.round((patrociniosRecebidos / (patrociniosRecebidos + patrociniosPendentes)) * 100)}% quitado
            </span>
          </div>
        </div>

        {/* Card 2: Saldo Líquido em Caixa */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Saldo Líquido Atual</span>
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-400">
              R$ {saldoAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-2">
            <span>Após despesas pagas</span>
            <span className="text-teal-400 font-medium">Disponível</span>
          </div>
        </div>

        {/* Card 3: Despesas Realizadas */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Despesas Pagas</span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">
              R$ {despesasPagas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-2">
            <span>Pendente: R$ {despesasPendentes.toFixed(2)}</span>
            <span className="text-amber-400 font-medium">Evento/Som</span>
          </div>
        </div>

        {/* Card 4: Arrecadações Físicas */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cestas & Doações</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{cestasTotal} Cestas</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-2">
            <span>+ {roupasTotal} roupas, {brinquedosTotal} caixas</span>
            <span className="text-amber-400 font-medium">5 Doadores</span>
          </div>
        </div>
      </div>

      {/* Row 2: Status dos Patrocinadores & Contas Críticas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna 1 & 2: Acompanhamento de Patrocinadores e Ativação de Marca */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                Patrocinadores: Status de Pagamento e Mídia
              </h2>
              <p className="text-xs text-slate-400">Controle de contrapartidas, logotipos e vídeos de agradecimento</p>
            </div>
            <button
              onClick={() => onNavigateTab('sponsors')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
            >
              Ver todos ({data.patrocinadores.length})
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-800/80">
            {data.patrocinadores.map((sponsor) => (
              <div key={sponsor.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white">{sponsor.nome}</span>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                      R$ {sponsor.valor_cota} ({sponsor.forma_pagamento})
                    </span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                      sponsor.status === 'Recebido'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {sponsor.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span>{sponsor.contato}</span>
                    <span className="text-slate-500">•</span>
                    <span>{sponsor.observacoes}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Status indicators */}
                  <span className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
                    sponsor.logo_enviada ? 'text-emerald-400 bg-emerald-950/40' : 'text-slate-500 bg-slate-800'
                  }`} title={sponsor.logo_enviada ? 'Logo recebida' : 'Logo pendente'}>
                    <CheckCircle2 className="w-3 h-3" />
                    Logo
                  </span>

                  <span className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
                    sponsor.video_gravado ? 'text-teal-400 bg-teal-950/40' : 'text-amber-400 bg-amber-950/40'
                  }`} title={sponsor.video_gravado ? 'Vídeo já gravado' : 'Vídeo pendente'}>
                    <Video className="w-3 h-3" />
                    {sponsor.video_gravado ? 'Vídeo OK' : 'Sem Vídeo'}
                  </span>

                  {/* Quick AI Script button */}
                  <button
                    onClick={() => onOpenVideoAI(sponsor)}
                    className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-slate-800 rounded-lg transition"
                    title="Gerar Roteiro de Vídeo com IA"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coluna 3: Alertas e Contas a Pagar/Receber */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Contas & Vencimentos
            </h2>
            <button
              onClick={() => onNavigateTab('bills')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
            >
              Gerenciar
            </button>
          </div>

          <div className="space-y-3">
            {data.contas.map((conta) => (
              <div 
                key={conta.id} 
                className={`p-3 rounded-lg border text-xs ${
                  conta.status === 'Em Aberto' 
                    ? 'bg-slate-800/40 border-amber-500/30' 
                    : 'bg-slate-800/20 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-semibold ${conta.tipo === 'Receber' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    [{conta.tipo.toUpperCase()}] {conta.descricao}
                  </span>
                  <span className="font-bold text-white">
                    R$ {conta.valor.toFixed(2)}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-slate-400">
                  <span>Venc: {conta.vencimento}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                    conta.status === 'Em Aberto' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {conta.status} ({conta.responsavel})
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick AI Action Card */}
          <div className="pt-2">
            <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-3 text-xs space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                Sugestão da IA Samaritano
              </div>
              <p className="text-slate-300">
                A <strong>Loja da Moda</strong> possui cota de R$ 500 em aberto para cobrir o som do evento (R$ 400).
              </p>
              <button
                onClick={() => onNavigateTab('ai-suite')}
                className="w-full text-center py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition"
              >
                Gerar Mensagem de Cobrança Gentil
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Doações Físicas & Distribuição das Despesas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Doações Físicas Arrecadadas */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Gift className="w-4 h-4 text-amber-400" />
              Doações Físicas Registradas
            </h2>
            <button
              onClick={() => onNavigateTab('donations')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
            >
              Ver Detalhes
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/60 text-center">
              <span className="text-[11px] text-slate-400 block">Alimentos</span>
              <span className="text-lg font-bold text-amber-400">18 Cestas</span>
              <span className="text-[10px] text-slate-400 block">Igreja & José</span>
            </div>
            <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/60 text-center">
              <span className="text-[11px] text-slate-400 block">Roupas</span>
              <span className="text-lg font-bold text-teal-400">25 Peças</span>
              <span className="text-[10px] text-slate-400 block">Maria Oliveira</span>
            </div>
            <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/60 text-center">
              <span className="text-[11px] text-slate-400 block">Calçados</span>
              <span className="text-lg font-bold text-indigo-400">12 Pares</span>
              <span className="text-[10px] text-slate-400 block">Cláudia Santos</span>
            </div>
            <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/60 text-center">
              <span className="text-[11px] text-slate-400 block">Brinquedos</span>
              <span className="text-lg font-bold text-rose-400">5 Caixas</span>
              <span className="text-[10px] text-slate-400 block">Pedro Silva</span>
            </div>
          </div>

          <div className="space-y-2 pt-1 text-xs">
            {data.doadores.map(doador => (
              <div key={doador.id} className="flex items-center justify-between p-2 rounded bg-slate-800/30">
                <span className="text-slate-200 font-medium">{doador.nome} ({doador.tipo_doacao})</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                  doador.status === 'Recebido' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {doador.quantidade} • {doador.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Despesas por Categoria */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-rose-400" />
              Destinação dos Recursos (Despesas)
            </h2>
            <span className="text-xs text-slate-400">Total: R$ {totalDespesasTodas.toFixed(2)}</span>
          </div>

          <div className="space-y-3">
            {Object.entries(despesasPorCategoria).map(([cat, val]) => {
              const pct = totalDespesasTodas > 0 ? Math.round((val / totalDespesasTodas) * 100) : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">{cat}</span>
                    <span className="text-slate-400">R$ {val.toFixed(2)} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-between text-xs text-slate-400">
            <span>Prestação de contas 100% transparente</span>
            <button
              onClick={() => onNavigateTab('financial')}
              className="text-emerald-400 hover:text-emerald-300 font-medium"
            >
              Ver Extrato Completo →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
