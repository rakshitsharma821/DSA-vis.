import React from 'react';
import { useAlgorithmStore } from '../../store/useAlgorithmStore';
import {
  Clock,
  HardDrive,
  GitCompare,
  ArrowLeftRight,
  CheckCircle,
  GitFork,
  Network,
  GitCommit,
  Layers,
  Table,
  Cpu,
  Key,
  Undo2,
  Sliders,
  Award,
  Hash,
  Activity,
  Crosshair,
  Gauge,
  Disc,
} from 'lucide-react';

interface MetricItem {
  label: string;
  value: React.ReactNode;
  sub?: string;
  icon: React.ReactNode;
  colorClass: string;
}

export const StatsCard: React.FC = () => {
  const { comparisons, swaps, currentStepIndex, steps, currentAlgorithm } = useAlgorithmStore();
  const currentStep = steps[currentStepIndex] || steps[0];
  const ds = currentStep?.dataState || {};
  const complexity = currentAlgorithm.complexity;
  const cat = currentAlgorithm.category;
  const boardType = currentAlgorithm.boardType;

  const metrics: MetricItem[] = [];

  if (cat === 'sorting' || boardType === 'array-sort') {
    metrics.push(
      {
        label: 'Comparisons',
        value: comparisons,
        sub: 'Key comparisons made',
        icon: <GitCompare className="w-3.5 h-3.5 text-amber-500" />,
        colorClass: 'text-amber-600 dark:text-amber-400',
      },
      {
        label: 'Swaps / Moves',
        value: swaps,
        sub: 'Inversions exchanged',
        icon: <ArrowLeftRight className="w-3.5 h-3.5 text-fuchsia-600 dark:text-fuchsia-400" />,
        colorClass: 'text-fuchsia-600 dark:text-fuchsia-400',
      },
      {
        label: 'Step Progress',
        value: `${currentStepIndex + 1} / ${steps.length}`,
        sub: `${Math.round(((currentStepIndex + 1) / (steps.length || 1)) * 100)}% complete`,
        icon: <CheckCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />,
        colorClass: 'text-blue-600 dark:text-blue-400',
      }
    );
  } else if (cat === 'searching') {
    metrics.push(
      {
        label: 'Comparisons',
        value: comparisons,
        sub: 'Target evaluations',
        icon: <GitCompare className="w-3.5 h-3.5 text-amber-500" />,
        colorClass: 'text-amber-600 dark:text-amber-400',
      },
      {
        label: 'Search Scope',
        value: ds.low !== undefined && ds.high !== undefined ? `[${ds.low}..${ds.high}]` : 'Active',
        sub: ds.mid !== undefined ? `Mid index: ${ds.mid}` : 'Converging',
        icon: <Crosshair className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />,
        colorClass: 'text-blue-600 dark:text-blue-400',
      },
      {
        label: 'Discarded Half',
        value: ds.discarded?.length ?? 0,
        sub: 'Elements ruled out',
        icon: <Layers className="w-3.5 h-3.5 text-slate-500" />,
        colorClass: 'text-slate-600 dark:text-slate-400',
      }
    );
  } else if (cat === 'trees') {
    const visitedCount = ds.visitedSequence?.length || (ds.traversalOutput?.length ?? 0);
    metrics.push(
      {
        label: 'Active Node',
        value: ds.activeNodeId !== undefined && ds.activeNodeId !== null ? String(ds.activeNodeId) : 'Root',
        sub: ds.operation || 'Traversing tree',
        icon: <GitFork className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />,
        colorClass: 'text-blue-600 dark:text-blue-400',
      },
      {
        label: 'Nodes Visited',
        value: visitedCount,
        sub: `Sequence length: ${visitedCount}`,
        icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />,
        colorClass: 'text-emerald-600 dark:text-emerald-400',
      },
      {
        label: 'Balance State',
        value: ds.balanced !== undefined ? (ds.balanced ? 'Balanced' : 'Unbalanced') : 'BST Valid',
        sub: ds.balanceFactor !== undefined ? `BF: ${ds.balanceFactor}` : 'Ordered L < R',
        icon: <Activity className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />,
        colorClass: 'text-amber-600 dark:text-amber-400',
      }
    );
  } else if (cat === 'graphs') {
    metrics.push(
      {
        label: 'Active Vertex',
        value: ds.activeNodeId || 'Source',
        sub: ds.structure === 'graph' ? 'Adjacency Dual-View' : 'Graph node',
        icon: <Network className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />,
        colorClass: 'text-blue-600 dark:text-blue-400',
      },
      {
        label: 'Explored Vertices',
        value: ds.visitedSequence?.length || ds.visitedIds?.length || 1,
        sub: 'Visited set',
        icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />,
        colorClass: 'text-emerald-600 dark:text-emerald-400',
      },
      {
        label: 'Edges Evaluated',
        value: ds.edges?.length || 4,
        sub: 'Relaxation / Traversal',
        icon: <GitCommit className="w-3.5 h-3.5 text-fuchsia-600 dark:text-fuchsia-400" />,
        colorClass: 'text-fuchsia-600 dark:text-fuchsia-400',
      }
    );
  } else if (cat === 'linked-list') {
    metrics.push(
      {
        label: 'Current Node',
        value: ds.currId !== null && ds.currId !== undefined ? `Node #${ds.currId}` : 'Head',
        sub: ds.isDoubly ? 'Bidirectional' : 'Singly linked',
        icon: <GitCommit className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />,
        colorClass: 'text-blue-600 dark:text-blue-400',
      },
      {
        label: 'Pointers Wired',
        value: ds.nodes?.length || 5,
        sub: ds.cycleBroken ? 'Cycle removed' : ds.loopEntry !== undefined ? 'Loop detected' : 'Inverted',
        icon: <ArrowLeftRight className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />,
        colorClass: 'text-purple-600 dark:text-purple-400',
      },
      {
        label: 'Cycle Status',
        value: ds.cycleBroken ? 'Broken' : ds.loopEntry !== undefined ? 'Detected' : 'Acyclic',
        sub: ds.slow !== undefined ? `Tortoise: ${ds.slow}` : 'No loop',
        icon: <Activity className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />,
        colorClass: 'text-amber-600 dark:text-amber-400',
      }
    );
  } else if (cat === 'stack' || cat === 'queue') {
    const isStack = cat === 'stack';
    const items = ds.items || [];
    metrics.push(
      {
        label: isStack ? 'Stack Depth' : 'Queue Length',
        value: items.length,
        sub: isStack ? 'LIFO elements' : 'FIFO buffer',
        icon: <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />,
        colorClass: 'text-blue-600 dark:text-blue-400',
      },
      {
        label: isStack ? 'Top Element' : 'Front Element',
        value: items.length > 0 ? items[items.length - 1] : 'Empty',
        sub: isStack ? 'Next to pop()' : 'Next to dequeue()',
        icon: <ArrowLeftRight className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />,
        colorClass: 'text-amber-600 dark:text-amber-400',
      },
      {
        label: 'Discipline',
        value: isStack ? 'LIFO' : 'FIFO Circular',
        sub: ds.charIdx !== undefined ? `Char index: ${ds.charIdx}` : 'Modular array wrap',
        icon: <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />,
        colorClass: 'text-emerald-600 dark:text-emerald-400',
      }
    );
  } else if (cat === 'dp') {
    metrics.push(
      {
        label: 'Active Cell',
        value: ds.currentCell ? `[${ds.currentCell[0]}, ${ds.currentCell[1]}]` : ds.type === 'fib-dual' ? `F(${ds.n || 6})` : 'Done',
        sub: 'Subproblem coordinates',
        icon: <Table className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />,
        colorClass: 'text-blue-600 dark:text-blue-400',
      },
      {
        label: 'Optimal Value',
        value: ds.optimalValue ?? ds.lcsLength ?? (ds.tab ? ds.tab[ds.tab.length - 1] : 7),
        sub: 'Optimal subproblem metric',
        icon: <Award className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />,
        colorClass: 'text-emerald-600 dark:text-emerald-400',
      },
      {
        label: 'Strategy',
        value: ds.type === 'fib-dual' ? 'Dual: Memo vs Tab' : '2D DP Grid',
        sub: 'No redundant recomputation',
        icon: <Layers className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />,
        colorClass: 'text-purple-600 dark:text-purple-400',
      }
    );
  } else if (cat === 'hashing') {
    metrics.push(
      {
        label: 'Target Bucket',
        value: currentStep?.pointers?.slot ?? currentStep?.pointers?.probe ?? 1,
        sub: 'Hash slot index',
        icon: <Key className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />,
        colorClass: 'text-blue-600 dark:text-blue-400',
      },
      {
        label: 'Load Factor α',
        value: currentStep?.reason?.values?.loadFactor ?? '—',
        sub: 'n / capacity',
        icon: <Gauge className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />,
        colorClass: 'text-amber-600 dark:text-amber-400',
      },
      {
        label: 'Collision Mode',
        value: currentAlgorithm.id.includes('chaining') ? 'Chaining' : 'Linear Probe',
        sub: 'Collision resolution',
        icon: <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />,
        colorClass: 'text-emerald-600 dark:text-emerald-400',
      }
    );
  } else if (cat === 'backtracking') {
    metrics.push(
      {
        label: 'Board State',
        value: ds.currentCell ? `(${ds.currentCell[0]}, ${ds.currentCell[1]})` : 'In progress',
        sub: 'Active cell inspection',
        icon: <Table className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />,
        colorClass: 'text-blue-600 dark:text-blue-400',
      },
      {
        label: 'Placements Made',
        value: ds.visitedCells?.length || 0,
        sub: 'Safe assignments',
        icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />,
        colorClass: 'text-emerald-600 dark:text-emerald-400',
      },
      {
        label: 'Prune & Undo',
        value: currentStepIndex > 1 ? 'Active' : 'Standby',
        sub: 'Backtrack on violation',
        icon: <Undo2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />,
        colorClass: 'text-purple-600 dark:text-purple-400',
      }
    );
  } else if (cat === 'recursion') {
    metrics.push(
      {
        label: 'Moves Made',
        value: `${ds.moveCount ?? currentStepIndex} / ${ds.totalMoves ?? '—'}`,
        sub: 'Optimal transfers: 2ⁿ - 1',
        icon: <ArrowLeftRight className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />,
        colorClass: 'text-blue-600 dark:text-blue-400',
      },
      {
        label: 'Call Stack Depth',
        value: ds.callStack?.length || 1,
        sub: 'Active stack frames',
        icon: <Layers className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />,
        colorClass: 'text-purple-600 dark:text-purple-400',
      },
      {
        label: 'Hanoi Constraint',
        value: 'Preserved',
        sub: 'Never large on small',
        icon: <Disc className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />,
        colorClass: 'text-emerald-600 dark:text-emerald-400',
      }
    );
  } else if (cat === 'bit-manipulation') {
    metrics.push(
      {
        label: 'Operation',
        value: ds.opName || 'Bitwise',
        sub: 'CPU ALU cycle',
        icon: <Cpu className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />,
        colorClass: 'text-amber-600 dark:text-amber-400',
      },
      {
        label: 'Binary Register',
        value: ds.resultBin || '00001000',
        sub: '8-bit result',
        icon: <Hash className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />,
        colorClass: 'text-blue-600 dark:text-blue-400',
      },
      {
        label: 'Operands A & B',
        value: ds.numA !== undefined && ds.numB !== undefined ? `${ds.numA} & ${ds.numB}` : '—',
        sub: 'Input integers',
        icon: <Layers className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />,
        colorClass: 'text-purple-600 dark:text-purple-400',
      }
    );
  } else {
    // Default Arrays & Patterns
    metrics.push(
      {
        label: 'Running Metric',
        value: ds.target ?? currentStep?.reason?.values?.currentMax ?? 'Active',
        sub: ds.foundIndex !== null ? 'Optimal found' : 'Evaluating window',
        icon: <Sliders className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />,
        colorClass: 'text-blue-600 dark:text-blue-400',
      },
      {
        label: 'Window Scope',
        value: ds.low !== undefined && ds.high !== undefined ? `[${ds.low}..${ds.high}]` : 'Scanning',
        sub: 'Active pointer boundaries',
        icon: <Layers className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />,
        colorClass: 'text-purple-600 dark:text-purple-400',
      },
      {
        label: 'Step Progress',
        value: `${currentStepIndex + 1} / ${steps.length}`,
        sub: 'Linear traversal',
        icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />,
        colorClass: 'text-emerald-600 dark:text-emerald-400',
      }
    );
  }

  // Always append Time & Space Complexity cards to complete the 5-6 full-width cards!
  metrics.push(
    {
      label: 'Time (Avg)',
      value: complexity.time.average,
      sub: `Worst: ${complexity.time.worst}`,
      icon: <Clock className="w-3.5 h-3.5 text-primary" />,
      colorClass: 'text-primary font-mono',
    },
    {
      label: 'Space (Worst)',
      value: complexity.space.worst,
      sub: 'Auxiliary memory',
      icon: <HardDrive className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />,
      colorClass: 'text-emerald-600 dark:text-emerald-400 font-mono',
    },
    {
      label: 'Step Counter',
      value: `${currentStepIndex + 1}/${steps.length}`,
      sub: currentStep?.type ? `Action: ${currentStep.type}` : 'Ready',
      icon: <CheckCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />,
      colorClass: 'text-foreground font-mono',
    }
  );

  return (
    <div className="grid w-full grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-6">
      {metrics.map((m, idx) => (
        <div
          key={idx}
          className="flex flex-col rounded-xl border border-aurora-border/70 bg-white p-1.5 shadow-aurora-sm transition-colors hover:border-aurora-primary/40 sm:p-2"
        >
          <div className="mb-0.5 flex items-center justify-between text-[10px] text-aurora-muted">
            <span className="truncate font-semibold text-aurora-text/80">{m.label}</span>
            {m.icon}
          </div>
          <div className={`truncate font-mono text-sm font-bold sm:text-base ${m.colorClass}`}>
            {m.value}
          </div>
          {m.sub && (
            <span className="block truncate text-[9px] text-aurora-muted">
              {m.sub}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};
