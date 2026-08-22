'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Network, Sparkles, Filter, Users, GitFork, Info } from 'lucide-react';

interface GraphNode {
  id: string;
  name: string;
  type: 'user' | 'skill';
  avatar?: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  details: string;
}

interface GraphEdge {
  source: string;
  target: string;
  label: string;
  isChain: boolean;
  color: string;
}

export const LiveSkillGraph: React.FC = () => {
  const { allUsers, skillChains, switchUser } = useApp();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'chains'>('all');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 900);
    let height = (canvas.height = window.innerWidth < 640 ? 400 : 560);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth || 900;
      height = canvas.height = window.innerWidth < 640 ? 400 : 560;
    };
    window.addEventListener('resize', handleResize);

    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    // Users as Light Slate Nodes
    allUsers.forEach((user, i) => {
      const angle = (i / allUsers.length) * Math.PI * 2;
      const dist = 180 + (i % 2) * 35;
      nodes.push({
        id: user.id,
        name: user.name,
        type: 'user',
        avatar: user.avatar,
        x: width / 2 + Math.cos(angle) * dist,
        y: height / 2 + Math.sin(angle) * dist,
        vx: 0,
        vy: 0,
        radius: 22,
        color: '#FFFFFF',
        details: `${user.headline} • Trust: ${user.trustScore.overallScore}/100`,
      });
    });

    // Skill Clusters
    const skillsList = [
      { id: 'sk-py', name: 'Python DS', color: '#D97706', x: width / 2 - 110, y: height / 2 - 70 },
      { id: 'sk-gt', name: 'Acoustic Guitar', color: '#059669', x: width / 2 + 110, y: height / 2 - 70 },
      { id: 'sk-en', name: 'Business English', color: '#D97706', x: width / 2, y: height / 2 + 100 },
      { id: 'sk-gl', name: 'GLSL Shaders', color: '#DC2626', x: width / 2 - 180, y: height / 2 + 70 },
      { id: 'sk-ux', name: 'UI/UX Figma', color: '#059669', x: width / 2 + 180, y: height / 2 + 70 },
    ];

    skillsList.forEach(s => {
      nodes.push({
        id: s.id,
        name: s.name,
        type: 'skill',
        x: s.x,
        y: s.y,
        vx: 0,
        vy: 0,
        radius: 18,
        color: s.color,
        details: `Skill Cluster: ${s.name}`,
      });
    });

    // Edges
    edges.push(
      { source: 'user-alex', target: 'sk-py', label: 'Teaches', isChain: true, color: '#D97706' },
      { source: 'sk-py', target: 'user-david', label: 'Learns', isChain: true, color: '#059669' },
      { source: 'user-david', target: 'sk-en', label: 'Teaches', isChain: true, color: '#D97706' },
      { source: 'sk-en', target: 'user-maya', label: 'Learns', isChain: true, color: '#059669' },
      { source: 'user-maya', target: 'sk-gt', label: 'Teaches', isChain: true, color: '#D97706' },
      { source: 'sk-gt', target: 'user-alex', label: 'Learns', isChain: true, color: '#059669' }
    );

    let animationFrameId: number;
    let tick = 0;

    const render = () => {
      tick++;
      // Clean Bright White Canvas
      ctx.fillStyle = '#FAFAF9';
      ctx.fillRect(0, 0, width, height);

      // Subtle light grid
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw Edges
      edges.forEach(edge => {
        const sNode = nodes.find(n => n.id === edge.source);
        const tNode = nodes.find(n => n.id === edge.target);
        if (!sNode || !tNode) return;

        ctx.strokeStyle = edge.isChain ? edge.color : '#CBD5E1';
        ctx.lineWidth = edge.isChain ? 2.5 : 1;
        ctx.setLineDash(edge.isChain ? [6, 4] : []);
        ctx.beginPath();
        ctx.moveTo(sNode.x, sNode.y);
        ctx.lineTo(tNode.x, tNode.y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Flowing particle on chain
        if (edge.isChain) {
          const progress = ((tick * 1.2) % 100) / 100;
          const px = sNode.x + (tNode.x - sNode.x) * progress;
          const py = sNode.y + (tNode.y - sNode.y) * progress;

          ctx.fillStyle = '#0F172A';
          ctx.beginPath();
          ctx.arc(px, py, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Draw Nodes
      nodes.forEach(node => {
        const isHovered = hoveredNode?.id === node.id;

        // Circle
        ctx.fillStyle = node.type === 'user' ? '#FFFFFF' : node.color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, isHovered ? node.radius + 3 : node.radius, 0, Math.PI * 2);
        ctx.fill();

        // Border
        ctx.strokeStyle = node.type === 'user' ? '#0F172A' : '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Label
        ctx.fillStyle = '#0F172A';
        ctx.font = node.type === 'user' ? 'bold 11px sans-serif' : '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(node.name, node.x, node.y + node.radius + 14);

        // Icon inside
        ctx.fillStyle = node.type === 'user' ? '#0F172A' : '#FFFFFF';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(node.type === 'user' ? '●' : '✦', node.x, node.y + 4);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const found = nodes.find(n => {
        const dx = n.x - mx;
        const dy = n.y - my;
        return Math.sqrt(dx * dx + dy * dy) <= n.radius + 5;
      });

      setHoveredNode(found || null);
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const found = nodes.find(n => {
        const dx = n.x - mx;
        const dy = n.y - my;
        return Math.sqrt(dx * dx + dy * dy) <= n.radius + 5;
      });

      if (found) {
        setSelectedNode(found);
        if (found.type === 'user') {
          switchUser(found.id);
        }
      }
    };

    const handleTouch = (e: TouchEvent) => {
      if (!e.touches[0]) return;
      const rect = canvas.getBoundingClientRect();
      const mx = e.touches[0].clientX - rect.left;
      const my = e.touches[0].clientY - rect.top;

      const found = nodes.find(n => {
        const dx = n.x - mx;
        const dy = n.y - my;
        return Math.sqrt(dx * dx + dy * dy) <= n.radius + 10;
      });

      if (found) {
        setSelectedNode(found);
        if (found.type === 'user') {
          switchUser(found.id);
        }
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('touchstart', handleTouch, { passive: true });

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('touchstart', handleTouch);
    };
  }, [allUsers, skillChains]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="paper-card rounded-3xl p-6 sm:p-10 border border-slate-200 bg-white shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono-ledger uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200 flex items-center gap-1">
                <Network className="w-3 h-3 text-amber-600" /> SECTION 60.4 INNOVATION
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-mono-ledger text-emerald-700 bg-emerald-50 border border-emerald-200">
                FORCE-DIRECTED SKILL GRAPH
              </span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
              Live Public <span className="text-amber-600">Skill Network Graph</span>
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm max-w-2xl font-sans leading-relaxed">
              "The network you're part of." An interactive visual map of active peers, skill clusters, and multi-party chains forming in real time. Click any node to inspect or switch persona.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-mono-ledger">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                filterMode === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Nodes
            </button>
            <button
              onClick={() => setFilterMode('chains')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                filterMode === 'chains' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              3-Person Chains
            </button>
          </div>
        </div>
      </div>

      {/* Canvas Container */}
      <div className="paper-card rounded-3xl p-4 sm:p-6 bg-white border border-slate-200 shadow-md relative overflow-hidden">
        <div className="w-full h-[560px] rounded-2xl relative overflow-hidden border border-slate-200 bg-slate-50">
          <canvas ref={canvasRef} className="w-full h-full cursor-pointer" />

          {/* Interactive Info Tooltip */}
          {(hoveredNode || selectedNode) && (
            <div className="absolute bottom-4 left-4 p-4 rounded-2xl paper-card max-w-sm w-full shadow-xl space-y-1 bg-white border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                <span className="font-display font-bold text-xs text-slate-900">
                  {(selectedNode || hoveredNode)?.name}
                </span>
                <span className="text-[9.5px] font-mono-ledger font-bold uppercase px-2 py-0.5 rounded bg-slate-900 text-white">
                  {(selectedNode || hoveredNode)?.type}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 font-sans">{(selectedNode || hoveredNode)?.details}</p>
              <p className="text-[10px] font-mono-ledger text-emerald-700 font-bold pt-1">
                Click to switch persona & view exchange options
              </p>
            </div>
          )}

          {/* Legend */}
          <div className="absolute top-4 right-4 p-3 rounded-xl bg-white/90 backdrop-blur-xs border border-slate-200 text-[10.5px] font-mono-ledger space-y-1.5 pointer-events-none shadow-sm">
            <div className="flex items-center gap-2 text-slate-800">
              <span className="w-2.5 h-2.5 rounded-full bg-white border border-slate-900"></span>
              <span>Peer Learner / Teacher</span>
            </div>
            <div className="flex items-center gap-2 text-slate-800">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>Teaches Connection</span>
            </div>
            <div className="flex items-center gap-2 text-slate-800">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <span>Learns Connection</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
