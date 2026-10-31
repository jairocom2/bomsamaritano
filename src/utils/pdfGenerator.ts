import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BackupData, Patrocinador } from '../types';

interface PDFReportOptions {
  title: string;
  reportType: 'geral' | 'voluntarios' | 'financeiro';
  data: BackupData;
  filteredSponsors?: Patrocinador[];
  selectedVolunteer?: string;
  statusTag?: string;
  videoTag?: string;
  logoTag?: string;
}

export function generateReportPDF({
  title,
  reportType,
  data,
  filteredSponsors,
  selectedVolunteer = 'all',
  statusTag = 'all',
  videoTag = 'all',
  logoTag = 'all',
}: PDFReportOptions) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const sponsorsToUse = filteredSponsors || data.patrocinadores;
  const dateStr = new Date().toLocaleDateString('pt-BR');
  const timeStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  // 1. Header institucional com as cores oficiais da logo (Plum #653052 e Laranja #f58a34)
  doc.setFillColor(101, 48, 82); // Brand Plum #653052
  doc.rect(0, 0, 210, 22, 'F');

  // Faixa de destaque Laranja Solar (#f58a34)
  doc.setFillColor(245, 138, 52); // Brand Orange #f58a34
  doc.rect(0, 22, 210, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('PROJETO BOM SAMARITANO', 14, 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('Semeando amor e avivamento • Gestão de Patrocinadores & Finanças', 14, 17);

  doc.setFontSize(8);
  doc.text(`Emissão: ${dateStr} às ${timeStr}`, 196, 17, { align: 'right' });

  let currentY = 32;

  // 2. Título do Relatório
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(title, 14, currentY);
  currentY += 6;

  // Filtros aplicados no cabeçalho
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  let filterText = `Exercício: Outubro de 2025`;
  if (selectedVolunteer && selectedVolunteer !== 'all') {
    filterText += ` | Voluntário: ${selectedVolunteer}`;
  }
  if (statusTag && statusTag !== 'all') {
    filterText += ` | Status: ${statusTag}`;
  }
  if (videoTag && videoTag !== 'all') {
    filterText += ` | Vídeo: ${videoTag === 'gravado' ? 'Gravado' : 'Pendente'}`;
  }
  if (logoTag && logoTag !== 'all') {
    filterText += ` | Logo: ${logoTag === 'enviada' ? 'Enviada' : 'Pendente'}`;
  }
  doc.text(filterText, 14, currentY);
  currentY += 8;

  // 3. Indicadores Resumo (Box em colunas)
  const totalCotas = sponsorsToUse.reduce((acc, s) => acc + s.valor_cota, 0);
  const totalRecebido = sponsorsToUse.filter(s => s.status === 'Recebido').reduce((acc, s) => acc + s.valor_cota, 0);
  const totalPendente = sponsorsToUse.filter(s => s.status !== 'Recebido').reduce((acc, s) => acc + s.valor_cota, 0);
  const videosGravados = sponsorsToUse.filter(s => s.video_gravado).length;

  doc.setFillColor(248, 250, 252); // Slate-50
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.roundedRect(14, currentY, 182, 18, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);

  // Col 1
  doc.text('VALOR PREVISTO', 18, currentY + 6);
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text(`R$ ${totalCotas.toFixed(2)}`, 18, currentY + 13);

  // Col 2
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('JÁ RECEBIDO', 65, currentY + 6);
  doc.setFontSize(11);
  doc.setTextColor(5, 150, 105);
  doc.text(`R$ ${totalRecebido.toFixed(2)}`, 65, currentY + 13);

  // Col 3
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('A RECEBER', 112, currentY + 6);
  doc.setFontSize(11);
  doc.setTextColor(217, 119, 6);
  doc.text(`R$ ${totalPendente.toFixed(2)}`, 112, currentY + 13);

  // Col 4
  const isVolReport = reportType === 'voluntarios';
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(isVolReport ? 'TOTAL PARCEIROS' : 'EMPRESAS / MÍDIA', 158, currentY + 6);
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text(isVolReport ? `${sponsorsToUse.length} parceiros` : `${sponsorsToUse.length} emp. (${videosGravados} vids)`, 158, currentY + 13);

  currentY += 24;

  // 4. Tabela de Patrocinadores e Voluntários
  if (reportType === 'geral' || reportType === 'voluntarios') {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text(isVolReport ? 'Patrocinadores Conquistados' : 'Patrocinadores & Voluntários Responsáveis', 14, currentY);
    currentY += 3;

    const tableBody = sponsorsToUse.map((s, idx) => {
      const statusTxt = s.status === 'Recebido' ? 'Pago' : 'Não pago';
      if (isVolReport) {
        return [
          (idx + 1).toString(),
          s.nome,
          s.voluntario || 'Não atribuído',
          `R$ ${s.valor_cota.toFixed(2)}`,
          s.forma_pagamento,
          statusTxt
        ];
      }
      return [
        (idx + 1).toString(),
        s.nome,
        s.voluntario || 'Não atribuído',
        `R$ ${s.valor_cota.toFixed(2)}`,
        s.forma_pagamento,
        s.status,
        s.video_gravado ? 'Sim' : 'Pendente',
        s.logo_enviada ? 'Sim' : 'Pendente'
      ];
    });

    const headRow = isVolReport
      ? [['#', 'Empresa', 'Voluntário', 'Cota', 'Forma Pgto', 'Status']]
      : [['#', 'Empresa', 'Voluntário', 'Cota', 'Forma Pgto', 'Status', 'Vídeo', 'Logo']];

    const colStyles = isVolReport
      ? {
          0: { cellWidth: 8, halign: 'center' as const },
          1: { cellWidth: 54, fontStyle: 'bold' as const },
          2: { cellWidth: 40 },
          3: { cellWidth: 28, halign: 'right' as const, fontStyle: 'bold' as const },
          4: { cellWidth: 30 },
          5: { cellWidth: 24, halign: 'center' as const },
        }
      : {
          0: { cellWidth: 8, halign: 'center' as const },
          1: { cellWidth: 42, fontStyle: 'bold' as const },
          2: { cellWidth: 32 },
          3: { cellWidth: 22, halign: 'right' as const, fontStyle: 'bold' as const },
          4: { cellWidth: 26 },
          5: { cellWidth: 20, halign: 'center' as const },
          6: { cellWidth: 16, halign: 'center' as const },
          7: { cellWidth: 16, halign: 'center' as const },
        };

    autoTable(doc, {
      startY: currentY,
      head: headRow,
      body: tableBody,
      theme: 'grid',
      headStyles: {
        fillColor: [101, 48, 82], // Brand Plum #653052
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
      },
      styles: {
        fontSize: 8,
        cellPadding: 2,
        textColor: [30, 41, 59],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: colStyles as any,
    });

    // @ts-ignore
    currentY = doc.lastAutoTable?.finalY + 10 || currentY + 40;
  }

  // 5. Se for Financeiro ou Geral, incluir resumo financeiro
  if (reportType === 'financeiro' || (reportType === 'geral' && currentY < 230)) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text('Lançamentos Financeiros (Entradas e Saídas)', 14, currentY);
    currentY += 3;

    const financeBody = data.financeiro.map((f, idx) => [
      (idx + 1).toString(),
      f.tipo,
      f.descricao,
      f.categoria,
      f.data,
      `R$ ${f.valor.toFixed(2)}`,
      f.status
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['#', 'Tipo', 'Descrição', 'Categoria', 'Data', 'Valor', 'Status']],
      body: financeBody,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
      },
      styles: {
        fontSize: 8,
        cellPadding: 2,
        textColor: [30, 41, 59],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },
        1: { cellWidth: 20, fontStyle: 'bold' },
        2: { cellWidth: 50 },
        3: { cellWidth: 30 },
        4: { cellWidth: 24 },
        5: { cellWidth: 26, halign: 'right', fontStyle: 'bold' },
        6: { cellWidth: 24, halign: 'center' },
      },
    });
  }

  // 6. Rodapé em todas as páginas
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184); // Slate-400
    doc.text(
      `Projeto Bom Samaritano • Documento gerado eletronicamente para transparência e controle social • Página ${i} de ${pageCount}`,
      105,
      290,
      { align: 'center' }
    );
  }

  // Salva e faz download do arquivo PDF
  const filename = `Relatorio_Bom_Samaritano_${reportType}_${dateStr.replace(/\//g, '-')}.pdf`;
  doc.save(filename);
  return filename;
}
