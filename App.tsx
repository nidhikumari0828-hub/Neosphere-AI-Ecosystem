import React, { useState, useEffect } from 'react';
import { Agent, Message, TrainingProtocol, GroundingSource, User } from './types';
import { AGENTS } from './constants';
import { processUserRequest, generateVideo } from './services/geminiService';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import NetworkViz from './components/NetworkViz';
import EcosystemStats from './components/EcosystemStats';
import LinguisticLab from './components/LinguisticLab';
import NeuralVault from './components/NeuralVault';
import AgentCreator from './components/AgentCreator';
import LoginPortal from './components/LoginPortal';
import BackgroundController from './components/BackgroundController';
import { 
  Menu, LayoutGrid, Activity, Languages, Archive, Cpu, 
  Sparkles, Paintbrush, Square, Grid, Snowflake, Terminal, Sparkles as SparklesIcon 
} from 'lucide-react';

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}

const backgroundThemes = [
    { id: 'solid', name: 'Solid Slate', icon: Square },
    { id: 'grid', name: 'Neural Grid', icon: Grid },
    { id: 'snow', name: 'Cryo Static', icon: Snowflake },
    { id: 'matrix', name: 'Digital Rain', icon: Terminal },
    { id: 'cosmos', name: 'Cosmic Nexus', icon: SparklesIcon },
];

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);
  const [customAgents, setCustomAgents] = useState<Agent[]>(() => {
    const saved = localStorage.getItem('neosphere_custom_agents');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeAgentId, setActiveAgentId] = useState<string>(AGENTS[0].id);
  const [messagesByAgent, setMessagesByAgent] = useState<Record<string, Message[]>>({});
  const [savedMessages, setSavedMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('neosphere_vault');
    return saved ? JSON.parse(saved) : [];
  });
  const [protocols, setProtocols] = useState<TrainingProtocol[]>(() => {
    const saved = localStorage.getItem('neosphere_protocols');
    return saved ? JSON.parse(saved) : [];
  });
  const [view, setView] = useState<'chat' | 'network' | 'stats' | 'lab' | 'vault' | 'creator'>('chat');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number, longitude: number } | undefined>();
  const [backgroundTheme, setBackgroundTheme] = useState<'solid' | 'grid' | 'snow' | 'matrix' | 'cosmos'>(() => {
    return (localStorage.getItem('neosphere_background') as any) || 'solid';
  });
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => console.warn("Geolocation access denied")
      );
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('neosphere_custom_agents', JSON.stringify(customAgents));
  }, [customAgents]);

  useEffect(() => {
    localStorage.setItem('neosphere_vault', JSON.stringify(savedMessages));
  }, [savedMessages]);

  useEffect(() => {
    localStorage.setItem('neosphere_protocols', JSON.stringify(protocols));
  }, [protocols]);

  useEffect(() => {
    localStorage.setItem('neosphere_background', backgroundTheme);
  }, [backgroundTheme]);

  const allAgents = [...AGENTS, ...customAgents];
  const activeAgent = allAgents.find(a => a.id === activeAgentId) || AGENTS[0];
  const currentMessages = messagesByAgent[activeAgentId] || [];

  const handleSendMessage = async (text: string, media?: any, options?: any) => {
    setIsGenerating(true);
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, timestamp: Date.now(), mediaUrl: media ? `data:${media.mimeType};base64,${media.data}` : undefined, mediaType: media?.type, agentId: activeAgentId };
    setMessagesByAgent(prev => ({ ...prev, [activeAgentId]: [...(prev[activeAgentId] || []), userMsg] }));

    try {
      let result;
      if (options?.videoGen) {
        const videoUrl = await generateVideo(text, media, options.imageGen?.ratio || '16:9');
        result = { text: "Neural video synthesis complete. Asset rendered from temporal matrix.", mediaUrl: videoUrl };
      } else {
        result = await processUserRequest(activeAgent, text, media, { ...options, protocol: protocols.find(p => p.isActive) }, customAgents);
      }
      if (!result) throw new Error("Null response from neural core.");
      const modelMsg: Message = { id: (Date.now() + 1).toString(), role: 'model', content: result.text, timestamp: Date.now(), mediaUrl: result.mediaUrl, mediaType: result.mediaUrl ? (options?.videoGen ? 'video' : 'image') : undefined, audioData: result.audioData, groundingSources: result.groundingSources, agentId: activeAgentId };
      setMessagesByAgent(prev => ({ ...prev, [activeAgentId]: [...(prev[activeAgentId] || []), modelMsg] }));
    } catch (error: any) {
      console.error("Agent execution failed:", error);
      const errorMsg: Message = { id: (Date.now() + 1).toString(), role: 'model', content: `**Neural Desync Detected.** \nError Trace: ${error.message || 'Unknown synaptic failure.'}\nAttempting interface recalibration...`, timestamp: Date.now(), agentId: activeAgentId };
      setMessagesByAgent(prev => ({ ...prev, [activeAgentId]: [...(prev[activeAgentId] || []), errorMsg] }));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveMessage = (msg: Message) => { if (!savedMessages.some(m => m.id === msg.id)) setSavedMessages(prev => [...prev, msg]); };

  if (!user) return <LoginPortal onLogin={setUser} />;
  
  return (
    <div className="flex h-screen bg-transparent text-slate-200 overflow-hidden font-sans">
      <BackgroundController theme={backgroundTheme} />
      <Sidebar agents={allAgents} activeAgentId={activeAgentId} onSelectAgent={(id) => { setActiveAgentId(id); setView('chat'); }} isMobileOpen={isMobileOpen} toggleMobile={() => setIsMobileOpen(!isMobileOpen)} user={user} onLogout={() => setUser(null)} />
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <div className="flex-none p-4 flex justify-between items-center bg-slate-950/50 border-b border-slate-800/50 z-30">
          <div className="flex items-center space-x-2">
            <button onClick={() => setIsMobileOpen(true)} className="md:hidden p-2 text-slate-400 hover:text-white"><Menu className="w-6 h-6" /></button>
            <div className="hidden md:flex items-center space-x-1 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
              <Activity className="w-3 h-3 text-cyan-400" /><span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">System Load: 12%</span>
            </div>
          </div>
          <div className="flex bg-slate-900/80 p-1 rounded-2xl border border-slate-800 backdrop-blur-md">
            {[{ id: 'chat', icon: Cpu, label: 'Core' }, { id: 'network', icon: LayoutGrid, label: 'Nodes' }, { id: 'stats', icon: Activity, label: 'Analytics' }, { id: 'lab', icon: Languages, label: 'Lab' }, { id: 'vault', icon: Archive, label: 'Vault' }, { id: 'creator', icon: Sparkles, label: 'Forge' }].map((item) => {
              const Icon = item.icon;
              return <button key={item.id} onClick={() => setView(item.id as any)} className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${view === item.id ? 'bg-white text-black shadow-lg' : 'text-slate-500 hover:text-slate-200'}`}><Icon className="w-4 h-4" /><span className="hidden lg:inline">{item.label}</span></button>;
            })}
          </div>
          <div className="relative">
            <button onClick={() => setShowThemeSelector(!showThemeSelector)} className="p-2 text-slate-400 hover:text-white transition-colors" title="Change Background Theme"><Paintbrush className="w-5 h-5" /></button>
            {showThemeSelector && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95" onMouseLeave={() => setShowThemeSelector(false)}>
                {backgroundThemes.map(theme => {
                  const Icon = theme.icon;
                  return (
                    <button key={theme.id} onClick={() => { setBackgroundTheme(theme.id as any); setShowThemeSelector(false); }} className={`w-full flex items-center space-x-3 text-left px-3 py-2 text-xs rounded-lg transition-colors ${backgroundTheme === theme.id ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-300 hover:bg-slate-800'}`}>
                      <Icon className="w-4 h-4" />
                      <span>{theme.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto relative z-10">
          <div className="h-full p-6">
            {view === 'chat' && <ChatInterface agent={activeAgent} messages={currentMessages} onSendMessage={handleSendMessage} onSaveMessage={handleSaveMessage} isGenerating={isGenerating} userLocation={userLocation} />}
            {view === 'network' && <NetworkViz agents={allAgents} onSelectAgent={(id) => { setActiveAgentId(id); setView('chat'); }} activeAgentId={activeAgentId} />}
            {view === 'stats' && <EcosystemStats agents={allAgents} />}
            {view === 'lab' && <LinguisticLab protocols={protocols} onAddProtocol={(p) => setProtocols([...protocols, p])} onDeleteProtocol={(id) => setProtocols(protocols.filter(p => p.id !== id))} onToggleProtocol={(id) => setProtocols(protocols.map(p => p.id === id ? { ...p, isActive: !p.isActive } : { ...p, isActive: false }))} />}
            {view === 'vault' && <NeuralVault savedMessages={savedMessages} onRemove={(id) => setSavedMessages(savedMessages.filter(m => m.id !== id))} />}
            {view === 'creator' && <AgentCreator onAddAgent={(a) => { setCustomAgents([...customAgents, a]); setActiveAgentId(a.id); setView('chat'); }} />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;