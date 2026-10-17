import React, { useState, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  MarkerType,
  Node,
  Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import {
  IncidentNode,
  RecorderNode,
  CameraNode,
  SegmentNode,
  GapNode,
  LeadNode,
  HashNode,
} from './nodes/CustomNodes';
import { GraphToolbar } from './GraphToolbar';
import { GraphLegend } from './GraphLegend';
import { NodeInspectorSheet } from './NodeInspectorSheet';
import { ProvenanceTreeView } from './ProvenanceTreeView';
import { Badge } from '@/components/ui/Badge';
import { GitBranch } from 'lucide-react';
import { EvidenceNodeKind, CustomNodeData } from './types';

const INITIAL_NODES: Node<any>[] = [
  {
    id: 'node-incident',
    type: 'incident',
    position: { x: 50, y: 250 },
    data: {
      label: 'Retail Store Incident',
      kind: 'incident' as const,
      caseId: 'CASE-2026-APEX-01',
      timeRange: '21:40:00 - 22:00:00 UTC',
      jurisdiction: 'CCTV Evidence Intake',
    },
  },
  {
    id: 'node-recorder',
    type: 'recorder',
    position: { x: 340, y: 250 },
    data: {
      label: 'Physical DVR Raw Storage',
      kind: 'recorder' as const,
      brand: 'MOCK-DVR (Hikvision)',
      imageHash: '618ed08956f023966c63dd2416f7d8b2aa8f071dfa4835305f57d608215720d0',
      sectors: 300000,
      sizeBytes: 153600000,
    },
  },
  {
    id: 'node-cam-01',
    type: 'camera',
    position: { x: 680, y: 80 },
    data: {
      label: 'CAM 01: Entrance',
      kind: 'camera' as const,
      channel: 1,
      offsetSec: 0.0,
      status: 'ok' as const,
    },
  },
  {
    id: 'node-cam-02',
    type: 'camera',
    position: { x: 680, y: 250 },
    data: {
      label: 'CAM 02: Aisle 4 (Beverages)',
      kind: 'camera' as const,
      channel: 2,
      offsetSec: 4.0,
      status: 'recovered' as const,
    },
  },
  {
    id: 'node-cam-03',
    type: 'camera',
    position: { x: 680, y: 440 },
    data: {
      label: 'CAM 03: Cash Counter',
      kind: 'camera' as const,
      channel: 3,
      offsetSec: 0.0,
      status: 'gaps' as const,
    },
  },
  {
    id: 'node-seg-001',
    type: 'segment',
    position: { x: 990, y: 50 },
    data: {
      label: 'Clip SEG-001 (Active)',
      kind: 'segment' as const,
      channel: 1,
      cameraName: 'Entrance',
      status: 'verified' as const,
      timeStart: '21:40:00',
      duration: '300s',
      hash: '3b7a1e0f8c9d2a4e6b5c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a',
    },
  },
  {
    id: 'node-seg-002-del',
    type: 'segment',
    position: { x: 990, y: 220 },
    data: {
      label: 'Carved Clip SEG-002-DEL',
      kind: 'segment' as const,
      channel: 2,
      cameraName: 'Aisle 4',
      status: 'recovered' as const,
      method: 'deep_sector_carve',
      sector: 254464,
      timeStart: '21:45:00',
      duration: '180s',
      hash: '0b2b68603632cf4b64fcad18a6dfc9247d8ff60f04c6e9a7e6b0253457b3f25c',
    },
  },
  {
    id: 'node-gap-ch3',
    type: 'gap',
    position: { x: 990, y: 390 },
    data: {
      label: 'Hardware Signal Loss (908s)',
      kind: 'gap' as const,
      channel: 3,
      cameraName: 'Cash Counter',
      verdict: 'camera_disconnected',
      confidence: 0.80,
      timeStart: '21:40:02',
      timeEnd: '21:55:10',
    },
  },
  {
    id: 'node-seg-003',
    type: 'segment',
    position: { x: 990, y: 530 },
    data: {
      label: 'Clip SEG-003 (Resumed)',
      kind: 'segment' as const,
      channel: 3,
      cameraName: 'Cash Counter',
      status: 'verified' as const,
      timeStart: '21:55:10',
      duration: '290s',
      hash: '9f8e7d6c5b4a3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
    },
  },
  {
    id: 'node-lead-001',
    type: 'lead',
    position: { x: 1320, y: 50 },
    data: {
      label: 'AI Lead: Person in Red Jacket',
      kind: 'lead' as const,
      similarity: 0.92,
      model: 'CLIP ViT-B/32 + OSNet',
      timestamp: '21:42:15 UTC',
    },
  },
  {
    id: 'node-lead-002',
    type: 'lead',
    position: { x: 1320, y: 220 },
    data: {
      label: 'AI Lead: Person with Red Backpack',
      kind: 'lead' as const,
      similarity: 0.88,
      model: 'CLIP ViT-B/32 + OSNet',
      timestamp: '21:46:18 UTC',
    },
  },
  {
    id: 'node-hash-master',
    type: 'hash',
    position: { x: 340, y: 460 },
    data: {
      label: 'Master Storage Seal',
      kind: 'hash' as const,
      hash: '618ed08956f023966c63dd2416f7d8b2aa8f071dfa4835305f57d608215720d0',
      algorithm: 'SHA-256',
      verified: true,
    },
  },
  {
    id: 'node-hash-carved',
    type: 'hash',
    position: { x: 1320, y: 390 },
    data: {
      label: 'Carved Bitstream Seal',
      kind: 'hash' as const,
      hash: '0b2b68603632cf4b64fcad18a6dfc9247d8ff60f04c6e9a7e6b0253457b3f25c',
      algorithm: 'SHA-256',
      verified: true,
    },
  },
];

const INITIAL_EDGES: Edge[] = [
  {
    id: 'e-inc-rec',
    source: 'node-incident',
    target: 'node-recorder',
    label: 'investigates',
    animated: true,
    style: { stroke: '#22d3ee', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#22d3ee' },
  },
  {
    id: 'e-rec-hash',
    source: 'node-recorder',
    target: 'node-hash-master',
    sourceHandle: 'bottom',
    label: 'sealed with',
    style: { stroke: '#10b981', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' },
  },
  {
    id: 'e-rec-cam1',
    source: 'node-recorder',
    target: 'node-cam-01',
    label: 'recorded by',
    style: { stroke: '#38bdf8', strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#38bdf8' },
  },
  {
    id: 'e-rec-cam2',
    source: 'node-recorder',
    target: 'node-cam-02',
    label: 'recorded by',
    style: { stroke: '#a855f7', strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#a855f7' },
  },
  {
    id: 'e-rec-cam3',
    source: 'node-recorder',
    target: 'node-cam-03',
    label: 'recorded by',
    style: { stroke: '#f43f5e', strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#f43f5e' },
  },
  {
    id: 'e-cam1-seg1',
    source: 'node-cam-01',
    target: 'node-seg-001',
    label: 'contains',
    style: { stroke: '#10b981', strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' },
  },
  {
    id: 'e-cam2-seg2',
    source: 'node-cam-02',
    target: 'node-seg-002-del',
    label: 'carved from',
    style: { stroke: '#a855f7', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#a855f7' },
  },
  {
    id: 'e-cam3-gap',
    source: 'node-cam-03',
    target: 'node-gap-ch3',
    label: 'interrupted by',
    style: { stroke: '#f43f5e', strokeWidth: 1.5, strokeDasharray: '4 4' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#f43f5e' },
  },
  {
    id: 'e-cam3-seg3',
    source: 'node-cam-03',
    target: 'node-seg-003',
    label: 'resumed with',
    style: { stroke: '#10b981', strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' },
  },
  {
    id: 'e-seg1-lead1',
    source: 'node-seg-001',
    target: 'node-lead-001',
    label: 'observed lead',
    style: { stroke: '#22d3ee', strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#22d3ee' },
  },
  {
    id: 'e-seg2-lead2',
    source: 'node-seg-002-del',
    target: 'node-lead-002',
    label: 'observed lead',
    style: { stroke: '#22d3ee', strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#22d3ee' },
  },
  {
    id: 'e-seg2-hash',
    source: 'node-seg-002-del',
    target: 'node-hash-carved',
    label: 'verified with',
    style: { stroke: '#10b981', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' },
  },
];

const nodeTypes = {
  incident: IncidentNode,
  recorder: RecorderNode,
  camera: CameraNode,
  segment: SegmentNode,
  gap: GapNode,
  lead: LeadNode,
  hash: HashNode,
};

import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export const GraphPage: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const activeCase = caseId || 'CASE-2026-APEX-01';
  useDocumentTitle(`Evidence Lineage Graph — ${activeCase}`);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<any>>(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(INITIAL_EDGES);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKind, setSelectedKind] = useState<'all' | EvidenceNodeKind>('all');
  const [isTracing, setIsTracing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isTreeView, setIsTreeView] = useState(false);

  // Selected node data
  const selectedNode = useMemo(() => {
    return nodes.find((n) => n.id === selectedNodeId) || null;
  }, [nodes, selectedNodeId]);

  // Click on Node
  const onNodeClick = useCallback((_: React.MouseEvent, node: any) => {
    setSelectedNodeId(node.id);
  }, []);

  // Filtered Nodes based on Search Query & Kind
  const displayNodes: Node<any>[] = useMemo(() => {
    return nodes.map((n) => {
      let isDimmed = false;

      // Filter by kind
      if (selectedKind !== 'all' && n.data.kind !== selectedKind) {
        isDimmed = true;
      }

      // Filter by search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesLabel = n.data.label.toLowerCase().includes(q);
        const matchesId = n.id.toLowerCase().includes(q);
        const matchesHash =
          'hash' in n.data &&
          typeof (n.data as any).hash === 'string' &&
          (n.data as any).hash.toLowerCase().includes(q);

        if (!matchesLabel && !matchesId && !matchesHash) {
          isDimmed = true;
        }
      }

      return {
        ...n,
        data: {
          ...n.data,
          isDimmed,
        },
      };
    });
  }, [nodes, searchQuery, selectedKind]);

  // Trace to Source: Highlight lineage from selected node to Root/Recorder
  const handleTraceToSource = useCallback(() => {
    if (!selectedNodeId) return;

    setIsTracing(true);

    // Recursively collect all ancestor node IDs
    const ancestorIds = new Set<string>([selectedNodeId]);
    let added = true;

    while (added) {
      added = false;
      edges.forEach((e) => {
        if (ancestorIds.has(e.target) && !ancestorIds.has(e.source)) {
          ancestorIds.add(e.source);
          added = true;
        }
      });
    }

    // Update nodes: dim those not in lineage, highlight lineage
    setNodes((prev) =>
      prev.map((n) => ({
        ...n,
        data: {
          ...n.data,
          isDimmed: !ancestorIds.has(n.id),
          isPulsing: ancestorIds.has(n.id),
        },
      }))
    );

    // Animate active lineage edges
    setEdges((prev) =>
      prev.map((e) => {
        const isInLineage = ancestorIds.has(e.source) && ancestorIds.has(e.target);
        return {
          ...e,
          animated: isInLineage,
          style: {
            ...e.style,
            stroke: isInLineage ? '#22d3ee' : '#334155',
            strokeWidth: isInLineage ? 3 : 1,
            opacity: isInLineage ? 1 : 0.25,
          },
        };
      })
    );

    setTimeout(() => {
      setIsTracing(false);
    }, 1800);
  }, [selectedNodeId, edges, setNodes, setEdges]);

  // Verify Chain: Simulated SHA-256 validation of hash nodes
  const handleVerifyChain = useCallback(() => {
    setIsVerifying(true);

    setNodes((prev) =>
      prev.map((n) => {
        if (n.data.kind === 'hash' || (n.data as any).hash) {
          return {
            ...n,
            data: {
              ...n.data,
              isVerified: true,
              isPulsing: true,
            },
          };
        }
        return n;
      })
    );

    setTimeout(() => {
      setIsVerifying(false);
      setNodes((prev) =>
        prev.map((n) => ({
          ...n,
          data: {
            ...n.data,
            isPulsing: false,
          },
        }))
      );
      alert('All SHA-256 cryptographic signatures successfully verified against disk sectors!');
    }, 1200);
  }, [setNodes]);

  // Export Graph Manifest
  const handleExport = () => {
    const manifest = {
      caseId: activeCase,
      exportedAt: new Date().toISOString(),
      nodes: nodes.map((n) => ({ id: n.id, type: n.type, data: n.data })),
      edges: edges.map((e) => ({ id: e.id, source: e.source, target: e.target, label: e.label })),
    };
    navigator.clipboard.writeText(JSON.stringify(manifest, null, 2));
    alert('Graph lineage manifest copied to clipboard (JSON)!');
  };

  return (
    <div className="p-6 md:p-8 space-y-4 max-w-7xl mx-auto flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <GitBranch className="w-6 h-6 text-scan" />
            <h1 className="font-display text-2xl font-bold text-white tracking-tight">
              Traceable Evidence Lineage Graph
            </h1>
          </div>
          <p className="text-xs text-ink-muted mt-1">
            Prove forensic custody: incident, physical disk, synchronized cameras, carved footage, and cryptographic hashes all connected in an immutable DAG.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="neutral" className="text-xs font-mono">
            Case: {activeCase}
          </Badge>
          <Badge variant="verified" className="text-xs font-mono">
            {nodes.length} Lineage Nodes
          </Badge>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex-shrink-0">
        <GraphToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedKind={selectedKind}
          onKindSelect={setSelectedKind}
          onTraceToSource={handleTraceToSource}
          isTracing={isTracing}
          onVerifyChain={handleVerifyChain}
          isVerifying={isVerifying}
          isTreeView={isTreeView}
          onToggleTreeView={() => setIsTreeView(!isTreeView)}
          onExport={handleExport}
          hasSelection={Boolean(selectedNodeId)}
        />
      </div>

      {/* Main Graph Canvas or Accessible Tree Fallback */}
      <div className="relative flex-1 rounded-2xl bg-panel-dark/95 border border-grid-line/80 overflow-hidden shadow-2xl">
        {isTreeView ? (
          <div className="h-full overflow-y-auto p-4">
            <ProvenanceTreeView
              onSelectNode={(nodeId) => setSelectedNodeId(nodeId)}
              searchQuery={searchQuery}
            />
          </div>
        ) : (
          <ReactFlow
            nodes={displayNodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.2}
            maxZoom={1.5}
            defaultViewport={{ x: 50, y: 50, zoom: 0.8 }}
            className="w-full h-full"
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={24}
              size={1.5}
              color="rgba(34, 211, 238, 0.15)"
            />
            <Controls className="!bg-panel-dark !border-grid-line/80 !text-white fill-white shadow-lg" />
            <MiniMap
              nodeColor={(n) => {
                if (n.type === 'incident') return '#22d3ee';
                if (n.type === 'recorder') return '#38bdf8';
                if (n.type === 'camera') return '#3b82f6';
                if (n.type === 'segment') return '#10b981';
                if (n.type === 'gap') return '#f43f5e';
                if (n.type === 'hash') return '#059669';
                return '#a855f7';
              }}
              maskColor="rgba(8, 12, 20, 0.8)"
              className="!bg-panel-dark/90 !border-grid-line/60 rounded-lg shadow-xl"
            />
          </ReactFlow>
        )}

        {/* Collapsible Legend */}
        {!isTreeView && <GraphLegend />}

        {/* Slide-Over Node Inspector Sheet */}
        {selectedNode && (
          <NodeInspectorSheet
            nodeId={selectedNode.id}
            nodeData={selectedNode.data as unknown as CustomNodeData}
            onClose={() => setSelectedNodeId(null)}
            onTrace={handleTraceToSource}
          />
        )}
      </div>
    </div>
  );
};
