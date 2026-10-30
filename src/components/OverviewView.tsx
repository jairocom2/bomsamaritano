import React from 'react';
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
  Phone
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

        {/* Patrocínios */}
        <div className="bg-white border border-slate-200/90 p-3.5 sm:p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Total em Cotas</span>
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
