
import React, { useState, useRef } from 'react';
import { Agent, AgentCategory } from '../types';
import { 
  Bot, Sparkles, Cpu, Music, Video, PenTool, GraduationCap, 
  BarChart, Heart, Gamepad, Shield, Zap, Activity,
  Briefcase, FileText, Info, Loader2, Mic, CheckCircle, Volume2
} from 'lucide-react';

interface AgentCreatorProps {
  onAddAgent: (agent: Agent) => void;
}

const ICONS = [
  'Bot', 'Cpu', 'Music', 'Video', 'PenTool', 'GraduationCap', 
  'BarChart', 'Heart', 'Gamepad', 'Shield', 'Zap', 'Activity',
  'Briefcase', 'FileText'
];

const COLORS = [
  'cyan', 'indigo', 'blue', 'teal', 'emerald', 
  'amber', 'orange', 'rose', 'pink', 'fuchsia', 'violet'
];

const VOICES: ('Kore' | 'Puck' | 'Charon' | 'Zephyr' | 'Fenrir')[] = [
  'Zephyr', 'Kore', 'Puck', 'Charon', 'Fenrir'
];

const ICON_COMPONENTS: Record<string, any> = {
  Bot, Cpu, Music, Video, PenTool, GraduationCap, 
  BarChart, Heart, Gamepad, Shield, Zap, Activity,
  Briefcase, FileText
};

const AgentCreator: React.FC<AgentCreatorProps> = ({ onAddAgent }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<AgentCategory>(AgentCategory.SPECIALIZED);
  const [icon, setIcon] = useState('Bot');
  const [color, setColor] = useState('indigo');
  const [voiceName, setVoiceName] = useState<any>('Zephyr');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [isInitializing, setIsInitializing] = useState(false);
  
  // Voice Cloning State
  const [voiceSample, setVoiceSample] = useState<{ data: string, name: string } | null>(null);
  const [isAnalyzingVoice, setIsAnalyzingVoice] = useState(false);
  const [voiceCloneStatus, setVoiceCloneStatus] = useState<'none' | 'analyzed' | 'cloned'>('none');
  const voiceInputRef = useRef<HTMLInputElement>(null);

  const handleVoiceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsAnalyzingVoice(true);
      const reader = new FileReader();
      reader.onload = () => {
        setTimeout(() => {
          setVoiceSample({ data: reader.result as string, name: file.name });
          setIsAnalyzingVoice(false);
          setVoiceCloneStatus('analyzed');
        }, 2000); // Simulate neural analysis
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCloneVoice = () => {
    setIsAnalyzingVoice(true);
    setTimeout(() => {
      // Map the custom voice to the "closest" neural frequency (mocked)
      const mockFrequencies = VOICES;
      const randomClosest = mockFrequencies[Math.floor(Math.random() * mockFrequencies.length)];
      setVoiceName(randomClosest);
      setIsAnalyzingVoice(false);
      setVoiceCloneStatus('cloned');
    }, 3000);
  };

  const handleCreate = () => {
    if (!name.trim() || !systemPrompt.trim()) return;
    
    setIsInitializing(true);
    
    // Neural synthesis simulation
    setTimeout(() => {
      const newAgent: Agent = {
        id: `custom-${Date.now()}`,
        name: name.trim(),
        description: description.trim() || 'Custom initialized sub-agent.',
        category,
        icon,
        color,
        voiceName,
        systemPrompt: systemPrompt.trim(),
        capabilities: ['Custom Logic', 'Synaptic Adaptation', ...(voiceCloneStatus === 'cloned' ? ['Cloned Vocal Profile'] : [])],
        voiceSampleUrl: voiceSample?.data,
        isCustomVoice: voiceCloneStatus === 'cloned'
      };
      
      onAddAgent(newAgent);
      setIsInitializing(false);
    }, 2500);
  };

  const SelectedIcon = ICON_COMPONENTS[icon] || Bot;

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="bg-slate-900/60 border border-slate-800 rounded-[3rem] overflow-hidden shadow-2xl backdrop-blur-xl">
        {/* Header Preview */}
        <div className={`p-10 border-b border-slate-800 bg-gradient-to-br from-${color}-500/10 to-transparent relative`}>
          <div className="flex items-center space-x-6 relative z-10">
            <div className={`p-6 rounded-[2rem] bg-${color}-500/20 border border-${color}-500/40 text-${color}-400 shadow-2xl shadow-${color}-500/10 animate-pulse`}>
              <SelectedIcon className="w-12 h-12" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-1">
                {name || 'Synthesizing...'}
              </h2>
              <p className="text-xs text-slate-500 font-mono uppercase tracking-[0.2em]">
                {category} // {voiceCloneStatus === 'cloned' ? 'Neural Clone Frequency' : `${voiceName} Frequency`}
              </p>
            </div>
          </div>
          <div className="absolute top-10 right-10 text-slate-800">
            <Cpu className="w-24 h-24" />
          </div>
        </div>

        <div className="p-10 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Identity */}
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Codename</label>
                <input 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. AVALON-9"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white placeholder-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Function Description</label>
                <input 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Neural sub-system for..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white placeholder-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Strategic Category</label>
                <select 
                  value={category}
                  onChange={e => setCategory(e.target.value as AgentCategory)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all appearance-none"
                >
                  {Object.values(AgentCategory).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Aesthetics & Voice */}
            <div className="space-y-6">
               <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 ml-1">Synaptic Hue</label>
                  <div className="grid grid-cols-6 gap-2">
                    {COLORS.map(c => (
                      <button 
                        key={c} 
                        onClick={() => setColor(c)}
                        className={`w-full aspect-square rounded-xl border-2 transition-all ${color === c ? `bg-${c}-500 border-white scale-110 shadow-lg shadow-${c}-500/20` : `bg-${c}-950/40 border-slate-800 hover:border-slate-600`}`}
                      />
                    ))}
                  </div>
               </div>
               
               {/* Voice Cloning Module */}
               <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Vocal Uplink (Voice Cloning)</label>
                    <div className="flex items-center space-x-1">
                       <div className={`w-1.5 h-1.5 rounded-full ${voiceCloneStatus === 'cloned' ? 'bg-green-500 animate-pulse' : 'bg-slate-700'}`} />
                       <span className="text-[8px] font-mono text-slate-500 uppercase">{voiceCloneStatus === 'cloned' ? 'Cloned' : 'Standard'}</span>
                    </div>
                  </div>

                  {!voiceSample ? (
                    <button 
                      onClick={() => voiceInputRef.current?.click()}
                      className="w-full py-4 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-600 hover:border-indigo-500 hover:text-indigo-400 transition-all group"
                    >
                      {isAnalyzingVoice ? (
                        <Loader2 className="w-6 h-6 animate-spin mb-2" />
                      ) : (
                        <Mic className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
                      )}
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        {isAnalyzingVoice ? 'Analyzing Spectral Data...' : 'Upload Voice Sample'}
                      </span>
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-xl">
                        <div className="flex items-center space-x-3 truncate">
                          <div className="p-2 bg-indigo-500/20 rounded-lg"><Volume2 className="w-4 h-4 text-indigo-400" /></div>
                          <span className="text-[10px] font-mono text-slate-300 truncate">{voiceSample.name}</span>
                        </div>
                        <button onClick={() => { setVoiceSample(null); setVoiceCloneStatus('none'); }} className="p-1 hover:text-rose-400"><Trash2 className="w-4 h-4" /></button>
                      </div>

                      {voiceCloneStatus === 'analyzed' && (
                        <button 
                          onClick={handleCloneVoice}
                          disabled={isAnalyzingVoice}
                          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center space-x-2 shadow-lg shadow-indigo-500/20"
                        >
                          {isAnalyzingVoice ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                          <span>Initiate Neural Cloning</span>
                        </button>
                      )}

                      {voiceCloneStatus === 'cloned' && (
                        <div className="flex items-center justify-center space-x-2 py-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-[10px] font-bold uppercase tracking-widest">
                          <CheckCircle className="w-3 h-3" />
                          <span>Voice Profile Matched</span>
                        </div>
                      )}
                    </div>
                  )}
                  <input type="file" ref={voiceInputRef} className="hidden" accept="audio/*" onChange={handleVoiceUpload} />
               </div>

               <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Manual Frequency Override</label>
                <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
                  {VOICES.map(v => (
                    <button 
                      key={v} 
                      onClick={() => { setVoiceName(v); setVoiceCloneStatus('none'); }}
                      className={`flex-1 py-3 text-[10px] font-black rounded-xl transition-all ${voiceName === v && voiceCloneStatus !== 'cloned' ? 'bg-white text-black shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Neural Blueprint */}
          <div className="relative">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1 flex justify-between">
              <span>Synaptic Blueprint (System Prompt)</span>
              <span className="text-indigo-400 animate-pulse flex items-center"><Info className="w-3 h-3 mr-1" /> Core Identity Rules</span>
            </label>
            <textarea 
              value={systemPrompt}
              onChange={e => setSystemPrompt(e.target.value)}
              placeholder="Define the agent's behavior, tone, and constraints..."
              rows={6}
              className="w-full bg-slate-950 border border-slate-800 rounded-3xl px-8 py-6 text-slate-200 placeholder-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all font-mono text-sm leading-relaxed"
            />
          </div>

          {/* Action */}
          <button 
            onClick={handleCreate}
            disabled={isInitializing || !name.trim() || !systemPrompt.trim()}
            className={`w-full py-8 rounded-[2rem] font-black uppercase tracking-[0.3em] text-sm flex items-center justify-center space-x-4 transition-all ${isInitializing || !name.trim() || !systemPrompt.trim() ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-white text-black hover:scale-[1.02] shadow-2xl active:scale-95'}`}
          >
            {isInitializing ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Integrating Synapses...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6" />
                <span>Initialize Neural Agent</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const Trash2 = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
);

export default AgentCreator;
