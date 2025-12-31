
import React from 'react';
import { Agent, AgentCategory } from '../types';
import { Users, Languages, Activity, Cpu, Shield, Globe } from 'lucide-react';

interface EcosystemStatsProps {
  agents: Agent[];
}

const EcosystemStats: React.FC<EcosystemStatsProps> = ({ agents }) => {
  const totalAgents = agents.length;
  const categories = Object.values(AgentCategory);
  
  const categoryCounts = categories.reduce((acc, cat) => {
    acc[cat] = agents.filter(a => a.category === cat).length;
    return acc;
  }, {} as Record<string, number>);

  const stats = [
    { 
      label: 'Active Agents', 
      value: totalAgents, 
      sub: 'Sub-Systems Online',
      icon: Users, 
      color: 'cyan' 
    },
    { 
      label: 'Linguistic Models', 
      value: '100+', 
      sub: 'Global Dialects Synthesized',
      icon: Languages, 
      color: 'fuchsia' 
    },
    { 
      label: 'Neural Nodes', 
      value: '14.2B', 
      sub: 'Synaptic Connections',
      icon: Activity, 
      color: 'emerald' 
    },
    { 
      label: 'Security Protocol', 
      value: 'Level 9', 
      sub: 'Encrypted Neural Link',
      icon: Shield, 
      color: 'rose' 
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {stats.map((stat, i) => (
        <div key={i} className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl backdrop-blur-md relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className={`absolute -right-4 -top-4 w-24 h-24 bg-${stat.color}-500/10 blur-3xl group-hover:bg-${stat.color}-500/20 transition-all`} />
          <div className="relative z-10">
            <stat.icon className={`w-8 h-8 text-${stat.color}-400 mb-4`} />
            <div className="text-3xl font-black text-white tracking-tighter mb-1">{stat.value}</div>
            <div className="text-sm font-bold text-slate-200 uppercase tracking-tight">{stat.label}</div>
            <div className="text-[10px] text-slate-500 font-mono mt-2">{stat.sub}</div>
          </div>
        </div>
      ))}

      <div className="md:col-span-2 lg:col-span-3 bg-slate-900/40 border border-slate-800 p-8 rounded-3xl backdrop-blur-md">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center">
          <Cpu className="w-5 h-5 mr-2 text-cyan-400" />
          Neural Distribution Matrix
        </h3>
        <div className="space-y-6">
          {categories.map((cat, i) => {
            const count = categoryCounts[cat] || 0;
            const percentage = (count / totalAgents) * 100;
            return (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400 uppercase tracking-widest">{cat}</span>
                  <span className="text-white font-bold">{count} Agent{count !== 1 ? 's' : ''}</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-1000 ease-out"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="lg:col-span-1 bg-slate-900/40 border border-slate-800 p-8 rounded-3xl backdrop-blur-md flex flex-col justify-center items-center text-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-cyan-500/20 blur-2xl animate-pulse rounded-full" />
          <Globe className="w-16 h-16 text-cyan-400 relative z-10 animate-spin-slow" />
        </div>
        <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-2">Universal Uplink</h3>
        <p className="text-xs text-slate-500 leading-relaxed px-4">
          Neosphere Core maintains active linguistic parity across 100+ major languages and thousands of regional dialects.
        </p>
        <div className="mt-6 pt-6 border-t border-slate-800 w-full">
          <div className="flex justify-around">
            <div className="text-center">
              <div className="text-xs font-bold text-white">∞</div>
              <div className="text-[9px] text-slate-500 uppercase">Context</div>
            </div>
            <div className="text-center">
              <div className="text-xs font-bold text-white">2.5ms</div>
              <div className="text-[9px] text-slate-500 uppercase">Latency</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EcosystemStats;
