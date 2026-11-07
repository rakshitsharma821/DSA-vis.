import React from 'react';
import { useAlgorithmStore } from '../../store/useAlgorithmStore';

interface LegendItem {
  label: string;
  color: string;
  desc: string;
}

export const Legend: React.FC = () => {
  const currentAlgorithm = useAlgorithmStore((s) => s.currentAlgorithm);
  const boardType = currentAlgorithm.boardType;

  let items: LegendItem[] = [];

  switch (boardType) {
    case 'array-sort':
    case 'divide-conquer-tree':
    case 'merge-sort-tree':
      items = [
        { label: 'Splitting / Comparing', color: 'bg-amber-500', desc: 'Dividing into subproblems or comparing P1 vs P2' },
        { label: 'Swapped / Copied', color: 'bg-fuchsia-600', desc: 'Smaller element merged or exchanged' },
        { label: 'Sorted / Merged', color: 'bg-emerald-500', desc: 'In final verified sorted arrangement' },
        { label: 'Pointers / Pivot', color: 'bg-blue-600', desc: 'Active boundary pointers (low, mid, high, pivot)' },
      ];
      break;

    case 'array-search':
    case 'array-pattern':
      items = [
        { label: 'Comparing', color: 'bg-amber-500', desc: 'Active item evaluated against target' },
        { label: 'Target Hit / Found', color: 'bg-emerald-500', desc: 'Search match confirmed' },
        { label: 'Discarded Half', color: 'bg-slate-300', desc: 'Ruled out by ordering rule' },
        { label: 'Pointers (Low/Mid/High)', color: 'bg-blue-600', desc: 'Active search range markers' },
      ];
      break;

    case 'tree-board':
    case 'graph-board':
      items = [
        { label: 'Active Node', color: 'bg-blue-600', desc: 'Currently inspected node or vertex' },
        { label: 'Visited / Settled', color: 'bg-indigo-400', desc: 'Numbered visited sequence' },
        { label: 'Target / Found', color: 'bg-emerald-500', desc: 'Target node or relaxed shortest path' },
        { label: 'Active Edge', color: 'bg-blue-500', desc: 'Active tree branch or graph arc' },
      ];
      break;

    case 'dp-table':
      items = [
        { label: 'Current Cell', color: 'bg-amber-500', desc: 'Subproblem being computed right now' },
        { label: 'Computed Subproblem', color: 'bg-emerald-500', desc: 'Optimal solution stored in table' },
        { label: 'Base Case / Table', color: 'bg-blue-600', desc: 'Zero boundary or lookup reference' },
      ];
      break;

    case 'grid-matrix':
      items = [
        { label: 'Current Cell', color: 'bg-amber-500', desc: 'Active pixel / board coordinate' },
        { label: 'Visited / Filled', color: 'bg-emerald-500', desc: 'Connected component repainted' },
        { label: 'Land Pixel', color: 'bg-amber-600', desc: 'Unvisited terrain (1)' },
        { label: 'Water Pixel', color: 'bg-blue-500', desc: 'Background water (0)' },
      ];
      break;

    case 'heap-dual':
      items = [
        { label: 'Active Key', color: 'bg-amber-500', desc: 'Element bubbling up during sift-up' },
        { label: 'Heap Invariant', color: 'bg-emerald-500', desc: 'Min/Max parent <= child satisfied' },
        { label: 'Tree / Array Sync', color: 'bg-blue-600', desc: 'Dual synchronized representation' },
      ];
      break;

    case 'linked-list':
      items = [
        { label: 'Active Pointer', color: 'bg-blue-600', desc: 'Current head, slow, or fast pointer' },
        { label: 'Inverted / Linked', color: 'bg-emerald-500', desc: 'Reversed pointer direction' },
        { label: 'Cycle Collision', color: 'bg-amber-500', desc: 'Tortoise and Hare meet point' },
      ];
      break;

    case 'stack-board':
    case 'queue-board':
      items = [
        { label: 'Top / Front', color: 'bg-blue-600', desc: 'Next item accessible by LIFO / FIFO' },
        { label: 'In Buffer', color: 'bg-emerald-500', desc: 'Active elements in container' },
        { label: 'Mismatch / Alert', color: 'bg-rose-500', desc: 'Syntax error or empty buffer' },
      ];
      break;

    case 'bit-cells':
      items = [
        { label: 'Bit 1 (Set)', color: 'bg-blue-600', desc: 'Active binary bit 1' },
        { label: 'Bit 0 (Clear)', color: 'bg-slate-300', desc: 'Inactive binary bit 0' },
        { label: 'Toggled / Result', color: 'bg-amber-500', desc: 'Bitwise operation outcome' },
      ];
      break;

    case 'disjoint-set':
      items = [
        { label: 'Root Leader', color: 'bg-emerald-500', desc: 'Set representative element' },
        { label: 'Active Union', color: 'bg-amber-500', desc: 'Two disjoint subsets being merged' },
        { label: 'Member Node', color: 'bg-blue-600', desc: 'Element pointing to parent root' },
      ];
      break;

    case 'string-ops':
      items = [
        { label: 'Matching Char', color: 'bg-emerald-500', desc: 'Characters match symmetrically' },
        { label: 'Mismatch', color: 'bg-rose-500', desc: 'Character inequality detected' },
        { label: 'Active Pointers', color: 'bg-blue-600', desc: 'Left, right, or LPS index cursor' },
      ];
      break;

    case 'recursion-tree':
      items = [
        { label: 'Active Disk / Move', color: 'bg-amber-500', desc: 'Disk currently transferring pegs' },
        { label: 'Resting Disk', color: 'bg-blue-600', desc: 'Valid stack on peg' },
        { label: 'Goal Peg C', color: 'bg-emerald-500', desc: 'Destination tower stack' },
      ];
      break;

    default:
      items = [
        { label: 'Active / Inspect', color: 'bg-blue-600', desc: 'Current evaluation' },
        { label: 'Comparing', color: 'bg-amber-500', desc: 'Values compared' },
        { label: 'Settled / Found', color: 'bg-emerald-500', desc: 'Target verified' },
      ];
  }

  return (
    <div className="flex flex-wrap items-center gap-2.5 rounded-lg border border-aurora-border/80 bg-aurora-bg px-2.5 py-1.5 text-xs">
      <span className="text-[10px] font-bold uppercase tracking-wider text-aurora-muted">
        Legend
      </span>
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5" title={item.desc}>
          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${item.color}`} />
          <span className="whitespace-nowrap text-[11px] font-medium text-aurora-text/90">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
};
