import React, { useState } from 'react';
import { Message } from '../types';
import { 
  FileText, Image as ImageIcon, Video as VideoIcon, 
  Download, Trash2, ExternalLink, Share2, Package,
  Music, Archive, Loader2, CheckCircle, Smartphone
} from 'lucide-react';
import { shareToSocial, exportAlbumAsZip, exportToUnifiedArchive } from '../services/exportService';

interface NeuralVaultProps {
  savedMessages: Message[];
  onRemove: (id: string) => void;
}

const NeuralVault: React.FC<NeuralVaultProps> = ({ savedMessages, onRemove }) => {
  const [isPackaging, setIsPackaging] = useState(false);

  const handleExportAlbum = async () => {
    if (savedMessages.length === 0) return;
    setIsPackaging(true);
    await exportAlbumAsZip(savedMessages);
    setIsPackaging(false);
  };
  
  const handleSingleExport = async (msg: Message) => {
    await exportToUnifiedArchive(msg);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 border border-slate-800 p-6 rounded-3xl backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Archive className="w-32 h-32 text-cyan-400" />
        </div>
        
        <div className="flex items-center space-x-4 relative z-10">
          <div className="p-4 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 shadow-lg shadow-cyan-500/10">
            <Archive className="w-8 h-8 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white uppercase tracking-tighter">Neural Archive</h3>
            <p className="text-xs text-slate-500 font-mono">{savedMessages.length} Synaptic Blocks Persistent</p>
          </div>
        </div>

        <div className="flex space-x-2 relative z-10">
          <button 
            onClick={handleExportAlbum}
            disabled={isPackaging || savedMessages.length === 0}
            className={`flex items-center space-x-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${isPackaging ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-xl shadow-cyan-500/20 active:scale-95'}`}
          >
            {isPackaging ? <Loader2 className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />}
            <span>{isPackaging ? 'Synthesizing ZIP...' : 'Export Neural Album (.zip)'}</span>
          </button>
        </div>
      </div>

      {savedMessages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 border border-dashed border-slate-800 rounded-[3rem] bg-slate-900/20">
           <Archive className="w-12 h-12 text-slate-800 mb-4" />
           <p className="text-slate-600 font-mono text-sm uppercase tracking-widest">Archive indexing empty</p>
           <p className="text-[10px] text-slate-700 mt-2 uppercase">Command agents to 'save' output to this vault.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
          {savedMessages.map((msg) => (
            <div key={msg.id} className="group bg-slate-900/60 border border-slate-800 p-5 rounded-[2rem] backdrop-blur-md hover:border-slate-500 transition-all hover:shadow-2xl hover:shadow-cyan-500/5 flex flex-col h-full">
              <div className="flex justify-between items-start mb-5">
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-950 border border-slate-800`}>
                  {msg.mediaType === 'video' ? <VideoIcon className="w-3.5 h-3.5 text-rose-400" /> : 
                   msg.mediaType === 'image' ? <ImageIcon className="w-3.5 h-3.5 text-cyan-400" /> :
                   msg.mediaType === 'audio' ? <Music className="w-3.5 h-3.5 text-fuchsia-400" /> :
                   <FileText className="w-3.5 h-3.5 text-slate-400" />}
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    {msg.mediaType || 'Text'} Logic
                  </span>
                </div>
                <button 
                  onClick={() => onRemove(msg.id)} 
                  className="p-2 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                  title="Remove from Archive"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1">
                {msg.mediaUrl ? (
                  <div className="aspect-video rounded-2xl overflow-hidden bg-black mb-4 relative group/media border border-white/5">
                    {msg.mediaType === 'video' ? (
                      <video className="w-full h-full object-cover"><source src={msg.mediaUrl} /></video>
                    ) : (
                      <img src={msg.mediaUrl} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/media:opacity-100 transition-all duration-300 flex items-center justify-center space-x-3">
                      <a href={msg.mediaUrl} download className="p-4 bg-white text-black rounded-full hover:scale-110 shadow-2xl transition-all"><Download className="w-6 h-6" /></a>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800/50 mb-4 h-36 overflow-hidden relative group/text">
                    <p className="text-[11px] text-slate-400 leading-relaxed font-mono italic">"{msg.content.substring(0, 250)}..."</p>
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950 to-transparent group-hover:from-cyan-950/20 transition-all" />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-auto pt-5 border-t border-slate-800/40">
                <div className="flex space-x-1">
                  <button onClick={() => handleSingleExport(msg)} className="p-2.5 bg-slate-800/50 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-all" title="Export Unified Archive"><Package className="w-4 h-4" /></button>
                  <button onClick={() => shareToSocial(msg)} className="p-2.5 bg-slate-800/50 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all" title="Uplink to Pulse"><Share2 className="w-4 h-4" /></button>
                </div>
                <div className="text-right">
                  <div className="text-[9px] font-black text-slate-600 uppercase">{msg.agentId || 'CORE'}</div>
                  <div className="text-[8px] font-mono text-slate-700">{new Date(msg.timestamp).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NeuralVault;