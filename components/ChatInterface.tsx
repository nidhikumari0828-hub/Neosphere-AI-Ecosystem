
import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Loader2, Mic, MicOff, History, X, 
  Image as ImageIcon, Video as VideoIcon, Globe, ExternalLink,
  Settings, Zap, Users, Plus, Sparkles, Languages,
  Download, Share2, FileText, Presentation, Save,
  Cpu, Twitter, Linkedin, Instagram, Smartphone,
  Volume2, VolumeX, Music as MusicIcon, MapPin, Search, BrainCircuit,
  Film, Package, FileCode, CheckCircle, AlertCircle
} from 'lucide-react';
import { Agent, Message, ImageSize, AspectRatio, TrainingProtocol } from '../types';
import { ICON_MAP, AGENTS } from '../constants';
import { exportToPDF, exportToPPT, exportAlbumAsZip, shareToSocial } from '../services/exportService';
import { playRawAudio } from '../services/audioService';
import { generateSpeech } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface ChatInterfaceProps {
  agent: Agent;
  messages: Message[];
  onSendMessage: (text: string, media?: any, options?: any) => Promise<void>;
  onSaveMessage: (message: Message) => void;
  isGenerating: boolean;
  activeProtocol?: TrainingProtocol;
  userLocation?: { latitude: number, longitude: number };
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ agent, messages, onSendMessage, onSaveMessage, isGenerating, activeProtocol, userLocation }) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [showGenSettings, setShowGenSettings] = useState(false);
  const [showCollabPanel, setShowCollabPanel] = useState(false);
  const [showShareModal, setShowShareModal] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [pendingMedia, setPendingMedia] = useState<any>(null);
  const [collaborators, setCollaborators] = useState<Agent[]>([]);
  const [imageSize, setImageSize] = useState<ImageSize>('1K');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [groundingMode, setGroundingMode] = useState<'none' | 'search' | 'maps'>('none');
  const [useThinking, setUseThinking] = useState(false);
  const [videoGenMode, setVideoGenMode] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const currentAudioSource = useRef<AudioBufferSourceNode | null>(null);
  const lastAutoPlayedId = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (e: any) => {
        let t = '';
        for (let i = 0; i < e.results.length; ++i) t += e.results[i][0].transcript;
        setInput(t);
        if (speechError) setSpeechError(null);
      };

      recognition.onerror = (e: any) => {
        console.error("Speech Recognition Error:", e.error);
        if (e.error === 'no-speech') {
          setSpeechError("Neural sensors detected no vocal input. Please recalibrate and try again.");
          setIsListening(false);
        } else if (e.error === 'not-allowed') {
          setSpeechError("Microphone access denied. Interface permissions required.");
          setIsListening(false);
        }
      };

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
    
    return () => {
      if (currentAudioSource.current) {
        currentAudioSource.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    const lastMsg = messages[messages.length - 1];
    if (
      lastMsg?.role === 'model' && 
      lastMsg.audioData && 
      isVoiceEnabled && 
      lastAutoPlayedId.current !== lastMsg.id
    ) {
       lastAutoPlayedId.current = lastMsg.id;
       handlePlayAudio(lastMsg);
    }
  }, [messages, isVoiceEnabled]);

  const handlePlayAudio = async (msg: Message) => {
    if (currentAudioSource.current) {
      try { currentAudioSource.current.stop(); } catch (e) {}
      currentAudioSource.current = null;
    }

    let data = msg.audioData;
    if (!data) {
      setIsPlaying(msg.id);
      data = await generateSpeech(msg.content, agent.voiceName);
      if (!data) { setIsPlaying(null); return; }
    }
    
    setIsPlaying(msg.id);
    try {
      const source = await playRawAudio(data);
      currentAudioSource.current = source;
      source.onended = () => {
        setIsPlaying(null);
        currentAudioSource.current = null;
      };
    } catch (err) {
      setIsPlaying(null);
    }
  };

  const handleExport = async (type: 'pdf' | 'ppt' | 'zip' | 'x' | 'linkedin') => {
    const msg = messages.find(m => m.id === showShareModal);
    if (!msg) return;

    setIsExporting(type);
    setExportSuccess(false);
    
    try {
      await new Promise(r => setTimeout(r, 1000));
      
      switch (type) {
        case 'pdf': await exportToPDF(msg); break;
        case 'ppt': await exportToPPT(msg); break;
        case 'zip': await exportAlbumAsZip([msg]); break;
        case 'x': await shareToSocial(msg, 'x'); break;
        case 'linkedin': await shareToSocial(msg, 'linkedin'); break;
      }
      
      setExportSuccess(true);
      setTimeout(() => {
        setExportSuccess(false);
        setIsExporting(null);
        setShowShareModal(null);
      }, 1500);
    } catch (err) {
      console.error("Export failure:", err);
      setIsExporting(null);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() && !pendingMedia) return;
    const media = pendingMedia;
    setPendingMedia(null);
    const text = input;
    setInput('');
    setSpeechError(null);
    await onSendMessage(text, media, { 
      imageGen: { size: imageSize, ratio: aspectRatio },
      useThinking,
      useGrounding: groundingMode !== 'none' ? groundingMode : undefined,
      latLng: userLocation,
      videoGen: videoGenMode,
      collaborators: collaborators,
      voiceEnabled: isVoiceEnabled
    });
  };

  const themeColor = agent.color;

  return (
    <div className="flex flex-col h-full bg-slate-950 relative overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-b from-${themeColor}-950/20 to-transparent pointer-events-none transition-colors duration-500`} />

      {/* Neural Broadcast Modal */}
      {showShareModal && (
        <div className="absolute inset-0 z-[60] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
           <div className="bg-slate-900 border border-slate-800 p-10 rounded-[4rem] max-w-2xl w-full shadow-[0_0_150px_rgba(0,0,0,0.8)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
              
              <button onClick={() => !isExporting && setShowShareModal(null)} className="absolute top-10 right-10 p-2 text-slate-500 hover:text-white transition-colors">
                <X className="w-8 h-8" />
              </button>
              
              <div className="mb-12">
                 <div className="flex items-center space-x-3 mb-2">
                    <Share2 className="w-6 h-6 text-cyan-400" />
                    <h3 className="text-4xl font-black text-white uppercase tracking-tighter">Neural Broadcast</h3>
                 </div>
                 <p className="text-xs text-slate-500 font-mono uppercase tracking-[0.3em]">Protocol: Data Extraction // Node: ${showShareModal.substring(0,8)}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Social Uplink Section */}
                 <div className="space-y-4">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Synaptic Pulse (Social)</span>
                    <button 
                      onClick={() => handleExport('x')}
                      disabled={!!isExporting}
                      className="w-full flex items-center justify-between p-5 bg-slate-950 border border-slate-800 rounded-3xl hover:border-cyan-500 hover:bg-slate-900 transition-all group disabled:opacity-50"
                    >
                       <div className="flex items-center space-x-4">
                          <div className="p-3 bg-white/5 rounded-2xl group-hover:text-cyan-400 transition-colors"><Twitter className="w-6 h-6" /></div>
                          <span className="font-black uppercase tracking-widest text-[11px]">Sync to X</span>
                       </div>
                       {isExporting === 'x' && <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />}
                    </button>
                    <button 
                      onClick={() => handleExport('linkedin')}
                      disabled={!!isExporting}
                      className="w-full flex items-center justify-between p-5 bg-slate-950 border border-slate-800 rounded-3xl hover:border-blue-500 hover:bg-slate-900 transition-all group disabled:opacity-50"
                    >
                       <div className="flex items-center space-x-4">
                          <div className="p-3 bg-white/5 rounded-2xl group-hover:text-blue-400 transition-colors"><Linkedin className="w-6 h-6" /></div>
                          <span className="font-black uppercase tracking-widest text-[11px]">Connect LinkedIn</span>
                       </div>
                       {isExporting === 'linkedin' && <Loader2 className="w-4 h-4 animate-spin text-blue-400" />}
                    </button>
                 </div>

                 {/* Document Extraction Section */}
                 <div className="space-y-4">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Physical Extraction (Files)</span>
                    <button 
                      onClick={() => handleExport('pdf')}
                      disabled={!!isExporting}
                      className="w-full flex items-center justify-between p-5 bg-slate-950 border border-slate-800 rounded-3xl hover:border-rose-500 hover:bg-slate-900 transition-all group disabled:opacity-50"
                    >
                       <div className="flex items-center space-x-4">
                          <div className="p-3 bg-white/5 rounded-2xl group-hover:text-rose-400 transition-colors"><FileText className="w-6 h-6" /></div>
                          <span className="font-black uppercase tracking-widest text-[11px]">Print Dossier</span>
                       </div>
                       {isExporting === 'pdf' && <Loader2 className="w-4 h-4 animate-spin text-rose-400" />}
                    </button>
                    <button 
                      onClick={() => handleExport('ppt')}
                      disabled={!!isExporting}
                      className="w-full flex items-center justify-between p-5 bg-slate-950 border border-slate-800 rounded-3xl hover:border-amber-500 hover:bg-slate-900 transition-all group disabled:opacity-50"
                    >
                       <div className="flex items-center space-x-4">
                          <div className="p-3 bg-white/5 rounded-2xl group-hover:text-amber-400 transition-colors"><Presentation className="w-6 h-6" /></div>
                          <span className="font-black uppercase tracking-widest text-[11px]">Gen Presentation</span>
                       </div>
                       {isExporting === 'ppt' && <Loader2 className="w-4 h-4 animate-spin text-amber-400" />}
                    </button>
                    <button 
                      onClick={() => handleExport('zip')}
                      disabled={!!isExporting}
                      className="w-full flex items-center justify-between p-5 bg-slate-950 border border-slate-800 rounded-3xl hover:border-emerald-500 hover:bg-slate-900 transition-all group disabled:opacity-50"
                    >
                       <div className="flex items-center space-x-4">
                          <div className="p-3 bg-white/5 rounded-2xl group-hover:text-emerald-400 transition-colors"><Package className="w-6 h-6" /></div>
                          <span className="font-black uppercase tracking-widest text-[11px]">Package Assets (.zip)</span>
                       </div>
                       {isExporting === 'zip' && <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />}
                    </button>
                 </div>
              </div>

              {isExporting && (
                <div className="mt-12 p-6 bg-slate-950/50 border border-white/5 rounded-3xl flex items-center justify-center space-x-4">
                  {exportSuccess ? (
                    <div className="flex items-center space-x-2 text-emerald-400 animate-in zoom-in duration-300">
                      <CheckCircle className="w-6 h-6" />
                      <span className="font-black uppercase tracking-[0.2em] text-xs">Synthesis Complete // Linked</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3 text-cyan-400 animate-pulse">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="font-black uppercase tracking-[0.2em] text-xs">Calibrating Synaptic Archive...</span>
                    </div>
                  )}
                </div>
              )}
           </div>
        </div>
      )}

      {/* Header */}
      <div className="flex-none p-6 border-b border-slate-800/50 backdrop-blur-xl z-20 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="flex -space-x-3 cursor-pointer group" onClick={() => setShowCollabPanel(true)}>
            <div className={`p-3 rounded-2xl bg-${themeColor}-500/10 border border-${themeColor}-500/30 shadow-lg relative z-30 group-hover:scale-110 transition-transform`}><Icon icon={agent.icon} className={`w-6 h-6 text-${themeColor}-400`} /></div>
            {collaborators.map((c, i) => <div key={c.id} style={{ zIndex: 20 - i }} className={`p-3 rounded-2xl bg-${c.color}-500/10 border border-${c.color}-500/30 backdrop-blur-md group-hover:translate-x-2 transition-all`}><Icon icon={c.icon} className={`w-6 h-6 text-${c.color}-400`} /></div>)}
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-white transition-all"><Plus className="w-4 h-4" /></div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white tracking-tight">{collaborators.length > 0 ? 'Neural Collaborative' : agent.name}</h2>
              {isVoiceEnabled && <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-[8px] font-black text-cyan-400 uppercase tracking-[0.2em] animate-pulse"><Volume2 className="w-2 h-2" /> Voice Synced</div>}
            </div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2 animate-pulse" />Uplink Established</span>
          </div>
        </div>
        <div className="flex space-x-2">
          <button onClick={() => setGroundingMode(groundingMode === 'search' ? 'none' : 'search')} className={`p-2.5 border rounded-xl transition-all ${groundingMode === 'search' ? 'bg-blue-500/20 border-blue-500 text-blue-400 shadow-lg' : 'bg-slate-900 border-slate-700 text-slate-400'}`} title="Search Grounding"><Search className="w-5 h-5" /></button>
          <button onClick={() => setGroundingMode(groundingMode === 'maps' ? 'none' : 'maps')} className={`p-2.5 border rounded-xl transition-all ${groundingMode === 'maps' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-lg' : 'bg-slate-900 border-slate-700 text-slate-400'}`} title="Maps Grounding"><MapPin className="w-5 h-5" /></button>
          <button onClick={() => setUseThinking(!useThinking)} className={`p-2.5 border rounded-xl transition-all ${useThinking ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400 shadow-lg' : 'bg-slate-900 border-slate-700 text-slate-400'}`} title="Deep Thinking Mode"><BrainCircuit className="w-5 h-5" /></button>
          <button onClick={() => setVideoGenMode(!videoGenMode)} className={`p-2.5 border rounded-xl transition-all ${videoGenMode ? 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-lg' : 'bg-slate-900 border-slate-700 text-slate-400'}`} title="Veo Video Gen"><Film className="w-5 h-5" /></button>
          <button onClick={() => setIsVoiceEnabled(!isVoiceEnabled)} className={`p-2.5 border rounded-xl transition-all ${isVoiceEnabled ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-slate-900 border-slate-700 text-slate-400'}`}>{isVoiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}</button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide relative">
        {speechError && (
          <div className="sticky top-4 left-0 right-0 z-50 flex justify-center animate-in slide-in-from-top-4 duration-300">
            <div className="bg-slate-900/90 backdrop-blur-xl border border-rose-500/50 p-4 rounded-2xl shadow-[0_0_30px_rgba(244,63,94,0.2)] flex items-center justify-between max-w-md w-full">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-rose-500/20 rounded-lg"><MicOff className="w-5 h-5 text-rose-400" /></div>
                <div>
                  <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Spectral Failure</p>
                  <p className="text-[11px] text-slate-300 font-medium">{speechError}</p>
                </div>
              </div>
              <button onClick={() => setSpeechError(null)} className="p-2 text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
            <div className={`max-w-[85%] rounded-[2rem] p-6 shadow-2xl border ${msg.role === 'user' ? 'bg-slate-900 border-slate-800 text-slate-100 rounded-br-none' : `bg-${themeColor}-900/10 border-${themeColor}-500/20 text-slate-200 rounded-bl-none backdrop-blur-md relative`}`}>
              
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
              
              {msg.mediaUrl && (
                <div className="mt-4 rounded-2xl overflow-hidden border border-white/10 relative group/media shadow-2xl">
                  {msg.mediaType === 'video' ? <video controls className="w-full bg-black aspect-video"><source src={msg.mediaUrl} /></video> : <img src={msg.mediaUrl} className="w-full h-auto" />}
                </div>
              )}

              {msg.groundingSources && msg.groundingSources.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {msg.groundingSources.map((source, i) => (
                    <a key={i} href={source.uri} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] text-cyan-400 hover:bg-white/10 transition-all">
                      <Globe className="w-3 h-3" />
                      <span>{source.title || 'Grounding Source'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ))}
                </div>
              )}
              
              {msg.role === 'model' && (
                <div className="mt-6 pt-5 border-t border-white/5 flex flex-wrap gap-2 justify-between items-center">
                  <div className="flex gap-2">
                    <button onClick={() => handlePlayAudio(msg)} className={`p-2.5 rounded-xl border transition-all ${isPlaying === msg.id ? 'bg-cyan-500 text-white border-cyan-400' : 'bg-white/5 text-slate-400 border-transparent hover:text-cyan-400'}`}>
                      {isPlaying === msg.id ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <Volume2 className="w-4.5 h-4.5" />}
                    </button>
                    <button onClick={() => onSaveMessage(msg)} className="p-2.5 bg-white/5 rounded-xl text-slate-400 hover:text-amber-400 transition-all"><Save className="w-4.5 h-4.5" /></button>
                  </div>
                  <button onClick={() => setShowShareModal(msg.id)} className="flex items-center space-x-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-slate-400 hover:text-white transition-all">
                    <Share2 className="w-3.5 h-3.5" />
                    <span className="tracking-widest uppercase">Broadcast</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {isGenerating && (
          <div className="flex justify-start animate-pulse">
             <div className={`bg-${themeColor}-950/40 rounded-2xl p-5 border border-${themeColor}-500/30 flex items-center space-x-3`}>
               <Loader2 className={`w-5 h-5 animate-spin text-${themeColor}-400`} />
               <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">
                 Synthesizing Neural Matrix...
               </span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-none p-6 bg-slate-900/40 backdrop-blur-3xl border-t border-slate-800/50">
        <div className="max-w-5xl mx-auto">
          {showGenSettings && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-slate-950/80 rounded-[2rem] border border-slate-800 mb-4 animate-in slide-in-from-bottom-2 shadow-2xl">
              <div className="space-y-2"><span className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Resolution</span><div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">{['1K', '2K', '4K'].map(s => <button key={s} onClick={() => setImageSize(s as any)} className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${imageSize === s ? 'bg-white text-black' : 'text-slate-500'}`}>{s}</button>)}</div></div>
              <div className="space-y-2"><span className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Aspect Ratio</span><div className="flex flex-wrap gap-1">{['1:1', '16:9', '9:16', '4:3', '3:4', '21:9'].map(r => <button key={r} onClick={() => setAspectRatio(r as any)} className={`px-3 py-1.5 text-[10px] font-black border rounded-lg transition-all ${aspectRatio === r ? 'border-white text-white bg-white/5' : 'border-slate-800 text-slate-500'}`}>{r}</button>)}</div></div>
            </div>
          )}
          
          {pendingMedia && (
            <div className="mb-4 flex items-center p-3 bg-slate-950 border border-slate-800 rounded-2xl animate-in zoom-in-95">
               <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mr-3">
                 {pendingMedia.type === 'video' ? <VideoIcon className="w-6 h-6 text-rose-400" /> : pendingMedia.type === 'audio' ? <MusicIcon className="w-6 h-6 text-fuchsia-400" /> : <ImageIcon className="w-6 h-6 text-cyan-400" />}
               </div>
               <div className="flex-1">
                 <p className="text-xs font-bold text-white uppercase tracking-tight">{pendingMedia.type} Uplink Pending</p>
                 <p className="text-[10px] text-slate-500">{pendingMedia.mimeType}</p>
               </div>
               <button onClick={() => setPendingMedia(null)} className="p-2 text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
          )}

          <div className="flex items-center space-x-4">
             <div className="flex-1 relative group">
                <input 
                  type="text" 
                  value={input} 
                  onChange={e => setInput(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()} 
                  placeholder={isListening ? "Synchronizing voice patterns..." : (speechError ? "Neural signal lost. Retry?" : (videoGenMode ? "Describe video sequence..." : "Give a command..."))} 
                  className={`w-full bg-slate-950 border border-slate-800 rounded-[2rem] px-14 py-6 focus:ring-2 focus:ring-${themeColor}-500/40 focus:border-${themeColor}-500/50 text-slate-100 outline-none transition-all ${speechError ? 'placeholder-rose-500/50' : ''}`} 
                />
                <button onClick={() => fileInputRef.current?.click()} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white" title="Attach Neural Asset"><ImageIcon className="w-6 h-6" /></button>
                <button onClick={() => setShowGenSettings(!showGenSettings)} className={`absolute right-5 top-1/2 -translate-y-1/2 transition-all ${showGenSettings ? `text-${themeColor}-400 rotate-90` : 'text-slate-600 hover:text-white'}`} title="Advanced Synthesis"><Settings className="w-6 h-6" /></button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*,audio/*" onChange={e => {
                  const file = e.target.files?.[0]; if (file) {
                    const r = new FileReader(); r.onload = () => setPendingMedia({ data: (r.result as string).split(',')[1], mimeType: file.type, type: file.type.startsWith('video') ? 'video' : (file.type.startsWith('audio') ? 'audio' : 'image') }); r.readAsDataURL(file);
                  }
                }} />
             </div>
             <button onClick={() => isListening ? recognitionRef.current.stop() : recognitionRef.current.start()} className={`p-6 rounded-[2rem] border transition-all ${isListening ? 'bg-rose-500 border-rose-400 text-white animate-pulse ring-4 ring-rose-500/30' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
               {isListening ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
             </button>
             <button onClick={() => handleSubmit()} disabled={isGenerating || (!input.trim() && !pendingMedia)} className={`p-6 rounded-[2rem] transition-all ${isGenerating || (!input.trim() && !pendingMedia) ? 'bg-slate-900 text-slate-700 cursor-not-allowed' : `bg-cyan-600 text-white hover:bg-cyan-500 shadow-2xl shadow-cyan-500/20 active:scale-95`}`}>
               {isGenerating ? <Loader2 className="w-7 h-7 animate-spin" /> : <Sparkles className="w-7 h-7" />}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Icon = ({ icon, className }: { icon?: string, className?: string }) => {
  const IconComponent = icon && ICON_MAP[icon] ? ICON_MAP[icon] : Cpu;
  return <IconComponent className={className} />;
};

export default ChatInterface;
