
import React, { useState } from 'react';
import { TrainingProtocol } from '../types';
import { Brain, Sparkles, Plus, Trash2, CheckCircle2, Languages, Terminal } from 'lucide-react';

interface LinguisticLabProps {
  protocols: TrainingProtocol[];
  onAddProtocol: (p: TrainingProtocol) => void;
  onDeleteProtocol: (id: string) => void;
  onToggleProtocol: (id: string) => void;
}

const LinguisticLab: React.FC<LinguisticLabProps> = ({ protocols, onAddProtocol, onDeleteProtocol, onToggleProtocol }) => {
  const [isTraining, setIsTraining] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRules, setNewRules] = useState('');
  const [newSamples, setNewSamples] = useState('');

  const handleTrain = () => {
    if (!newName.trim()) return;
    setIsTraining(true);
    
    // Simulate "Neural Calibration"
    setTimeout(() => {
      onAddProtocol({
        id: Date.now().toString(),
        name: newName,
        rules: newRules,
        samples: newSamples,
        isActive: true
      });
      setNewName('');
      setNewRules('');
      setNewSamples('');
      setIsTraining(false);
    }, 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Training Module */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Brain className="w-24 h-24 text-cyan-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-cyan-400" />
            Neural Training
          </h3>
          <p className="text-xs text-slate-500 mb-6 font-mono leading-relaxed uppercase tracking-tighter">
            Calibrate Neosphere with new linguistic protocols or custom dialects.
          </p>
          
          <div className="space-y-4 relative z-10">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Protocol Name</label>
              <input 
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="e.g. Neo-Sanskrit, Pirate Dialect" 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-cyan-500/40 outline-none transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Syntactic Rules</label>
              <textarea 
                value={newRules}
                onChange={e => setNewRules(e.target.value)}
                placeholder="How should the AI form sentences?" 
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-cyan-500/40 outline-none transition-all resize-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Samples (Few-Shot Training)</label>
              <textarea 
                value={newSamples}
                onChange={e => setNewSamples(e.target.value)}
                placeholder="User: Hello -> AI: [Translation]" 
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-cyan-500/40 outline-none transition-all resize-none"
              />
            </div>
            
            <button 
              onClick={handleTrain}
              disabled={isTraining || !newName.trim()}
              className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center space-x-2 transition-all ${isTraining || !newName.trim() ? 'bg-slate-800 text-slate-600' : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/20'}`}
            >
              {isTraining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Terminal className="w-4 h-4" />}
              <span>{isTraining ? 'Calibrating Neural Matrix...' : 'Start Training'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Protocols */}
      <div className="lg:col-span-2 space-y-6">
        <h3 className="text-lg font-bold text-white flex items-center">
          <Languages className="w-5 h-5 mr-2 text-fuchsia-400" />
          Indexed Protocols
        </h3>
        
        {protocols.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 border border-dashed border-slate-800 rounded-3xl bg-slate-900/20">
             <Plus className="w-8 h-8 text-slate-700 mb-2" />
             <p className="text-xs text-slate-600 font-mono">No custom linguistic models registered.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {protocols.map((p) => (
              <div key={p.id} className={`group bg-slate-900/60 border p-5 rounded-2xl backdrop-blur-md transition-all ${p.isActive ? 'border-fuchsia-500/50 shadow-[0_0_15px_rgba(217,70,239,0.1)]' : 'border-slate-800 opacity-60'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className={`w-4 h-4 ${p.isActive ? 'text-fuchsia-400' : 'text-slate-700'}`} />
                    <span className="text-sm font-bold text-white">{p.name}</span>
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => onToggleProtocol(p.id)} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors">
                      {p.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => onDeleteProtocol(p.id)} className="p-1.5 rounded-lg bg-slate-800 text-rose-500 hover:bg-rose-500 hover:text-white transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                   <div>
                     <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Rules</span>
                     <p className="text-[11px] text-slate-300 line-clamp-2">{p.rules}</p>
                   </div>
                   <div className="h-px bg-slate-800 w-full" />
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] text-fuchsia-400 font-mono">READY FOR UPLINK</span>
                      <span className="text-[10px] text-slate-600">v1.0.0</span>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const Loader2 = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/></svg>
);

export default LinguisticLab;
