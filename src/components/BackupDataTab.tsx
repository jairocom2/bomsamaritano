import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  RotateCcw, 
  Upload, 
  Archive
} from 'lucide-react';
import { BackupData } from '../types';
import { exportFullExcel, exportCSV } from '../utils/exportUtils';
import * as XLSX from 'xlsx';

interface BackupDataTabProps {
  data: BackupData;
  onResetOriginal: () => void;
  onLoadCustomData: (data: BackupData) => void;
}

export const BackupDataTab: React.FC<BackupDataTabProps> = ({
  data,
  onResetOriginal,
  onLoadCustomData,
}) => {
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const buffer = event.target?.result;
        const workbook = XLSX.read(buffer, { type: 'binary' });

        const updatedData: BackupData = { ...data };

        if (workbook.Sheets['Patrocinadores']) {
          updatedData.patrocinadores = XLSX.utils.sheet_to_json(workbook.Sheets['Patrocinadores']);
        }
        if (workbook.Sheets['Doadores']) {
          updatedData.doadores = XLSX.utils.sheet_to_json(workbook.Sheets['Doadores']);
        }
        if (workbook.Sheets['Financeiro']) {
          updatedData.financeiro = XLSX.utils.sheet_to_json(workbook.Sheets['Financeiro']);
        }
        if (workbook.Sheets['Contas']) {
          updatedData.contas = XLSX.utils.sheet_to_json(workbook.Sheets['Contas']);
        }

        onLoadCustomData(updatedData);
        setImportStatus(`Planilha "${file.name}" importada com sucesso!`);
        setTimeout(() => setImportStatus(null), 4000);
      } catch {
        setImportStatus('Erro ao importar. Certifique-se de que é um arquivo Excel válido.');
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
            Planilha e Backup
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Baixe o arquivo Excel (.xlsx) com todos os dados atualizados ou restaure o original.
          </p>
        </div>

        <button
          onClick={() => exportFullExcel(data)}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-xs"
        >
          <Download className="w-4 h-4" />
          <span>Baixar Excel Completo (.xlsx)</span>
        </button>
      </div>

      {/* Opções */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {/* Opção 1: Planilha Excel */}
        <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-xl shadow-xs space-y-2.5">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
            <FileSpreadsheet className="w-5 h-5" />
            Exportar em Excel
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Gera o arquivo <strong>.xlsx</strong> contendo abas separadas para Patrocinadores, Financeiro e Contas.
          </p>
          <button
            onClick={() => exportFullExcel(data)}
            className="w-full py-2 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition border border-slate-200"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            Baixar .xlsx
          </button>
        </div>

        {/* Opção 2: CSVs */}
        <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-xl shadow-xs space-y-2.5">
          <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
            <Archive className="w-5 h-5" />
            Exportar em CSV
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Baixe as tabelas em formato CSV para visualização em qualquer planilha.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => exportCSV(data.patrocinadores, 'patrocinadores_bom_samaritano')}
              className="flex-1 py-1.5 px-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 transition"
            >
              CSV Patrocinadores
            </button>
            <button
              onClick={() => exportCSV(data.financeiro, 'financeiro_bom_samaritano')}
              className="flex-1 py-1.5 px-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 transition"
            >
              CSV Finanças
            </button>
          </div>
        </div>

        {/* Opção 3: Restaurar Dados Originais */}
        <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-xl shadow-xs space-y-2.5">
          <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
            <RotateCcw className="w-5 h-5 text-teal-600" />
            Restaurar Backup Original
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Restaura o sistema de volta aos dados exatos enviados nas planilhas de outubro/2025.
          </p>
          <button
            onClick={onResetOriginal}
            className="w-full py-2 px-3 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restaurar Estado Inicial
          </button>
        </div>
      </div>

      {/* Importar Planilha */}
      <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-xl shadow-xs space-y-3">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Upload className="w-4 h-4 text-slate-500" />
          Importar Nova Planilha (.xlsx ou .csv)
        </h3>
        <p className="text-xs text-slate-500">
          Você pode subir uma nova planilha atualizada caso tenha feito alterações externas.
        </p>

        <div>
          <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold cursor-pointer transition">
            <Upload className="w-4 h-4 text-emerald-600" />
            <span>Selecionar Arquivo no Dispositivo</span>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          {importStatus && (
            <p className="text-xs text-emerald-600 mt-2 font-medium">{importStatus}</p>
          )}
        </div>
      </div>
    </div>
  );
};
