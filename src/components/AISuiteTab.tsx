import React, { useState } from 'react';
import { 
  Sparkles, 
  Video, 
  MessageSquare, 
  FileText, 
  Bot, 
  Send, 
  Copy, 
  Check, 
  ExternalLink, 
  Loader2, 
  Building2, 
  Gift, 
  Printer,
  Share2
} from 'lucide-react';
import { BackupData, Patrocinador, Doador } from '../types';

interface AISuiteTabProps {
  data: BackupData;
  selectedSponsorForVideo: Patrocinador | null;
  selectedEntityForMessage: Patrocinador | Doador | null;
  onUpdateSponsor: (s: Patrocinador) => void;
}

export const AISuiteTab: React.FC<AISuiteTabProps> = ({
  data,
  selectedSponsorForVideo,
  selectedEntityForMessage,
  onUpdateSponsor,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'video' | 'message' | 'report' | 'chat'>('video');

  // Video Script State
  const [videoSponsorId, setVideoSponsorId] = useState<number>(
    selectedSponsorForVideo?.id || data.patrocinadores[0]?.id || 1
  );
  const [videoDuration, setVideoDuration] = useState('30s');
  const [videoTone, setVideoTone] = useState('emocionante e inspirador');
  const [videoScript, setVideoScript] = useState<string>('');
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);
  const [copiedVideo, setCopiedVideo] = useState(false);

  // Message Generator State
  const [msgTargetType, setMsgTargetType] = useState<'patrocinador' | 'doador'>(
    (selectedEntityForMessage && 'valor_cota' in selectedEntityForMessage) ? 'patrocinador' : 'doador'
  );
  const [msgTargetId, setMsgTargetId] = useState<number>(
    selectedEntityForMessage?.id || 1
  );
  const [msgFormat, setMsgFormat] = useState<'whatsapp' | 'email'>('whatsapp');
  const [msgObjective, setMsgObjective] = useState<'agradecimento' | 'cobranca'>('agradecimento');
  const [generatedMessage, setGeneratedMessage] = useState<string>('');
  const [isLoadingMsg, setIsLoadingMsg] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);

  // Transparency Report State
  const [reportType, setReportType] = useState<'completo' | 'instagram'>('completo');
  const [generatedReport, setGeneratedReport] = useState<string>('');
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);

  // Advisor Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: 'Olá! Sou o Assistente e Consultor Social da AI Suite do Projeto Bom Samaritano. Estou analisando todos os registros do nosso banco de dados: 5 patrocinadores (R$ 4.100 em cotas), 5 doadores (18 cestas, roupas, sapatos e brinquedos) e nosso livro financeiro. Como posso ajudar na gestão da campanha hoje?'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Helper current targets
  const currentVideoSponsor = data.patrocinadores.find(s => s.id === videoSponsorId) || data.patrocinadores[0];
  const currentMsgTarget = msgTargetType === 'patrocinador'
    ? data.patrocinadores.find(s => s.id === msgTargetId) || data.patrocinadores[0]
    : data.doadores.find(d => d.id === msgTargetId) || data.doadores[0];

  // Actions
  const handleGenerateVideoScript = async () => {
    if (!currentVideoSponsor) return;
    setIsLoadingVideo(true);
    setCopiedVideo(false);
    try {
      const res = await fetch('/api/ai/generate-video-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sponsor: currentVideoSponsor,
          duration: videoDuration,
          tone: videoTone,
        }),
      });
      const json = await res.json();
      setVideoScript(json.script || 'Não foi possível gerar.');
    } catch {
      setVideoScript('Erro ao contatar o serviço de IA.');
    } finally {
      setIsLoadingVideo(false);
    }
  };

  const handleGenerateMessage = async () => {
    if (!currentMsgTarget) return;
    setIsLoadingMsg(true);
    setCopiedMsg(false);
    try {
      const res = await fetch('/api/ai/generate-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: msgFormat,
          objective: msgObjective,
          target: currentMsgTarget,
          entityType: msgTargetType,
        }),
      });
      const json = await res.json();
      setGeneratedMessage(json.message || '');
    } catch {
      setGeneratedMessage('Erro ao gerar mensagem.');
    } finally {
      setIsLoadingMsg(false);
    }
  };

  const handleGenerateReport = async () => {
    setIsLoadingReport(true);
    setCopiedReport(false);

    const summaryData = {
      projeto: 'Projeto Bom Samaritano',
      regiao: 'Pinheiro, BR-316, Santa Luzia - MA',
      patrocinadores: data.patrocinadores,
      totalPatrociniosRecebidos: data.patrocinadores.filter(p => p.status === 'Recebido').reduce((a, b) => a + b.valor_cota, 0),
      totalPatrociniosPendentes: data.patrocinadores.filter(p => p.status === 'A Receber').reduce((a, b) => a + b.valor_cota, 0),
      doacoesFisicas: data.doadores,
      despesasRealizadas: data.financeiro.filter(f => f.tipo === 'Saída' && f.status === 'Pago'),
      totalDespesasPagas: data.financeiro.filter(f => f.tipo === 'Saída' && f.status === 'Pago').reduce((a, b) => a + b.valor, 0),
      despesasPendentes: data.financeiro.filter(f => f.tipo === 'Saída' && f.status === 'Pendente').reduce((a, b) => a + b.valor, 0),
      contasEmAberto: data.contas.filter(c => c.status === 'Em Aberto'),
    };

    try {
      const res = await fetch('/api/ai/transparency-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summaryData,
          reportType,
        }),
      });
      const json = await res.json();
      setGeneratedReport(json.report || '');
    } catch {
      setGeneratedReport('Erro ao compilar relatório.');
    } finally {
      setIsLoadingReport(false);
    }
  };

  const handleSendChatMessage = async (presetText?: string) => {
    const textToSend = presetText || chatInput;
    if (!textToSend.trim()) return;

    const newMessages = [...chatMessages, { sender: 'user' as const, text: textToSend }];
    setChatMessages(newMessages);
    if (!presetText) setChatInput('');
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/ai/advisor-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          context: {
            patrocinadores: data.patrocinadores,
            doadores: data.doadores,
            financeiro: data.financeiro,
            contas: data.contas,
          },
        }),
      });
      const json = await res.json();
      setChatMessages([...newMessages, { sender: 'ai' as const, text: json.reply || 'Sem resposta.' }]);
    } catch {
      setChatMessages([...newMessages, { sender: 'ai' as const, text: 'Erro ao processar consulta de IA.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openWhatsAppWeb = (phone: string, text: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const fullNumber = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;
    const url = `https://wa.me/${fullNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* AI Suite Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/30 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                AI Suite • Projeto Bom Samaritano
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Recursos de inteligência artificial integrados aos dados do backup: roteirização de vídeos de agradecimento, geração de mensagens de WhatsApp, relatórios de transparência e consultor social.
            </p>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex flex-wrap gap-2 mt-5 border-t border-slate-800/80 pt-4">
          <button
            onClick={() => setActiveSubTab('video')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition ${
              activeSubTab === 'video'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-950/40'
                : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Video className="w-4 h-4" />
            Roteirista de Vídeo (Patrocínios)
          </button>
          <button
            onClick={() => setActiveSubTab('message')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition ${
              activeSubTab === 'message'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-950/40'
                : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Comunicação WhatsApp / E-mail
          </button>
          <button
            onClick={() => setActiveSubTab('report')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition ${
              activeSubTab === 'report'
                ? 'bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-950/40'
                : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            Relatório de Transparência
          </button>
          <button
            onClick={() => setActiveSubTab('chat')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition ${
              activeSubTab === 'chat'
                ? 'bg-indigo-500 text-white font-bold shadow-md shadow-indigo-950/40'
                : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Bot className="w-4 h-4" />
            Consultor Social IA (Chat)
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: ROTEIRISTA DE VÍDEO */}
      {activeSubTab === 'video' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Video className="w-5 h-5 text-amber-400" />
              Configuração do Roteiro
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Selecione o Patrocinador</label>
              <select
                value={videoSponsorId}
                onChange={(e) => setVideoSponsorId(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                {data.patrocinadores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nome} • Cota R$ {s.valor_cota} ({s.observacoes})
                  </option>
                ))}
              </select>
            </div>

            {currentVideoSponsor && (
              <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs space-y-1 text-slate-300">
                <div><strong>Contato:</strong> {currentVideoSponsor.contato}</div>
                <div><strong>Status Pagamento:</strong> {currentVideoSponsor.status}</div>
                <div><strong>Vídeo Gravado:</strong> {currentVideoSponsor.video_gravado ? 'Sim' : 'Ainda não'}</div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Duração do Vídeo</label>
              <select
                value={videoDuration}
                onChange={(e) => setVideoDuration(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="15s">15 segundos (Stories / Status / Reels curto)</option>
                <option value="30s">30 segundos (Reels / Feed / Comercial padrão)</option>
                <option value="60s">60 segundos (Vídeo institucional completo)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Tom da Narrativa</label>
              <select
                value={videoTone}
                onChange={(e) => setVideoTone(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="emocionante e inspirador">Emocionante e Inspirador (Gratidão profunda)</option>
                <option value="dinâmico e jovem">Dinâmico e Moderno (Para redes sociais)</option>
                <option value="institucional e formal">Institucional e Formal (Para TV e Diretoria)</option>
                <option value="alegre e festivo">Alegre e Festivo (Dia do grande evento)</option>
              </select>
            </div>

            <button
              onClick={handleGenerateVideoScript}
              disabled={isLoadingVideo}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-md shadow-amber-950/40"
            >
              {isLoadingVideo ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Gerando Roteiro com IA...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Gerar Roteiro do Vídeo
                </>
              )}
            </button>
          </div>

          {/* Generated Script Display */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="font-bold text-white text-base">Roteiro para Gravação</h4>
                <p className="text-xs text-slate-400">
                  {currentVideoSponsor ? `Empresa: ${currentVideoSponsor.nome} (${videoDuration})` : 'Selecione uma empresa'}
                </p>
              </div>

              {videoScript && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(videoScript, setCopiedVideo)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
                  >
                    {copiedVideo ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedVideo ? 'Copiado!' : 'Copiar'}
                  </button>

                  {currentVideoSponsor && !currentVideoSponsor.video_gravado && (
                    <button
                      onClick={() => {
                        onUpdateSponsor({ ...currentVideoSponsor, video_gravado: true });
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Marcar Gravado
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="flex-1 bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 overflow-y-auto max-h-[500px]">
              {isLoadingVideo ? (
                <div className="h-48 flex flex-col items-center justify-center text-slate-500 gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
                  <span className="text-xs">Escrevendo roteiro cinematográfico e emocionante...</span>
                </div>
              ) : videoScript ? (
                <pre className="whitespace-pre-wrap font-sans text-sm text-slate-200 leading-relaxed">
                  {videoScript}
                </pre>
              ) : (
                <div className="h-48 flex flex-col items-center justify-center text-slate-500 gap-2 text-center p-4">
                  <Video className="w-8 h-8 text-slate-600" />
                  <p className="text-sm font-medium text-slate-400">Nenhum roteiro gerado ainda</p>
                  <p className="text-xs text-slate-500 max-w-sm">
                    Selecione um patrocinador ao lado e clique em &quot;Gerar Roteiro do Vídeo&quot;. A IA criará cenas, falas de locução e orientações visuais.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: COMUNICAÇÃO WHATSAPP / E-MAIL */}
      {activeSubTab === 'message' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              Parâmetros da Mensagem
            </h3>

            {/* Target type selection */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Tipo de Destinatário</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMsgTargetType('patrocinador');
                    setMsgTargetId(data.patrocinadores[0]?.id || 1);
                  }}
                  className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition ${
                    msgTargetType === 'patrocinador'
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  Patrocinador
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMsgTargetType('doador');
                    setMsgTargetId(data.doadores[0]?.id || 1);
                  }}
                  className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition ${
                    msgTargetType === 'doador'
                      ? 'bg-amber-600 text-white border-amber-500'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  <Gift className="w-3.5 h-3.5" />
                  Doador Físico
                </button>
              </div>
            </div>

            {/* Select Target */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Contato Específico</label>
              <select
                value={msgTargetId}
                onChange={(e) => setMsgTargetId(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {msgTargetType === 'patrocinador' ? (
                  data.patrocinadores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nome} • R$ {s.valor_cota} ({s.status})
                    </option>
                  ))
                ) : (
                  data.doadores.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nome} • {d.quantidade} de {d.tipo_doacao} ({d.status})
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Objective */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Finalidade da Mensagem</label>
              <select
                value={msgObjective}
                onChange={(e) => setMsgObjective(e.target.value as 'agradecimento' | 'cobranca')}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="agradecimento">Agradecimento Sincero & Impacto Social</option>
                <option value="cobranca">Lembrete Gentil de Pagamento / Entrega</option>
              </select>
            </div>

            {/* Canal */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Canal de Envio</label>
              <select
                value={msgFormat}
                onChange={(e) => setMsgFormat(e.target.value as 'whatsapp' | 'email')}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="whatsapp">WhatsApp (com emojis e negrito)</option>
                <option value="email">E-mail Formal (com Assunto e Corpo)</option>
              </select>
            </div>

            <button
              onClick={handleGenerateMessage}
              disabled={isLoadingMsg}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-md shadow-emerald-950/40"
            >
              {isLoadingMsg ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Criando Mensagem...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Gerar Mensagem com IA
                </>
              )}
            </button>
          </div>

          {/* Generated Message Display */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="font-bold text-white text-base">Mensagem Pronta para Disparo</h4>
                <p className="text-xs text-slate-400">
                  Destinatário: {currentMsgTarget?.nome} ({currentMsgTarget?.contato})
                </p>
              </div>

              {generatedMessage && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(generatedMessage, setCopiedMsg)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
                  >
                    {copiedMsg ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedMsg ? 'Copiado!' : 'Copiar'}
                  </button>

                  {currentMsgTarget?.contato && msgFormat === 'whatsapp' && (
                    <button
                      onClick={() => openWhatsAppWeb(currentMsgTarget.contato, generatedMessage)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition shadow-sm"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Abrir no WhatsApp
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="flex-1 bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 overflow-y-auto max-h-[500px]">
              {isLoadingMsg ? (
                <div className="h-48 flex flex-col items-center justify-center text-slate-500 gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                  <span className="text-xs">Redigindo mensagem afetuosa e personalizada...</span>
                </div>
              ) : generatedMessage ? (
                <pre className="whitespace-pre-wrap font-sans text-sm text-slate-200 leading-relaxed">
                  {generatedMessage}
                </pre>
              ) : (
                <div className="h-48 flex flex-col items-center justify-center text-slate-500 gap-2 text-center p-4">
                  <MessageSquare className="w-8 h-8 text-slate-600" />
                  <p className="text-sm font-medium text-slate-400">Nenhuma mensagem gerada</p>
                  <p className="text-xs text-slate-500 max-w-sm">
                    Configure os parâmetros e clique em &quot;Gerar Mensagem com IA&quot; para enviar aos parceiros.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: RELATÓRIO DE TRANSPARÊNCIA */}
      {activeSubTab === 'report' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-400" />
              Prestação de Contas & Transparência
            </h3>

            <p className="text-xs text-slate-400">
              Gera automaticamente um relatório consolidado com os dados reais de patrocínios, doações materiais arrecadadas e todas as notas de despesas.
            </p>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Formato do Relatório</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as 'completo' | 'instagram')}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
              >
                <option value="completo">Relatório Institucional Completo (Diretoria / Auditoria)</option>
                <option value="instagram">Resumo Visual e Transparente para Redes Sociais</option>
              </select>
            </div>

            <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/60 text-xs space-y-1.5 text-slate-300">
              <div className="font-semibold text-white">Dados que serão consolidados:</div>
              <div>• 5 Patrocinadores (R$ 3.600 pagos / R$ 500 pendentes)</div>
              <div>• 18 Cestas básicas, 25 roupas, 12 sapatos, 5 brinquedos</div>
              <div>• 10 Registros do Livro Caixa (Despesas pagas e pendentes)</div>
            </div>

            <button
              onClick={handleGenerateReport}
              disabled={isLoadingReport}
              className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-md shadow-teal-950/40"
            >
              {isLoadingReport ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Auditando e Compilando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Gerar Relatório de Transparência
                </>
              )}
            </button>
          </div>

          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="font-bold text-white text-base">Demonstrativo de Impacto e Contas</h4>
                <p className="text-xs text-slate-400">Projeto Bom Samaritano • Transparência Pública</p>
              </div>

              {generatedReport && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(generatedReport, setCopiedReport)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
                  >
                    {copiedReport ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedReport ? 'Copiado!' : 'Copiar Texto'}
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium transition"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Imprimir / PDF
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 bg-slate-950/70 border border-slate-800/80 rounded-xl p-5 overflow-y-auto max-h-[550px]">
              {isLoadingReport ? (
                <div className="h-48 flex flex-col items-center justify-center text-slate-500 gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-teal-400" />
                  <span className="text-xs">Processando balanço contábil e impacto social...</span>
                </div>
              ) : generatedReport ? (
                <div className="prose prose-invert max-w-none text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                  {generatedReport}
                </div>
              ) : (
                <div className="h-48 flex flex-col items-center justify-center text-slate-500 gap-2 text-center p-4">
                  <FileText className="w-8 h-8 text-slate-600" />
                  <p className="text-sm font-medium text-slate-400">Nenhum relatório compilado</p>
                  <p className="text-xs text-slate-500 max-w-sm">
                    Clique em &quot;Gerar Relatório de Transparência&quot; para criar o balanço executivo do projeto.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: CONSULTOR SOCIAL IA (CHAT) */}
      {activeSubTab === 'chat' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Bot className="w-5 h-5 text-indigo-400" />
                Consultor & Assistente Social do Bom Samaritano
              </h3>
              <p className="text-xs text-slate-400">
                Tire dúvidas sobre os números, planeje novas metas, simule custos de cestas básicas ou solicite conselhos estratégicos.
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5 text-xs">
              <button
                onClick={() => handleSendChatMessage('Quanto precisamos arrecadar para atingir a meta de 50 cestas básicas?')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              >
                🎯 Meta de 50 Cestas
              </button>
              <button
                onClick={() => handleSendChatMessage('Quais as contas mais urgentes a pagar e temos saldo suficiente?')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              >
                ⚠️ Contas Críticas
              </button>
              <button
                onClick={() => handleSendChatMessage('Sugira uma ideia de campanha relâmpago para o próximo sábado.')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              >
                💡 Campanha Relâmpago
              </button>
            </div>
          </div>

          {/* Chat Window */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 h-[420px] overflow-y-auto space-y-3">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-2xl px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-none'
                      : 'bg-slate-800 border border-slate-700/80 text-slate-200 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
            {isChatLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0 animate-pulse">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-slate-800 border border-slate-700/80 text-slate-400 px-4 py-2.5 rounded-2xl rounded-bl-none text-xs flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                  Analisando dados do Projeto Bom Samaritano...
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendChatMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Digite sua pergunta sobre doações, finanças ou ideias de ação..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={isChatLoading || !chatInput.trim()}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm flex items-center gap-2 transition disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              Enviar
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
