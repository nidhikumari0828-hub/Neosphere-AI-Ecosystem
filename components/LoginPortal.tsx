
import React, { useState } from 'react';
import { Cpu, Shield, Zap, Fingerprint, Key, User, ArrowRight, Loader2, Info, Globe } from 'lucide-react';
import { User as UserType } from '../types';

interface LoginPortalProps {
  onLogin: (user: UserType) => void;
}

// Custom Google Icon for brand accuracy
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const LoginPortal: React.FC<LoginPortalProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'selection' | 'login'>('selection');
  const [neuralId, setNeuralId] = useState('');
  const [accessKey, setAccessKey] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('Synchronizing Neural Patterns...');

  const handleGuestLogin = () => {
    setIsSyncing(true);
    setSyncMessage('Opening Ghost Channel...');
    setTimeout(() => {
      onLogin({
        id: `GUEST-${Math.floor(Math.random() * 10000)}`,
        name: 'Guest Operative',
        isGuest: true
      });
    }, 1500);
  };

  const handleGoogleLogin = () => {
    setIsSyncing(true);
    setSyncMessage('Connecting to Google Neural Cloud...');
    // Simulate OAuth interaction
    setTimeout(() => {
      setSyncMessage('Extracting Google Profile Data...');
      setTimeout(() => {
        onLogin({
          id: 'GOOG-7721-LNK',
          name: 'Alex Rivera', // Simulated Google User
          isGuest: false,
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'
        });
      }, 1500);
    }, 1200);
  };

  const handleUserLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!neuralId || !accessKey) return;
    setIsSyncing(true);
    setSyncMessage('Validating Synaptic Credentials...');
    setTimeout(() => {
      onLogin({
        id: 'USER-01-ALPHA',
        name: neuralId,
        isGuest: false
      });
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-[#020617] flex items-center justify-center p-6 overflow-hidden">
      {/* Background Neural Matrix */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute top-1/4 left-1/3 w-[400px] h-[400px] bg-fuchsia-500/10 blur-[100px] rounded-full" />
        <div className="grid grid-cols-12 gap-4 h-full w-full opacity-10">
          {[...Array(144)].map((_, i) => (
            <div key={i} className="border border-slate-800 rounded-lg aspect-square" />
          ))}
        </div>
      </div>

      <div className="relative z-10 w-full max-w-lg animate-in fade-in zoom-in-95 duration-1000">
        <div className="bg-slate-900/60 border border-slate-800 rounded-[3rem] p-10 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Cpu className="w-32 h-32 text-cyan-400" />
          </div>

          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-20 h-20 bg-cyan-500/20 border border-cyan-500/40 rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-cyan-500/20 animate-bounce">
              <Fingerprint className="w-10 h-10 text-cyan-400" />
            </div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">Neural Uplink</h1>
            <p className="text-xs text-slate-500 font-mono uppercase tracking-[0.3em]">System Authentication Required</p>
          </div>

          {isSyncing ? (
            <div className="flex flex-col items-center py-12 space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-500/20 blur-xl animate-pulse rounded-full" />
                <Loader2 className="w-12 h-12 text-cyan-400 animate-spin relative z-10" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-white uppercase tracking-widest animate-pulse">{syncMessage}</p>
                <p className="text-[10px] text-slate-500 font-mono mt-2 uppercase tracking-[0.1em]">Establishing Quantum Link v4.2</p>
              </div>
            </div>
          ) : mode === 'selection' ? (
            <div className="space-y-3">
              <button 
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-between p-5 bg-white border border-slate-200 rounded-3xl hover:bg-slate-50 transition-all group shadow-xl"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 transition-colors">
                    <GoogleIcon />
                  </div>
                  <div className="text-left">
                    <span className="block font-bold text-slate-900 uppercase tracking-widest text-[11px]">Sync with Google</span>
                    <span className="text-[9px] text-slate-500 font-medium">Use Google Account Identity</span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="flex items-center space-x-4 my-6">
                <div className="flex-1 h-px bg-slate-800" />
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Or Secure Channels</span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>

              <button 
                onClick={() => setMode('login')}
                className="w-full flex items-center justify-between p-5 bg-slate-950 border border-slate-800 rounded-3xl hover:border-cyan-500 hover:bg-slate-900 transition-all group"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-cyan-500/10 rounded-xl group-hover:text-cyan-400 transition-colors">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <span className="block font-bold text-white uppercase tracking-widest text-[11px]">Identity Sync</span>
                    <span className="text-[9px] text-slate-500 font-medium">Standard Neural ID</span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-600 group-hover:translate-x-1 transition-transform" />
              </button>

              <button 
                onClick={handleGuestLogin}
                className="w-full flex items-center justify-between p-5 bg-slate-950 border border-slate-800 rounded-3xl hover:border-fuchsia-500 hover:bg-slate-900 transition-all group"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-fuchsia-500/10 rounded-xl group-hover:text-fuchsia-400 transition-colors">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <span className="block font-bold text-white uppercase tracking-widest text-[11px]">Ghost Uplink</span>
                    <span className="text-[9px] text-slate-500 font-medium">Anonymous Non-Persistent Access</span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-600 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="flex items-start space-x-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl mt-4">
                <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[9px] text-amber-500/80 leading-relaxed font-mono italic uppercase tracking-tighter">
                  Caution: Synaptic fragmentation may occur in Ghost mode. Formal Identity recommended for long-term data persistence.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUserLogin} className="space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                  <input 
                    type="text"
                    value={neuralId}
                    onChange={(e) => setNeuralId(e.target.value)}
                    placeholder="NEURAL IDENTIFIER"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-6 py-4 text-white placeholder-slate-700 focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 outline-none transition-all uppercase text-[10px] font-black tracking-widest"
                  />
                </div>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                  <input 
                    type="password"
                    value={accessKey}
                    onChange={(e) => setAccessKey(e.target.value)}
                    placeholder="ACCESS KEY"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-6 py-4 text-white placeholder-slate-700 focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 outline-none transition-all uppercase text-[10px] font-black tracking-widest"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button 
                  type="button"
                  onClick={() => setMode('selection')}
                  className="flex-1 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-[10px] font-black uppercase text-slate-500 hover:text-white transition-all"
                >
                  Go Back
                </button>
                <button 
                  type="submit"
                  disabled={!neuralId || !accessKey}
                  className="flex-[2] py-4 bg-cyan-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-cyan-500/20 hover:bg-cyan-500 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Initiate Sync
                </button>
              </div>
            </form>
          )}
        </div>
        
        <p className="mt-8 text-center text-[9px] text-slate-600 font-mono uppercase tracking-[0.3em]">
          Quantum Grid Encryption Active // Terminal ID: {Math.random().toString(36).substring(7).toUpperCase()}
        </p>
      </div>
    </div>
  );
};

export default LoginPortal;
