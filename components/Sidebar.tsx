
import React from 'react';
import { ICON_MAP } from '../constants';
import { AgentCategory, Agent, User } from '../types';
import { ChevronRight, Cpu, LogOut, User as UserIcon, Shield, Zap, Cloud } from 'lucide-react';

interface SidebarProps {
  agents: Agent[];
  activeAgentId: string;
  onSelectAgent: (id: string) => void;
  isMobileOpen: boolean;
  toggleMobile: () => void;
  user: User;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ agents, activeAgentId, onSelectAgent, isMobileOpen, toggleMobile, user, onLogout }) => {
  const categories = Object.values(AgentCategory);
  const isGoogleUser = user.id.startsWith('GOOG-');

  return (
    <div className={`
      fixed inset-y-0 left-0 z-40 w-72 bg-slate-950 border-r border-slate-800 transform transition-transform duration-300 ease-in-out
      ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static flex flex-col
    `}>
      {/* Header */}
      <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shadow-lg shadow-cyan-500/5">
          <Cpu className="w-6 h-6 text-cyan-400" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-white tracking-tight uppercase">Neosphere</h1>
          <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Ecosystem v1.0</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {categories.map((category) => {
          const categoryAgents = agents.filter(a => a.category === category);
          if (categoryAgents.length === 0) return null;

          return (
            <div key={category}>
              <h3 className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">{category}</h3>
              <div className="space-y-1">
                {categoryAgents.map((agent) => {
                  const Icon = ICON_MAP[agent.icon] || Cpu;
                  const isActive = activeAgentId === agent.id;
                  
                  return (
                    <button
                      key={agent.id}
                      onClick={() => {
                        onSelectAgent(agent.id);
                        if (window.innerWidth < 768) toggleMobile();
                      }}
                      className={`
                        w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all duration-200
                        ${isActive 
                          ? `bg-${agent.color}-900/30 text-${agent.color}-400 border border-${agent.color}-500/20 shadow-lg` 
                          : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent'}
                      `}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-4 h-4 ${isActive ? '' : 'opacity-70'}`} />
                        <span className="font-medium">{agent.name}</span>
                      </div>
                      {isActive && <ChevronRight className="w-3 h-3" />}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* User Profile Section */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/50">
        <div className="flex flex-col space-y-2">
          {isGoogleUser && (
            <div className="flex items-center space-x-1 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full w-fit">
              <Cloud className="w-2.5 h-2.5 text-blue-400" />
              <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Google Cloud Sync</span>
            </div>
          )}
          
          <div className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-800 rounded-2xl shadow-inner">
             <div className="flex items-center space-x-3 overflow-hidden">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 overflow-hidden border border-white/10 ${user.isGuest ? 'bg-fuchsia-500/20 text-fuchsia-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.isGuest ? <Zap className="w-5 h-5" /> : <Shield className="w-5 h-5" />
                  )}
                </div>
                <div className="truncate">
                  <p className="text-[10px] font-black text-white uppercase truncate">{user.name}</p>
                  <p className="text-[8px] font-mono text-slate-500 truncate tracking-tighter">{user.id}</p>
                </div>
             </div>
             <button 
               onClick={onLogout}
               className="p-2 text-slate-600 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-all"
               title="Sever Link"
             >
               <LogOut className="w-4 h-4" />
             </button>
          </div>
        </div>
        <div className="mt-4 text-[8px] text-center text-slate-700 uppercase tracking-[0.2em] font-mono font-bold">
          System Core Uplink // Stable
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
