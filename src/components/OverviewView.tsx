import React, { useState } from 'react';
import { 
  Building2, 
  DollarSign, 
  Video, 
  Image as ImageIcon, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  Phone,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3
} from 'lucide-react';
import { BackupData, Patrocinador } from '../types';

interface OverviewViewProps {
  data: BackupData;
  onNavigateTab: (tab: string) => void;
  onUpdateSponsor: (s: Patrocinador) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  data,
  onNavigateTab,
  onUpdateSponsor,
}) => {
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>('all');

  // Financial metrics
  const patrociniosRecebidos = data.patrocinadores
    .filter(p => p.status === 'Recebido')
    .reduce((acc, curr) => acc + curr.valor_cota, 0);

  const patrociniosPendentes = data.patrocinadores
    .filter(p => p.status === 'A Receber')
    .reduce((acc, curr) => acc + curr.valor_cota, 0);

  const despesasPagas = data.financeiro
    .filter(f => f.tipo === 'Saída' && f.status === 'Pago')
    .reduce((acc, curr) => acc + curr.valor, 0);

  const saldoAtual = patrociniosRecebidos - despesasPagas;

  // Media metrics
  const totalSponsors = data.patrocinadores.length;
  const videosGravados = data.patrocinadores.filter(s => s.video_gravado).length;
  const logosRecebidas = data.patrocinadores.filter(s => s.logo_enviada).length;

  const sponsorsWithPendingTasks = data.patrocinadores.filter(
    s => !s.video_gravado || !s.logo_enviada || s.status === 'A Receber'
  );

  // Cálculos do Resumo Mensal (Agrupamento por mês YYYY-MM)
  interface ResumoMensalItem {
    mesChave: string; // "YYYY-MM"
    nomeMes: string;  // "Outubro / 2025"
    ano: string;
    mesNome: string;
    entradasPagas: number;
    entradasPendentes: number;
    saidasPagas: number;
    saidasPendentes: number;
    saldoRealizado: number;
    totalMovimentacoes: number;
    patrociniosPrevistos: number;
  }

  const monthlyStatsMap: Record<string, ResumoMensalItem> = {};

  const getOrCreateMonth = (mesChave: string) => {
    if (!monthlyStatsMap[mesChave]) {
      const [year, month] = mesChave.split('-');
      const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];
      const monthIdx = parseInt(month, 10) - 1;
      const mesNome = monthNames[monthIdx] || month;
      const nomeMes = `${mesNome} / ${year}`;
      monthlyStatsMap[mesChave] = {
        mesChave,
        nomeMes,
        ano: year,
        mesNome,
        entradasPagas: 0,
        entradasPendentes: 0,
        saidasPagas: 0,
        saidasPendentes: 0,
        saldoRealizado: 0,
        totalMovimentacoes: 0,
        patrociniosPrevistos: 0,
      };
    }
    return monthlyStatsMap[mesChave];
  };

  // 1. Processar dados de data.financeiro
  data.financeiro.forEach(t => {
    if (!t.data) return;
    const mesChave = t.data.slice(0, 7);
    if (mesChave.length === 7) {
      const m = getOrCreateMonth(mesChave);
      m.totalMovimentacoes += 1;
      if (t.tipo === 'Entrada') {
        if (t.status === 'Pago') {
          m.entradasPagas += t.valor;
        } else {
          m.entradasPendentes += t.valor;
        }
      } else if (t.tipo === 'Saída') {
        if (t.status === 'Pago') {
          m.saidasPagas += t.valor;
        } else {
          m.saidasPendentes += t.valor;
        }
      }
      m.saldoRealizado = m.entradasPagas - m.saidasPagas;
    }
  });

  // 2. Processar patrocinadores para entradas e valores a receber por mês
  data.patrocinadores.forEach(sp => {
    if (!sp.data) return;
    const mesChave = sp.data.slice(0, 7);
    if (mesChave.length === 7) {
      const m = getOrCreateMonth(mesChave);
      if (sp.status === 'Recebido') {
        // Se a transação já estiver no financeiro, evitamos duplicar
        const jaEstaNoFinanceiro = data.financeiro.some(f => 
          f.tipo === 'Entrada' && 
          f.status === 'Pago' && 
          f.descricao?.toLowerCase().includes(sp.nome.toLowerCase())
        );
        if (!jaEstaNoFinanceiro) {
          m.entradasPagas += sp.valor_cota;
          m.saldoRealizado = m.entradasPagas - m.saidasPagas;
        }
      } else if (sp.status === 'A Receber') {
        m.patrociniosPrevistos += sp.valor_cota;
      }
    }
  });

  // Lista ordenada por mês (mais recente primeiro)
  const monthlyList = Object.values(monthlyStatsMap).sort((a, b) => b.mesChave.localeCompare(a.mesChave));

  const filteredMonthlyList = selectedMonthFilter === 'all'
    ? monthlyList
    : monthlyList.filter(m => m.mesChave === selectedMonthFilter);

  return (
    <div className="space-y-4 sm:space-y-6 pb-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Visão Geral do Projeto
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Resumo executivo de finanças, vídeos e pendências.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('sponsors')}
            className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-white hover:bg-plum-50 text-plum-900 border border-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-2xs cursor-pointer"
          >
            <Building2 className="w-4 h-4 text-plum-700" />
            <span>Patrocinadores</span>
          </button>
          <button
            onClick={() => onNavigateTab('finance')}
            className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-white hover:bg-solar-50 text-solar-900 border border-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-2xs cursor-pointer"
          >
            <DollarSign className="w-4 h-4 text-solar-600" />
            <span>Finanças</span>
          </button>
        </div>
      </div>

      {/* 4 Indicadores Principais em Fundo Branco */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Saldo Líquido */}
        <div className="bg-white border border-slate-200/90 p-3.5 sm:p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Saldo em Caixa</span>
            <div className="p-1.5 rounded-lg bg-plum-50 text-plum-700">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-plum-800 mt-1">
            R$ {saldoAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-xs text-slate-400 block mt-0.5 font-medium">Líquido disponível</span>
        </div>

        {/* Patrocínios / Valor Previsto */}
        <div className="bg-white border border-slate-200/90 p-3.5 sm:p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Valor Previsto</span>
            <div className="p-1.5 rounded-lg bg-solar-50 text-solar-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            R$ {(patrociniosRecebidos + patrociniosPendentes).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-xs text-solar-600 block mt-0.5 font-semibold">
            R$ {patrociniosRecebidos.toFixed(2)} já recebidos
          </span>
        </div>

        {/* Vídeos Gravados */}
        <div className="bg-white border border-slate-200/90 p-3.5 sm:p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Vídeos dos Parceiros</span>
            <div className="p-1.5 rounded-lg bg-solar-50 text-solar-600">
              <Video className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {videosGravados} de {totalSponsors}
          </p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-solar-500 h-full rounded-full" 
              style={{ width: `${(videosGravados / totalSponsors) * 100}%` }}
            />
          </div>
        </div>

        {/* Logos Enviadas */}
        <div className="bg-white border border-slate-200/90 p-3.5 sm:p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Logos Recebidas</span>
            <div className="p-1.5 rounded-lg bg-plum-50 text-plum-700">
              <ImageIcon className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            {logosRecebidas} de {totalSponsors}
          </p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-indigo-500 h-full rounded-full" 
              style={{ width: `${(logosRecebidas / totalSponsors) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Componente: Resumo Mensal do Fluxo de Caixa */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="space-y-0.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-plum-50 text-plum-900 text-[11px] font-bold border border-plum-200">
              <Calendar className="w-3.5 h-3.5 text-plum-700" />
              <span>Gestão Financeira & Fluxo de Caixa</span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-plum-700" />
              Resumo Mensal de Entradas e Saídas
            </h2>
            <p className="text-xs text-slate-500">
              Acompanhamento detalhado do fluxo de caixa e cotas por mês de competência.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('finance')}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition cursor-pointer"
          >
            <span>Ver Extrato Completo</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        {/* Filtro por Mês (Pílulas Mobile-Friendly) */}
        {monthlyList.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => setSelectedMonthFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
                selectedMonthFilter === 'all'
                  ? 'bg-plum-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos os Meses ({monthlyList.length})
            </button>
            {monthlyList.map(m => (
              <button
                key={m.mesChave}
                onClick={() => setSelectedMonthFilter(m.mesChave)}
                className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 border ${
                  selectedMonthFilter === m.mesChave
                    ? 'bg-solar-500 text-white border-solar-500 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {m.nomeMes}
              </button>
            ))}
          </div>
        )}

        {/* Grid de Cards Mensais */}
        {filteredMonthlyList.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            Nenhuma movimentação encontrada para o período selecionado.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {filteredMonthlyList.map(m => {
              const temSuperavit = m.saldoRealizado >= 0;
              const totalMovimento = m.entradasPagas + m.saidasPagas;

              return (
                <div 
                  key={m.mesChave} 
                  className="bg-slate-50/70 border border-slate-200/90 rounded-xl p-3.5 sm:p-4 space-y-3 hover:border-slate-300 transition"
                >
                  {/* Cabeçalho do Card Mensal */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-200/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-plum-100 text-plum-800 flex items-center justify-center font-bold text-xs shrink-0">
                        <Calendar className="w-4 h-4 text-plum-700" />
                      </div>
                      <div>
                        <span className="font-extrabold text-sm sm:text-base text-slate-900 block leading-tight">
                          {m.nomeMes}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {m.totalMovimentacoes} {m.totalMovimentacoes === 1 ? 'lançamento' : 'lançamentos'} registrados
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black border ${
                        temSuperavit 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {temSuperavit ? '+' : ''} R$ {m.saldoRealizado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">
                        {temSuperavit ? 'Superávit líquido' : 'Déficit líquido'}
                      </span>
                    </div>
                  </div>

                  {/* Detalhes de Entradas vs Saídas */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Entradas Pagas</span>
                        <div className="p-1 rounded bg-emerald-50 text-emerald-600">
                          <ArrowUpRight className="w-3 h-3" />
                        </div>
                      </div>
                      <span className="text-sm sm:text-base font-black text-emerald-700 mt-1 block">
                        R$ {m.entradasPagas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Saídas Pagas</span>
                        <div className="p-1 rounded bg-rose-50 text-rose-600">
                          <ArrowDownRight className="w-3 h-3" />
                        </div>
                      </div>
                      <span className="text-sm sm:text-base font-black text-rose-700 mt-1 block">
                        R$ {m.saidasPagas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Patrocínios Previstos para este Mês (se houver) */}
                  {m.patrociniosPrevistos > 0 && (
                    <div className="bg-amber-50/80 border border-amber-200 rounded-lg px-3 py-2 text-xs flex items-center justify-between gap-2 text-amber-900">
                      <span className="flex items-center gap-1.5 font-semibold text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        Patrocínios Previstos a Receber no Mês:
                      </span>
                      <strong className="font-extrabold whitespace-nowrap">
                        R$ {m.patrociniosPrevistos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </strong>
                    </div>
                  )}

                  {/* Barra Visual de Proporção Entradas x Saídas */}
                  {totalMovimento > 0 && (
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[10px] font-bold text-slate-500">
                        <span className="text-emerald-700 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                          Entradas ({Math.round((m.entradasPagas / totalMovimento) * 100)}%)
                        </span>
                        <span className="text-rose-700 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block"></span>
                          Saídas ({Math.round((m.saidasPagas / totalMovimento) * 100)}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                        <div 
                          className="bg-emerald-500 h-full transition-all" 
                          style={{ width: `${(m.entradasPagas / totalMovimento) * 100}%` }}
                        />
                        <div 
                          className="bg-rose-500 h-full transition-all" 
                          style={{ width: `${(m.saidasPagas / totalMovimento) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Linha 2: Pendências de Patrocinadores & Movimentações Recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Painel de Pendências de Mídia e Pagamento */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Pendências de Patrocinadores ({sponsorsWithPendingTasks.length})
              </h2>
              <p className="text-xs text-slate-400">Toque para atualizar na hora</p>
            </div>
            <button
              onClick={() => onNavigateTab('sponsors')}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-0.5"
            >
              Ver todos <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {sponsorsWithPendingTasks.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                Tudo em dia! Vídeos gravados, logos enviadas e pagamentos recebidos.
              </div>
            ) : (
              sponsorsWithPendingTasks.map(sponsor => (
                <div key={sponsor.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">{sponsor.nome}</span>
                    <span className="text-xs text-slate-500">
                      R$ {sponsor.valor_cota} • {sponsor.contato}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Botão Logo */}
                    <button
                      onClick={() => onUpdateSponsor({ ...sponsor, logo_enviada: !sponsor.logo_enviada })}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition border cursor-pointer ${
                        sponsor.logo_enviada
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                      title="Alternar status da logo"
                    >
                      {sponsor.logo_enviada ? 'Logo OK' : 'Falta Logo'}
                    </button>

                    {/* Botão Vídeo */}
                    <button
                      onClick={() => onUpdateSponsor({ ...sponsor, video_gravado: !sponsor.video_gravado })}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition border cursor-pointer ${
                        sponsor.video_gravado
                          ? 'bg-teal-50 text-teal-700 border-teal-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                      }`}
                      title="Alternar status do vídeo"
                    >
                      {sponsor.video_gravado ? 'Vídeo OK' : 'Falta Vídeo'}
                    </button>

                    {/* Status Pagamento */}
                    {sponsor.status === 'A Receber' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        A Receber
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Últimas Movimentações */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-teal-600" />
                Lançamentos Recentes
              </h2>
              <p className="text-xs text-slate-400">Entradas e saídas financeiras</p>
            </div>
            <button
              onClick={() => onNavigateTab('finance')}
              className="text-xs text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-0.5"
            >
              Extrato <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {data.financeiro.slice(0, 5).map(item => (
              <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-900 block">{item.descricao}</span>
                  <span className="text-slate-400">{item.categoria} • {item.data}</span>
                </div>
                <div className="text-right">
                  <span className={`font-bold block ${item.tipo === 'Entrada' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {item.tipo === 'Entrada' ? '+' : '-'} R$ {item.valor.toFixed(2)}
                  </span>
                  <span className={`text-[10px] ${item.status === 'Pago' ? 'text-slate-400' : 'text-amber-600 font-bold'}`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
