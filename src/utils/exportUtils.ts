import * as XLSX from 'xlsx';
import { BackupData } from '../types';

export function exportFullExcel(data: BackupData) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Patrocinadores
  const wsPatrocinadores = XLSX.utils.json_to_sheet(data.patrocinadores);
  XLSX.utils.book_append_sheet(wb, wsPatrocinadores, 'Patrocinadores');

  // Sheet 2: Doadores
  const wsDoadores = XLSX.utils.json_to_sheet(data.doadores);
  XLSX.utils.book_append_sheet(wb, wsDoadores, 'Doadores');

  // Sheet 3: Financeiro
  const wsFinanceiro = XLSX.utils.json_to_sheet(data.financeiro);
  XLSX.utils.book_append_sheet(wb, wsFinanceiro, 'Financeiro');

  // Sheet 4: Contas
  const wsContas = XLSX.utils.json_to_sheet(data.contas);
  XLSX.utils.book_append_sheet(wb, wsContas, 'Contas');

  // Sheet 5: Usuarios
  const wsUsuarios = XLSX.utils.json_to_sheet(data.users);
  XLSX.utils.book_append_sheet(wb, wsUsuarios, 'Usuarios');

  // Download XLSX file
  XLSX.writeFile(wb, `Projeto_Bom_Samaritano_Atualizado_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportCSV(items: unknown[], filename: string) {
  const ws = XLSX.utils.json_to_sheet(items);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
