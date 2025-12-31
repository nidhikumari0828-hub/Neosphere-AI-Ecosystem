
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Agent, AgentCategory } from '../types';

interface NetworkVizProps {
  agents: Agent[];
  onSelectAgent: (agentId: string) => void;
  activeAgentId: string;
}

const NetworkViz: React.FC<NetworkVizProps> = ({ agents, onSelectAgent, activeAgentId }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous

    // Data preparation
    const nodes = agents.map(agent => ({ ...agent, x: width / 2, y: height / 2 }));
    const links: any[] = [];

    // Connect everyone to Core
    const coreNode = nodes.find(n => n.category === AgentCategory.CORE);
    if (coreNode) {
      nodes.forEach(node => {
        if (node.id !== coreNode.id) {
          links.push({ source: coreNode.id, target: node.id, value: 1 });
        }
      });
    }

    // Connect same categories
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].category === nodes[j].category && nodes[i].category !== AgentCategory.CORE) {
            links.push({ source: nodes[i].id, target: nodes[j].id, value: 0.5 });
        }
      }
    }

    const simulation = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(120))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(40));

    // Draw Links
    const link = svg.append("g")
      .attr("stroke", "#334155")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", 1);

    // Draw Nodes
    const nodeGroup = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(d3.drag<any, any>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended) as any);

    // Color mapping helper
    const getAgentColor = (colorStr: string) => {
        const colorMap: Record<string, string> = {
            cyan: '#06b6d4',
            fuchsia: '#d946ef',
            emerald: '#10b981',
            pink: '#ec4899',
            rose: '#f43f5e',
            violet: '#8b5cf6',
            teal: '#14b8a6',
            orange: '#f97316',
            amber: '#f59e0b',
            indigo: '#6366f1',
            blue: '#3b82f6',
            slate: '#64748b'
        };
        return colorMap[colorStr] || '#64748b';
    };

    // Node Circles
    nodeGroup.append("circle")
      .attr("r", (d) => d.id === 'neosphere-core' ? 30 : 20)
      .attr("fill", (d) => getAgentColor(d.color))
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .attr("cursor", "pointer")
      .on("click", (event, d) => onSelectAgent(d.id));

    // Node Labels
    nodeGroup.append("text")
      .text(d => d.name.replace(" AI", ""))
      .attr("x", 0)
      .attr("y", (d) => d.id === 'neosphere-core' ? 45 : 35)
      .attr("text-anchor", "middle")
      .attr("fill", "#e2e8f0")
      .attr("font-size", "10px")
      .attr("font-weight", "500")
      .style("pointer-events", "none");
    
    // Active Indicator Ring
    nodeGroup.append("circle")
        .attr("r", (d) => (d.id === 'neosphere-core' ? 30 : 20) + 5)
        .attr("fill", "none")
        .attr("stroke", (d) => d.id === activeAgentId ? "#38bdf8" : "none")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "4 2")
        .style("opacity", 0.8);


    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      nodeGroup
        .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [agents, onSelectAgent, activeAgentId]);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-slate-950/50 backdrop-blur-sm rounded-xl border border-slate-800">
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <h3 className="text-slate-400 text-xs font-mono uppercase tracking-widest">Ecosystem Visualizer</h3>
        <p className="text-slate-500 text-[10px]">Real-time Agent Neural Link</p>
      </div>
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
};

export default NetworkViz;
