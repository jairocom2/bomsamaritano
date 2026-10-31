import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  Copy, 
  Check, 
  UserCheck, 
  Building2, 
  DollarSign, 
  Search,
  X,
  FileDown,
  Video,
  Image as ImageIcon,
  Filter,
  Users
} from 'lucide-react';
import { BackupData } from '../types';
import { exportFullExcel } from '../utils/exportUtils';
import { generateReportPDF } from '../utils/pdfGenerator';

interface ReportsViewProps {
  data: BackupData;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ data }) => {
  const [reportType, setReportType] = useState<'geral' | 'voluntarios' | 'financeiro'>('voluntarios');
  const [copiedText, setCopiedText] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  // Filters state
  const [selectedVolunteer, setSelectedVolunteer] = useState<string>('all');
  const [selectedStatusTag, setSelectedStatusTag] = useState<string>('all');
  const [selectedVideoTag, setSelectedVideoTag] = useState<string>('all');
  const [selectedLogoTag, setSelectedLogoTag] = useState<string>('all');
  const [selectedPaymentTag, setSelectedPaymentTag] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Extract unique volunteers from sponsors
  const allVolunteers = Array.from(
    new Set(
      data.patrocinadores
        .map(s => s.voluntario?.trim())
        .filter((v): v is string => Boolean(v && v.length > 0))
    )
  ).sort();

  // Extract unique payment methods
  const allPaymentMethods = Array.from(
    new Set(
      data.patrocinadores
        .map(s => s.forma_pagamento?.trim())
        .filter((p): p is string => Boolean(p && p.length > 0))
    )
  ).sort();

  // Filter sponsors according to all selected filters & tags
  const filteredSponsors = data.patrocinadores.filter(s => {
    // 1. Volunteer filter
    const volName = s.voluntario?.trim() || 'Não atribuído';
    if (selectedVolunteer !== 'all' && volName !== selectedVolunteer) {
      return false;
    }

    // 2. Status tag filter
    if (selectedStatusTag !== 'all' && s.status !== selectedStatusTag) {
      return false;
    }

    // 3. Video tag filter
    if (selectedVideoTag === 'gravado' && !s.video_gravado) return false;
    if (selectedVideoTag === 'pendente' && s.video_gravado) return false;

    // 4. Logo tag filter
    if (selectedLogoTag === 'enviada' && !s.logo_enviada) return false;
    if (selectedLogoTag === 'pendente' && s.logo_enviada) return false;

    // 5. Payment method tag filter
    if (selectedPaymentTag !== 'all' && s.forma_pagamento !== selectedPaymentTag) {
      return false;
    }

    // 6. Search term filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchName = s.nome.toLowerCase().includes(term);
      const matchVol = (s.voluntario || '').toLowerCase().includes(term);
      const matchContact = s.contato.toLowerCase().includes(term);
      if (!matchName && !matchVol && !matchContact) {
        return false;
      }
    }

    return true;
  });

  const hasActiveFilters = 
    selectedVolunteer !== 'all' || 
    selectedStatusTag !== 'all' || 
    selectedVideoTag !== 'all' || 
    selectedLogoTag !== 'all' || 
    selectedPaymentTag !== 'all' || 
    searchTerm.trim().length > 0;

  const handleResetFilters = () => {
    setSelectedVolunteer('all');
    setSelectedStatusTag('all');
    setSelectedVideoTag('all');
    setSelectedLogoTag('all');
    setSelectedPaymentTag('all');
    setSearchTerm('');
  };

  // Financial calculations on the filtered dataset
  const totalCotas = filteredSponsors.reduce((acc, s) => acc + s.valor_cota, 0);
  const totalRecebido = filteredSponsors.filter(s => s.status === 'Recebido').reduce((acc, s) => acc + s.valor_cota, 0);
  const totalAReceber = filteredSponsors.filter(s => s.status !== 'Recebido').reduce((acc, s) => acc + s.valor_cota, 0);

  // Overall financial calculations for accounting tab
  const entradasPagas = data.financeiro.filter(f => f.tipo === 'Entrada' && f.status === 'Pago').reduce((acc, f) => acc + f.valor, 0);
  const saidasPagas = data.financeiro.filter(f => f.tipo === 'Saída' && f.status === 'Pago').reduce((acc, f) => acc + f.valor, 0);
  const saidasPendentes = data.financeiro.filter(f => f.tipo === 'Saída' && f.status === 'Pendente').reduce((acc, f) => acc + f.valor, 0);
  const saldoCaixa = totalRecebido - saidasPagas;
  const totalEmpresas = filteredSponsors.length;

  // Group by volunteer on the filtered sponsors
  const voluntarioStats: Record<string, { totalValor: number; empresas: string[]; recebido: number; pendente: number }> = {};
  filteredSponsors.forEach(s => {
    const vol = s.voluntario?.trim() || 'Não atribuído';
    if (!voluntarioStats[vol]) {
      voluntarioStats[vol] = { totalValor: 0, empresas: [], recebido: 0, pendente: 0 };
    }
    voluntarioStats[vol].totalValor += s.valor_cota;
    voluntarioStats[vol].empresas.push(s.nome);
    if (s.status === 'Recebido') {
      voluntarioStats[vol].recebido += s.valor_cota;
    } else {
      voluntarioStats[vol].pendente += s.valor_cota;
    }
  });

  // Group expenses by category
  const despesasPorCategoria = data.financeiro
    .filter(f => f.tipo === 'Saída')
    .reduce((acc: Record<string, number>, curr) => {
      acc[curr.categoria] = (acc[curr.categoria] || 0) + curr.valor;
      return acc;
    }, {});

  // Generate WhatsApp summary text
  const handleCopyWhatsApp = () => {
    const dateStr = new Date().toLocaleDateString('pt-BR');
    let text = `📋 *PROJETO BOM SAMARITANO - RELATÓRIO OFICIAL (${dateStr})*\n`;
    if (selectedVolunteer !== 'all') {
      text += `👤 *Voluntário Selecionado:* ${selectedVolunteer}\n`;
    }
    text += `\n`;

    if (reportType === 'geral' || reportType === 'financeiro') {
      text += `💰 *FINANÇAS & CAPTAÇÃO*\n`;
      text += `• Total em Cotas: R$ ${totalCotas.toFixed(2)}\n`;
      text += `• Já Recebido: R$ ${totalRecebido.toFixed(2)}\n`;
      text += `• A Receber: R$ ${totalAReceber.toFixed(2)}\n`;
      text += `• Despesas Pagas: R$ ${saidasPagas.toFixed(2)}\n`;
      text += `• Saldo em Caixa: R$ ${saldoCaixa.toFixed(2)}\n\n`;
    }

    if (reportType === 'geral' || reportType === 'voluntarios') {
      text += `🤝 *CAPTAÇÃO POR VOLUNTÁRIO*\n`;
      Object.entries(voluntarioStats).forEach(([vol, stats]) => {
        text += `• *${vol}:* R$ ${stats.totalValor.toFixed(2)} (${stats.empresas.length} empresas)\n`;
        text += `   - Empresas: ${stats.empresas.join(', ')}\n`;
      });
      text += `\n`;
    }

    text += `🏢 *PATROCINADORES (${filteredSponsors.length} listados):*\n`;
    filteredSponsors.forEach(s => {
      text += `• ${s.nome} - R$ ${s.valor_cota.toFixed(2)} [${s.status}] (Voluntário: ${s.voluntario || 'Geral'})\n`;
    });

    text += `\n_Gerado pelo Sistema Bom Samaritano_`;

    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  // Baixar PDF Oficial usando jsPDF
  const handleDownloadPDF = () => {
    try {
      setPdfGenerating(true);
      let title = 'Demonstrativo Geral de Gestão e Captação';
      if (reportType === 'voluntarios') {
        title = selectedVolunteer !== 'all'
          ? `Relatório de Captação - Voluntário: ${selectedVolunteer}`
          : 'Relatório Oficial de Patrocínios por Voluntário';
      } else if (reportType === 'financeiro') {
        title = 'Demonstrativo Financeiro e Livro Caixa';
      }

      generateReportPDF({
        title,
        reportType,
        data,
        filteredSponsors,
        selectedVolunteer,
        statusTag: selectedStatusTag,
        videoTag: selectedVideoTag,
        logoTag: selectedLogoTag,
      });
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      // Fallback para impressão se houver erro
      window.print();
    } finally {
      setTimeout(() => setPdfGenerating(false), 800);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-12">
      {/* Top Header & Export Controls (Print Hidden) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs print:hidden">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-plum-700" />
            Central de Relatórios & Prestação de Contas
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Gere relatórios completos, baixe em PDF ou compartilhe no WhatsApp.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCopyWhatsApp}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-solar-50 hover:bg-solar-100 text-solar-800 border border-solar-200 text-xs font-bold transition cursor-pointer"
            title="Copiar texto formatado para o WhatsApp"
          >
            {copiedText ? <Check className="w-4 h-4 text-solar-600" /> : <Copy className="w-4 h-4" />}
            <span>{copiedText ? 'Copiado p/ WhatsApp!' : 'Copiar p/ WhatsApp'}</span>
          </button>

          {/* Botão Baixar Relatório em PDF (100% Funcional com jsPDF e Cores da Logo) */}
          <button
            onClick={handleDownloadPDF}
            disabled={pdfGenerating}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-plum-700 hover:bg-plum-800 active:bg-plum-900 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            title="Baixar arquivo PDF formatado do relatório atual com as cores da logo"
          >
            <FileDown className="w-4 h-4 text-solar-400" />
            <span>{pdfGenerating ? 'Gerando PDF...' : 'Baixar PDF'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="hidden sm:inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition cursor-pointer"
            title="Abrir diálogo de impressão do navegador"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Imprimir</span>
          </button>

          <button
            onClick={() => exportFullExcel(data)}
            className="hidden md:inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition cursor-pointer"
            title="Exportar dados completos para planilha Excel"
          >
            <Download className="w-4 h-4 text-plum-700" />
            <span>Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Seletor do Tipo de Relatório (Mobile-First Tabs) print:hidden */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 print:hidden">
        <button
          onClick={() => setReportType('voluntarios')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
            reportType === 'voluntarios'
              ? 'bg-plum-700 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <UserCheck className="w-4 h-4 text-solar-400" />
          <span>Captação por Voluntário</span>
        </button>

        <button
          onClick={() => setReportType('geral')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
            reportType === 'geral'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Relatório Geral Consolidado
        </button>

        <button
          onClick={() => setReportType('financeiro')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
            reportType === 'financeiro'
              ? 'bg-solar-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Extrato Financeiro
        </button>
      </div>

      {/* ÁREA DE FILTROS POR VOLUNTÁRIO E TAGS (Exclusivo para Relatórios com Patrocinadores) print:hidden */}
      {(reportType === 'voluntarios' || reportType === 'geral') && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5 print:hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-xs sm:text-sm text-slate-800">
                Filtros de Captação & Tags
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 font-semibold text-slate-600">
                {filteredSponsors.length} de {data.patrocinadores.length} parceiros
              </span>
            </div>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 inline-flex items-center gap-1 cursor-pointer self-start sm:self-auto"
              >
                <X className="w-3.5 h-3.5" />
                <span>Limpar Todos os Filtros</span>
              </button>
            )}
          </div>

          {/* 1. SELEÇÃO DE VOLUNTÁRIO (TAGS / PÍLULAS) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Filtrar por Voluntário:
            </label>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <button
                type="button"
                onClick={() => setSelectedVolunteer('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
                  selectedVolunteer === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Todos os Voluntários ({data.patrocinadores.length})
              </button>

              {allVolunteers.map(vol => {
                const count = data.patrocinadores.filter(s => s.voluntario === vol).length;
                const isSelected = selectedVolunteer === vol;
                return (
                  <button
                    key={vol}
                    type="button"
                    onClick={() => setSelectedVolunteer(isSelected ? 'all' : vol)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-plum-700 text-white shadow-xs'
                        : 'bg-plum-50 hover:bg-plum-100 text-plum-900 border border-plum-200'
                    }`}
                  >
                    <span>👤 {vol}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                      isSelected ? 'bg-white text-plum-900' : 'bg-plum-200 text-plum-950'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. TAGS DE STATUS, MÍDIA E BUSCA */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
            {/* Campo de Busca Rápida */}
            <div className="sm:col-span-4">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por empresa ou contato..."
                  className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-solar-400 focus:border-plum-600 focus:bg-white"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Tags de Status de Pagamento */}
            <div className="sm:col-span-4 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setSelectedStatusTag('all')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0 ${
                  selectedStatusTag === 'all'
                    ? 'bg-slate-800 text-white font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Status: Todos
              </button>
              <button
                onClick={() => setSelectedStatusTag(selectedStatusTag === 'Recebido' ? 'all' : 'Recebido')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0 border ${
                  selectedStatusTag === 'Recebido'
                    ? 'bg-plum-700 text-white border-plum-700 font-bold'
                    : 'bg-plum-50 text-plum-800 border-plum-200 hover:bg-plum-100'
                }`}
              >
                Recebido ✓
              </button>
              <button
                onClick={() => setSelectedStatusTag(selectedStatusTag === 'A Receber' ? 'all' : 'A Receber')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0 border ${
                  selectedStatusTag === 'A Receber'
                    ? 'bg-solar-500 text-white border-solar-500 font-bold'
                    : 'bg-solar-50 text-solar-800 border-solar-200 hover:bg-solar-100'
                }`}
              >
                A Receber ⏳
              </button>
            </div>

            {/* Tags de Vídeo & Logo */}
            <div className="sm:col-span-4 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setSelectedVideoTag(selectedVideoTag === 'gravado' ? 'all' : 'gravado')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0 border ${
                  selectedVideoTag === 'gravado'
                    ? 'bg-teal-600 text-white border-teal-600 font-bold'
                    : 'bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100'
                }`}
              >
                <Video className="w-3 h-3 inline mr-1" />
                Vídeo OK
              </button>
              <button
                onClick={() => setSelectedVideoTag(selectedVideoTag === 'pendente' ? 'all' : 'pendente')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0 border ${
                  selectedVideoTag === 'pendente'
                    ? 'bg-solar-600 text-white border-solar-600 font-bold'
                    : 'bg-solar-50 text-solar-800 border-solar-200 hover:bg-solar-100'
                }`}
              >
                Falta Vídeo
              </button>
              <button
                onClick={() => setSelectedLogoTag(selectedLogoTag === 'enviada' ? 'all' : 'enviada')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0 border ${
                  selectedLogoTag === 'enviada'
                    ? 'bg-plum-700 text-white border-plum-700 font-bold'
                    : 'bg-plum-50 text-plum-800 border-plum-200 hover:bg-plum-100'
                }`}
              >
                Logo OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ÁREA DO RELATÓRIO FORMATADO */}
      <div id="printable-report" className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-8 shadow-xs space-y-6 print:border-none print:p-0 print:shadow-none">
        {/* Cabeçalho Oficial do Relatório com Logo */}
        <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img 
              src="/assets/aistudio/BOM_SAMARITANO_-_LOGO_5027b56d.png" 
              alt="Projeto Bom Samaritano" 
              className="h-14 sm:h-16 w-auto object-contain shrink-0"
            />
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-solar-600">
                Semeando amor e avivamento • Relatório Oficial
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-plum-950 mt-0.5">
                {reportType === 'geral' && 'Demonstrativo Geral de Gestão e Captação'}
                {reportType === 'voluntarios' && (selectedVolunteer !== 'all' ? `Relatório de Captação • ${selectedVolunteer}` : 'Relatório de Patrocínios por Voluntário')}
                {reportType === 'financeiro' && 'Demonstrativo Financeiro e Livro Caixa'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Exercício: Outubro de 2025 • Emissão: {new Date().toLocaleDateString('pt-BR')}
                {selectedVolunteer !== 'all' && ` • Filtrado para ${selectedVolunteer}`}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-500 font-medium shrink-0">
            <span className="font-bold text-plum-900 block">Região: Maranhão</span>
            <span className="text-[11px] text-slate-400">Transparência Social</span>
          </div>
        </div>

        {/* 1. Indicadores Chave no Relatório */}
        {(reportType === 'geral' || reportType === 'financeiro' || reportType === 'voluntarios') && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Valor Previsto</span>
              <span className="text-lg font-extrabold text-slate-900 mt-0.5 block">
                R$ {totalCotas.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-400">{totalEmpresas} empresas</span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Já Recebido</span>
              <span className="text-lg font-extrabold text-emerald-600 mt-0.5 block">
                R$ {totalRecebido.toFixed(2)}
              </span>
              <span className="text-[10px] text-emerald-600 font-medium">
                {totalCotas > 0 ? Math.round((totalRecebido/totalCotas)*100) : 0}% captado
              </span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">A Receber / Pendente</span>
              <span className="text-lg font-extrabold text-amber-600 mt-0.5 block">
                R$ {totalAReceber.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-400">Pendente de liquidação</span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Saldo em Caixa</span>
              <span className="text-lg font-extrabold text-teal-700 mt-0.5 block">
                R$ {saldoCaixa.toFixed(2)}
              </span>
              <span className="text-[10px] text-teal-600 font-medium">Disponível</span>
            </div>
          </div>
        )}

        {/* 2. Seção: Controle de Captação por Voluntário (Cards com clique para filtrar) */}
        {(reportType === 'geral' || reportType === 'voluntarios') && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                Desempenho de Captação por Voluntário
              </h3>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                Clique em um cartão para filtrar apenas esse voluntário
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {Object.entries(voluntarioStats).map(([vol, stats]) => {
                const isSelected = selectedVolunteer === vol;
                return (
                  <div 
                    key={vol} 
                    onClick={() => setSelectedVolunteer(isSelected ? 'all' : vol)}
                    className={`border rounded-xl p-3.5 space-y-2 cursor-pointer transition ${
                      isSelected 
                        ? 'bg-emerald-50/60 border-emerald-500 shadow-xs ring-2 ring-emerald-500/20' 
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{vol}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                        {stats.empresas.length} {stats.empresas.length === 1 ? 'empresa' : 'empresas'}
                      </span>
                    </div>

                    <div className="text-base font-extrabold text-slate-900">
                      R$ {stats.totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>

                    <div className="text-xs text-slate-500 space-y-1 pt-1 border-t border-slate-200">
                      <div className="flex justify-between">
                        <span>Recebido:</span>
                        <strong className="text-emerald-700">R$ {stats.recebido.toFixed(2)}</strong>
                      </div>
                      {stats.pendente > 0 && (
                        <div className="flex justify-between">
                          <span>Pendente:</span>
                          <strong className="text-amber-700">R$ {stats.pendente.toFixed(2)}</strong>
                        </div>
                      )}
                      <div className="text-[11px] text-slate-400 pt-1 truncate">
                        {stats.empresas.join(', ')}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. Seção: Tabela Detalhada de Patrocinadores Filtrados */}
        {(reportType === 'geral' || reportType === 'voluntarios') && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                Lista de Patrocinadores & Voluntário que Conseguiu
              </h3>
              <span className="text-xs text-slate-500 font-semibold">
                {filteredSponsors.length} {filteredSponsors.length === 1 ? 'patrocinador' : 'patrocinadores'}
              </span>
            </div>

            {filteredSponsors.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-sm font-semibold text-slate-500">
                  Nenhum patrocinador corresponde aos filtros e tags selecionados.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-2 text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
                >
                  Limpar filtros para ver todos
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm text-slate-700 border border-slate-200 rounded-xl overflow-hidden">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Empresa</th>
                      <th className="py-2.5 px-3">Voluntário Captador</th>
                      <th className="py-2.5 px-3">Cota</th>
                      <th className="py-2.5 px-3">Forma Pgto</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-center">Vídeo</th>
                      <th className="py-2.5 px-3 text-center">Logo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSponsors.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-bold text-slate-900">{s.nome}</td>
                        <td className="py-2.5 px-3">
                          <button
                            onClick={() => setSelectedVolunteer(s.voluntario || 'all')}
                            className="font-semibold text-slate-700 px-2 py-0.5 rounded bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 transition cursor-pointer"
                            title="Clique para filtrar apenas este voluntário"
                          >
                            {s.voluntario || '-'}
                          </button>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          R$ {s.valor_cota.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">{s.forma_pagamento}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            s.status === 'Recebido' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                            s.video_gravado ? 'bg-teal-50 text-teal-700' : 'bg-orange-50 text-orange-700'
                          }`}>
                            {s.video_gravado ? 'Gravado ✓' : 'Falta Vídeo'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                            s.logo_enviada ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {s.logo_enviada ? 'Enviada ✓' : 'Falta Logo'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 4. Seção: Despesas e Livro Caixa (Apenas no Geral ou Financeiro) */}
        {(reportType === 'geral' || reportType === 'financeiro') && (
          <div className="space-y-3 pt-2">
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-teal-600" />
              Destinação dos Recursos (Despesas Pagas e Previstas)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {Object.entries(despesasPorCategoria).map(([cat, val]) => (
                <div key={cat} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">{cat}</span>
                  <span className="text-xs sm:text-sm font-extrabold text-slate-900 mt-0.5 block">
                    R$ {val.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-xs sm:text-sm text-slate-700 border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Tipo</th>
                    <th className="py-2.5 px-3">Descrição</th>
                    <th className="py-2.5 px-3">Categoria</th>
                    <th className="py-2.5 px-3">Data</th>
                    <th className="py-2.5 px-3">Valor</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.financeiro.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 font-bold">
                        <span className={f.tipo === 'Entrada' ? 'text-emerald-700' : 'text-rose-700'}>
                          {f.tipo === 'Entrada' ? '+' : '-'} {f.tipo}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-semibold text-slate-900">{f.descricao}</td>
                      <td className="py-2 px-3 text-slate-500">{f.categoria}</td>
                      <td className="py-2 px-3 text-slate-400">{f.data}</td>
                      <td className="py-2 px-3 font-bold">R$ {f.valor.toFixed(2)}</td>
                      <td className="py-2 px-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          f.status === 'Pago' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {f.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Rodapé Oficial da Prestação de Contas */}
        <div className="pt-6 border-t border-slate-200 text-center text-xs text-slate-400 space-y-1">
          <p className="font-semibold text-slate-600">Projeto Bom Samaritano • Todos os Direitos Reservados</p>
          <p>Documento gerado eletronicamente para fins de prestação de contas, transparência e controle social.</p>
        </div>
      </div>
    </div>
  );
};
