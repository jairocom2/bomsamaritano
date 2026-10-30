import React, { useState } from 'react';
import { 
  Trophy, 
  UserCheck, 
  Copy, 
  Check, 
  Printer, 
  Building2, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  Phone, 
  TrendingUp, 
  Video, 
  Image as ImageIcon,
  Users,
  Search,
  X,
  Share2,
  FileDown
} from 'lucide-react';
import { Patrocinador } from '../types';
import { generateReportPDF } from '../utils/pdfGenerator';

interface VolunteersViewProps {
  sponsors: Patrocinador[];
  onUpdateSponsor: (sponsor: Patrocinador) => void;
}

interface VolunteerStats {
  nome: string;
  totalPatrocinios: number;
  valorTotal: number;
  valorRecebido: number;
  valorPendente: number;
  videosGravados: number;
  logosRecebidas: number;
  patrocinadores: Patrocinador[];
}

export const VolunteersView: React.FC<VolunteersViewProps> = ({
  sponsors,
  onUpdateSponsor,
}) => {
  const [selectedVolunteer, setSelectedVolunteer] = useState<string>('all');
  const [copiedGeneral, setCopiedGeneral] = useState(false);
  const [copiedIndividual, setCopiedIndividual] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Agrupar e calcular estatísticas por voluntário
  const volunteerMap: Record<string, VolunteerStats> = {};

  sponsors.forEach((sponsor) => {
    const volName = sponsor.voluntario?.trim() || 'Não Atribuído';
    if (!volunteerMap[volName]) {
      volunteerMap[volName] = {
        nome: volName,
        totalPatrocinios: 0,
        valorTotal: 0,
        valorRecebido: 0,
        valorPendente: 0,
        videosGravados: 0,
        logosRecebidas: 0,
        patrocinadores: []
      };
    }
    const stat = volunteerMap[volName];
    stat.totalPatrocinios += 1;
    stat.valorTotal += sponsor.valor_cota;
    if (sponsor.status === 'Recebido') {
      stat.valorRecebido += sponsor.valor_cota;
    } else {
      stat.valorPendente += sponsor.valor_cota;
    }
    if (sponsor.video_gravado) stat.videosGravados += 1;
    if (sponsor.logo_enviada) stat.logosRecebidas += 1;
    stat.patrocinadores.push(sponsor);
  });

  // Ordenar o ranking: mais patrocínios primeiro, depois por valor total
  const rankingList: VolunteerStats[] = Object.values(volunteerMap).sort((a, b) => {
    if (b.totalPatrocinios !== a.totalPatrocinios) {
      return b.totalPatrocinios - a.totalPatrocinios;
    }
    return b.valorTotal - a.valorTotal;
  });

  // Estatísticas gerais
  const totalGeralEmpresas = sponsors.length;
  const totalGeralValor = sponsors.reduce((acc, s) => acc + s.valor_cota, 0);
  const totalGeralRecebido = sponsors.filter(s => s.status === 'Recebido').reduce((acc, s) => acc + s.valor_cota, 0);

  // Voluntário selecionado
  const currentVolunteerStats = selectedVolunteer !== 'all' 
    ? rankingList.find(v => v.nome === selectedVolunteer)
    : null;

  // Gerar texto do ranking geral para o WhatsApp
  const handleCopyGeneralWhatsApp = () => {
    const dateStr = new Date().toLocaleDateString('pt-BR');
    let text = `🏆 *PROJETO BOM SAMARITANO - RANKING DE CAPTAÇÃO*\n`;
    text += `📅 _Atualizado em ${dateStr}_\n\n`;

    rankingList.forEach((vol, idx) => {
      const medalha = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '👏';
      text += `${medalha} *${idx + 1}º Lugar: ${vol.nome}*\n`;
      text += `• ${vol.totalPatrocinios} ${vol.totalPatrocinios === 1 ? 'patrocínio' : 'patrocínios'} | *R$ ${vol.valorTotal.toFixed(2)}*\n`;
      text += `• Já Recebido: R$ ${vol.valorRecebido.toFixed(2)}${vol.valorPendente > 0 ? ` (A receber: R$ ${vol.valorPendente.toFixed(2)})` : ''}\n`;
      text += `• Empresas:\n`;
      vol.patrocinadores.forEach(sp => {
        const isPago = sp.status === 'Recebido';
        const emoji = isPago ? '✅' : '❌';
        const statusTexto = isPago ? 'Pago' : 'Não pago';
        text += `   ${emoji} ${sp.nome}: R$ ${sp.valor_cota.toFixed(2)} (${statusTexto})\n`;
      });
      text += `\n`;
    });

    text += `💰 *TOTAL DA EQUIPE:*\n`;
    text += `• ${totalGeralEmpresas} parceiros captados\n`;
    text += `• Total Levantado: *R$ ${totalGeralValor.toFixed(2)}*\n`;
    text += `• Total Já Pago: *R$ ${totalGeralRecebido.toFixed(2)}*\n\n`;
    text += `_Parabéns a todos os voluntários pelo empenho nesta grande missão solidária!_`;

    navigator.clipboard.writeText(text);
    setCopiedGeneral(true);
    setTimeout(() => setCopiedGeneral(false), 2500);
  };

  // Gerar texto de um voluntário individual para o WhatsApp
  const handleCopyIndividualWhatsApp = (vol: VolunteerStats) => {
    let text = `👏 *PROJETO BOM SAMARITANO - EVOLUÇÃO DE CAPTAÇÃO*\n`;
    text += `Voluntário(a): *${vol.nome}*\n\n`;
    text += `📊 *Resumo da sua captação:*\n`;
    text += `• Total de Patrocínios: *${vol.totalPatrocinios} ${vol.totalPatrocinios === 1 ? 'empresa' : 'empresas'}*\n`;
    text += `• Valor Total Conquistado: *R$ ${vol.valorTotal.toFixed(2)}*\n`;
    text += `• Valor Já Recebido: *R$ ${vol.valorRecebido.toFixed(2)}*\n`;
    if (vol.valorPendente > 0) {
      text += `• Pendente a Receber: *R$ ${vol.valorPendente.toFixed(2)}*\n`;
    }
    text += `\n🏢 *Seus Patrocinadores:*\n`;
    vol.patrocinadores.forEach(sp => {
      const isPago = sp.status === 'Recebido';
      const statusEmoji = isPago ? '✅' : '❌';
      const statusTexto = isPago ? 'Pago' : 'Não pago';
      text += `${statusEmoji} *${sp.nome}* - R$ ${sp.valor_cota.toFixed(2)} (${statusTexto} • ${sp.forma_pagamento})\n`;
    });
    text += `\n_Muito obrigado pela sua dedicação ao Projeto Bom Samaritano!_`;

    navigator.clipboard.writeText(text);
    setCopiedIndividual(vol.nome);
    setTimeout(() => setCopiedIndividual(null), 2500);
  };

  // Baixar PDF Oficial ou Imprimir
  const handleDownloadPDF = (volunteerFilter: string = selectedVolunteer) => {
    try {
      const filtered = volunteerFilter !== 'all' 
        ? sponsors.filter(s => s.voluntario === volunteerFilter)
        : sponsors;

      generateReportPDF({
        title: volunteerFilter !== 'all' 
          ? `Ranking & Captação • Voluntário: ${volunteerFilter}` 
          : 'Ranking Oficial de Voluntários por Patrocínios',
        reportType: 'voluntarios',
        data: {
          patrocinadores: sponsors,
          doadores: [],
          financeiro: [],
          contas: [],
          users: [],
          metadata: {
            projeto: 'Projeto Bom Samaritano',
            anoBackup: '2025',
            localizacao: 'Maranhão',
            totalItens: sponsors.length
          }
        },
        filteredSponsors: filtered,
        selectedVolunteer: volunteerFilter
      });
    } catch (e) {
      console.error(e);
      window.print();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Filtrar lista de voluntários por busca se houver
  const displayedRanking = rankingList.filter(v => 
    v.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.patrocinadores.some(p => p.nome.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-4 sm:space-y-6 pb-12">
      {/* Top Banner & Ações Principais (Print Hidden) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs print:hidden space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-solar-50 text-solar-900 text-[11px] font-bold border border-solar-200">
              <Trophy className="w-3.5 h-3.5 text-solar-600" />
              <span>Painel de Captação & Desempenho da Equipe</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Ranking de Voluntários por Patrocínios
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Gerencie a evolução de cada voluntário e gere relatórios com 1 clique.
            </p>
          </div>

          {/* Botões de Ação para o Admin */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopyGeneralWhatsApp}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-solar-50 hover:bg-solar-100 text-solar-800 border border-solar-200 text-xs font-bold transition cursor-pointer"
              title="Copiar relatório completo com todos os voluntários para enviar no WhatsApp"
            >
              {copiedGeneral ? <Check className="w-4 h-4 text-solar-600" /> : <Copy className="w-4 h-4" />}
              <span>{copiedGeneral ? 'Copiado p/ WhatsApp!' : 'Copiar Ranking p/ WhatsApp'}</span>
            </button>

            <button
              onClick={() => handleDownloadPDF('all')}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-plum-700 hover:bg-plum-800 active:bg-plum-900 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              title="Baixar arquivo PDF formatado do ranking de voluntários com cores da logo"
            >
              <FileDown className="w-4 h-4 text-solar-400" />
              <span>Baixar Relatório em PDF</span>
            </button>

            <button
              onClick={handlePrint}
              className="hidden sm:inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition cursor-pointer"
              title="Imprimir na impressora"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Imprimir</span>
            </button>
          </div>
        </div>

        {/* Resumo Rápido da Captação Total */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-slate-100">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Voluntários Ativos</span>
            <span className="text-lg font-extrabold text-slate-900 mt-0.5 block">{rankingList.length} captadores</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Empresas Fechadas</span>
            <span className="text-lg font-extrabold text-slate-900 mt-0.5 block">{totalGeralEmpresas} parceiros</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Valor Total Levantado</span>
            <span className="text-lg font-extrabold text-emerald-700 mt-0.5 block">
              R$ {totalGeralValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Já Recebido</span>
            <span className="text-lg font-extrabold text-teal-700 mt-0.5 block">
              R$ {totalGeralRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Barra de Filtro por Voluntário (Pílulas Mobile-Friendly) */}
      <div className="space-y-2 print:hidden">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
          <span>Filtrar por Voluntário:</span>
          {selectedVolunteer !== 'all' && (
            <button
              onClick={() => setSelectedVolunteer('all')}
              className="text-solar-600 hover:text-solar-700 font-bold cursor-pointer"
            >
              Ver Ranking de Todos
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setSelectedVolunteer('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
              selectedVolunteer === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Todos os Voluntários ({rankingList.length})
          </button>

          {rankingList.map((vol, idx) => (
            <button
              key={vol.nome}
              onClick={() => setSelectedVolunteer(vol.nome)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                selectedVolunteer === vol.nome
                  ? 'bg-plum-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-plum-50/50'
              }`}
            >
              <span>{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '👤'}</span>
              <span>{vol.nome} ({vol.totalPatrocinios})</span>
            </button>
          ))}
        </div>
      </div>

      {/* ÁREA DO RELATÓRIO DO VOLUNTÁRIO INDIVIDUAL (Quando um voluntário está selecionado) */}
      {currentVolunteerStats && (
        <div className="bg-white border-2 border-plum-300 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-plum-100 border border-plum-200 flex items-center justify-center font-black text-xl text-plum-800 shrink-0">
                {currentVolunteerStats.nome.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">
                    {currentVolunteerStats.nome}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-solar-100 text-solar-800 border border-solar-200 text-xs font-bold">
                    {currentVolunteerStats.totalPatrocinios} {currentVolunteerStats.totalPatrocinios === 1 ? 'patrocínio' : 'patrocínios'}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Relatório individual de evolução do voluntário
                </p>
              </div>
            </div>

            {/* Ações Individuais do Voluntário */}
            <div className="flex items-center gap-2 print:hidden">
              <button
                onClick={() => handleCopyIndividualWhatsApp(currentVolunteerStats)}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-solar-500 hover:bg-solar-600 text-white text-xs font-bold transition cursor-pointer shadow-xs"
                title="Copiar dados deste voluntário para enviar no WhatsApp dele"
              >
                {copiedIndividual === currentVolunteerStats.nome ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copiedIndividual === currentVolunteerStats.nome ? 'Copiado!' : 'Copiar p/ WhatsApp'}</span>
              </button>

              <button
                onClick={() => handleDownloadPDF(currentVolunteerStats.nome)}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-plum-700 hover:bg-plum-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                title="Baixar PDF deste voluntário"
              >
                <FileDown className="w-3.5 h-3.5 text-solar-400" />
                <span>PDF deste Voluntário</span>
              </button>
            </div>
          </div>

          {/* Cards de Métricas do Voluntário Selecionado (3 métricas financeiras essenciais) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Total Conquistado</span>
              <span className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5 block">
                R$ {currentVolunteerStats.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Já Recebido (Pago)</span>
              <span className="text-base sm:text-lg font-extrabold text-emerald-700 mt-0.5 block flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                R$ {currentVolunteerStats.valorRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">A Receber (Pendente)</span>
              <span className="text-base sm:text-lg font-extrabold text-amber-700 mt-0.5 block flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600" />
                R$ {currentVolunteerStats.valorPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Lista das Empresas Captadas por Este Voluntário */}
          <div className="space-y-2 pt-2">
            <h3 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <span>🏢</span>
              <span>Seus Patrocinadores:</span>
            </h3>

            <div className="space-y-2">
              {currentVolunteerStats.patrocinadores.map((sp) => {
                const isPago = sp.status === 'Recebido';
                return (
                  <div key={sp.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base">{isPago ? '✅' : '❌'}</span>
                        <span className="font-bold text-slate-900 text-sm">{sp.nome}</span>
                      </div>
                      <span className="text-xs text-slate-500 flex items-center gap-2 mt-0.5 ml-6">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {sp.contato} • {sp.forma_pagamento}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span className="font-extrabold text-slate-900 text-sm">
                        R$ {sp.valor_cota.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>

                      {isPago ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span>✅</span>
                          <span>Pago</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <span>❌</span>
                          <span>Não pago</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* RANKING GERAL DE VOLUNTÁRIOS (Cards & Pódio) */}
      <div id="printable-ranking" className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4 print:border-none print:p-0 print:shadow-none">
        {/* Cabeçalho Oficial no Modo Impressão */}
        <div className="hidden print:block border-b border-slate-200 pb-3 mb-4">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            PROJETO BOM SAMARITANO • RELATÓRIO OFICIAL DE CAPTAÇÃO
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1">
            Ranking e Desempenho dos Voluntários
          </h2>
          <p className="text-xs text-slate-500">
            Emissão: {new Date().toLocaleDateString('pt-BR')} • {totalGeralEmpresas} empresas captadas • R$ {totalGeralValor.toFixed(2)} total
          </p>
        </div>

        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Ranking Oficial da Equipe
            </h2>
          </div>
          <span className="text-xs text-slate-400">Classificação por quantidade de cotas</span>
        </div>

        {/* Lista de Ranking */}
        <div className="space-y-3">
          {displayedRanking.map((vol, index) => {
            const isFirst = index === 0;
            const isSecond = index === 1;
            const isThird = index === 2;

            return (
              <div 
                key={vol.nome}
                className={`p-4 rounded-2xl border transition ${
                  isFirst 
                    ? 'bg-amber-50/40 border-amber-300/80 shadow-xs' 
                    : isSecond
                    ? 'bg-slate-50/80 border-slate-300'
                    : isThird
                    ? 'bg-amber-50/20 border-amber-200/60'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Posição e Nome */}
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-base shrink-0 ${
                      isFirst 
                        ? 'bg-amber-400 text-amber-950 shadow-xs' 
                        : isSecond
                        ? 'bg-slate-300 text-slate-800'
                        : isThird
                        ? 'bg-amber-200 text-amber-900'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {isFirst ? '🥇' : isSecond ? '🥈' : isThird ? '🥉' : `${index + 1}º`}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-base text-slate-900">{vol.nome}</span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white border border-slate-200 text-slate-700">
                          {vol.totalPatrocinios} {vol.totalPatrocinios === 1 ? 'patrocínio' : 'patrocínios'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Empresas: <strong>{vol.patrocinadores.map(p => p.nome).join(', ')}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Valores e Botão Individual */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
                    <div className="text-left sm:text-right">
                      <span className="text-base font-extrabold text-slate-900 block">
                        R$ {vol.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[11px] text-emerald-700 font-semibold block">
                        R$ {vol.valorRecebido.toFixed(2)} recebido
                      </span>
                    </div>

                    {/* Botões de Ação para o Admin print:hidden */}
                    <div className="flex items-center gap-1.5 print:hidden">
                      <button
                        onClick={() => handleCopyIndividualWhatsApp(vol)}
                        className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-emerald-50 text-emerald-700 border border-slate-200 hover:border-emerald-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        title="Copiar relatório deste voluntário para enviar no WhatsApp dele"
                      >
                        {copiedIndividual === vol.nome ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                        <span className="hidden sm:inline">WhatsApp</span>
                      </button>

                      <button
                        onClick={() => setSelectedVolunteer(selectedVolunteer === vol.nome ? 'all' : vol.nome)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                          selectedVolunteer === vol.nome
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {selectedVolunteer === vol.nome ? 'Ocultar' : 'Ver Empresas'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Lista de Empresas Expandida se Selecionado na linha */}
                {selectedVolunteer === vol.nome && (
                  <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-2">
                    <div className="text-xs font-bold text-slate-700">Detalhamento dos Patrocínios:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {vol.patrocinadores.map(sp => {
                        const isPago = sp.status === 'Recebido';
                        return (
                          <div key={sp.id} className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs flex justify-between items-center">
                            <div>
                              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                                <span>{isPago ? '✅' : '❌'}</span>
                                <span>{sp.nome}</span>
                              </div>
                              <span className="text-[11px] text-slate-400 ml-5">{sp.forma_pagamento} • {sp.contato}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-extrabold text-slate-900 block">R$ {sp.valor_cota.toFixed(2)}</span>
                              <span className={`text-[10px] font-bold ${isPago ? 'text-emerald-700' : 'text-rose-700'}`}>
                                {isPago ? '✅ Pago' : '❌ Não pago'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Rodapé Oficial da Impressão */}
        <div className="hidden print:block pt-6 border-t border-slate-200 text-center text-xs text-slate-400">
          <p>Projeto Bom Samaritano • Relatório Administrativo da Equipe de Captação</p>
        </div>
      </div>
    </div>
  );
};
