import React, { useEffect, useMemo, useState } from 'react';
import {
  Scale,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Shuffle,
  CheckCircle2,
  CircleDashed,
  Clock,
  HardDrive,
  Info,
  Lightbulb,
  BookOpen,
  AlertTriangle,
} from 'lucide-react';

interface ProblemPreset {
  id: string;
  name: string;
  shortName: string;
  subtitle: string;
  codeNumber: string;
  target: number | null;
  array: number[];
  solAName: string;
  solADesc: string;
  solBName: string;
  solBDesc: string;
  solATime: string;
  solASpace: string;
  solBTime: string;
  solBSpace: string;
  aIdea: string;
  bIdea: string;
  aWhen: string;
  bWhen: string;
  pseudocodeA: string[];
  pseudocodeB: string[];
}

const PRESETS: ProblemPreset[] = [
  {
    id: 'two-sum',
    name: 'Two Sum — find a pair that hits the target',
    shortName: 'Two Sum',
    subtitle: 'Brute force compares every pair; the hash map remembers what it still needs.',
    codeNumber: 'LeetCode #1',
    target: 9,
    array: [2, 7, 11, 15, 3, 6, 8, 1],
    solAName: 'Check every pair',
    solADesc:
      'Take the first index, then compare it with every later index. If no pair works, move the first index forward.',
    solBName: 'Remember complements',
    solBDesc:
      'Scan once. For each value, check whether its complement (target − value) has already been seen, then store the value.',
    solATime: 'O(n²)',
    solASpace: 'O(1)',
    solBTime: 'O(n)',
    solBSpace: 'O(n)',
    aIdea: 'Enumerate all i < j pairs and test nums[i] + nums[j] == target.',
    bIdea: 'Store each value with its index and look up target − value in O(1) expected time.',
    aWhen: 'Tiny arrays, or when no extra memory is allowed.',
    bWhen: 'Large arrays, when O(n) extra memory is acceptable.',
    pseudocodeA: [
      'for i in range(len(nums)):',
      '    for j in range(i + 1, len(nums)):',
      '        if nums[i] + nums[j] == target:',
      '            return [i, j]',
      'return []',
    ],
    pseudocodeB: [
      'seen = {}',
      'for i, num in enumerate(nums):',
      '    complement = target - num',
      '    if complement in seen:',
      '        return [seen[complement], i]',
      '    seen[num] = i',
      'return []',
    ],
  },
  {
    id: 'max-subarray',
    name: 'Maximum Subarray — largest contiguous sum',
    shortName: 'Max Subarray',
    subtitle: 'Enumerating every window is quadratic; Kadane keeps one running best per ending index.',
    codeNumber: 'LeetCode #53',
    target: null,
    array: [-2, 1, -3, 4, -1, 2, 1, -5, 4],
    solAName: 'Enumerate every window',
    solADesc:
      'Fix a start index, extend the end index one step at a time, and keep the largest sum seen.',
    solBName: "Kadane's one-pass scan",
    solBDesc:
      'At each index, either extend the previous subarray or restart at the current value — whichever is larger.',
    solATime: 'O(n²)',
    solASpace: 'O(1)',
    solBTime: 'O(n)',
    solBSpace: 'O(1)',
    aIdea: 'Evaluate all n(n + 1)/2 contiguous windows.',
    bIdea: 'Track the best sum ending at each index, so earlier work is never recomputed.',
    aWhen: 'You need every window sum anyway, not just the maximum.',
    bWhen: 'You only need the maximum sum and want linear time.',
    pseudocodeA: [
      'best = -infinity',
      'for i in range(len(nums)):',
      '    current = 0',
      '    for j in range(i, len(nums)):',
      '        current += nums[j]',
      '        best = max(best, current)',
      'return best',
    ],
    pseudocodeB: [
      'current = nums[0]',
      'best = nums[0]',
      'for i in range(1, len(nums)):',
      '    current = max(nums[i], current + nums[i])',
      '    best = max(best, current)',
      'return best',
    ],
  },
  {
    id: 'search-sorted',
    name: 'Search in a sorted array',
    shortName: 'Sorted Search',
    subtitle: 'Linear scan checks values one by one; binary search halves the remaining range each step.',
    codeNumber: 'LeetCode #704',
    target: 15,
    array: [1, 2, 3, 6, 7, 8, 11, 15],
    solAName: 'Linear scan',
    solADesc: 'Check each element from left to right until the target appears or the array ends.',
    solBName: 'Binary search',
    solBDesc:
      'Compare the middle element with the target and discard the half that cannot contain it.',
    solATime: 'O(n)',
    solASpace: 'O(1)',
    solBTime: 'O(log n)',
    solBSpace: 'O(1)',
    aIdea: 'Inspect every element in order.',
    bIdea: 'Use the sorted order to discard half of the remaining range at every comparison.',
    aWhen: 'The array is unsorted, or it changes too often to keep sorted.',
    bWhen: 'The array is sorted and you need many lookups.',
    pseudocodeA: [
      'for i in range(len(nums)):',
      '    if nums[i] == target:',
      '        return i',
      'return -1',
    ],
    pseudocodeB: [
      'low, high = 0, len(nums) - 1',
      'while low <= high:',
      '    mid = (low + high) // 2',
      '    if nums[mid] == target:',
      '        return mid',
      '    elif nums[mid] < target:',
      '        low = mid + 1',
      '    else:',
      '        high = mid - 1',
      'return -1',
    ],
  },
  {
    id: 'find-duplicates',
    name: 'Contains Duplicate — does any value repeat?',
    shortName: 'Duplicates',
    subtitle: 'Pairwise comparison checks every combination; a set answers after one pass.',
    codeNumber: 'LeetCode #217',
    target: null,
    array: [4, 5, 6, 7, 5, 9, 1, 2],
    solAName: 'Compare every pair',
    solADesc: 'For each index, compare against every later index. The first equal pair proves a duplicate.',
    solBName: 'Remember seen values',
    solBDesc: 'Insert each value into a set. If an insertion is already present, the array has a duplicate.',
    solATime: 'O(n²)',
    solASpace: 'O(1)',
    solBTime: 'O(n)',
    solBSpace: 'O(n)',
    aIdea: 'Test all n(n − 1)/2 pairs for equality.',
    bIdea: 'Trade memory for expected O(1) membership tests.',
    aWhen: 'Memory is tight and n is small.',
    bWhen: 'n is large and a little extra memory is fine.',
    pseudocodeA: [
      'for i in range(len(nums)):',
      '    for j in range(i + 1, len(nums)):',
      '        if nums[i] == nums[j]:',
      '            return true',
      'return false',
    ],
    pseudocodeB: [
      'seen = set()',
      'for num in nums:',
      '    if num in seen:',
      '        return true',
      '    seen.add(num)',
      'return false',
    ],
  },
];

interface TraceStep {
  message: string;
  codeLine: number;
  pointer?: Record<string, number>;
  highlight?: number[];
  aux?: string;
  solved?: boolean;
  comparisons: number;
}

const MAX_VALUES = 12;

function twoSumBrute(nums: number[], target: number): TraceStep[] {
  const steps: TraceStep[] = [];
  let comparisons = 0;
  for (let i = 0; i < nums.length - 1; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      comparisons++;
      const sum = nums[i] + nums[j];
      const match = sum === target;
      steps.push({
        message: `nums[${i}] + nums[${j}] = ${nums[i]} + ${nums[j]} = ${sum}${
          match ? ` — this equals the target, so return [${i}, ${j}].` : `, which is not ${target}. Keep scanning.`
        }`,
        codeLine: match ? 4 : 3,
        pointer: { i, j },
        highlight: [i, j],
        aux: `${comparisons} pair ${comparisons === 1 ? 'check' : 'checks'}`,
        solved: match,
        comparisons,
      });
      if (match) return steps;
    }
  }
  steps.push({
    message: `All pairs were checked and none sums to ${target}, so the answer is an empty result.`,
    codeLine: 5,
    aux: `${comparisons} pair checks`,
    solved: false,
    comparisons,
  });
  return steps;
}

function twoSumHash(nums: number[], target: number): TraceStep[] {
  const seen = new Map<number, number>();
  const steps: TraceStep[] = [];
  let probes = 0;

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    const hit = seen.get(complement);
    probes++;
    const entries = [...seen.entries()].map(([value, index]) => `${value}→${index}`).join(', ');

    if (hit !== undefined) {
      steps.push({
        message: `Complement for nums[${i}] = ${nums[i]} is ${target} − ${nums[i]} = ${complement}. It was stored at index ${hit}, so return [${hit}, ${i}].`,
        codeLine: 5,
        pointer: { i, seen: hit },
        highlight: [hit, i],
        aux: `seen = { ${entries} }`,
        solved: true,
        comparisons: probes,
      });
      return steps;
    }

    seen.set(nums[i], i);
    steps.push({
      message: `Complement ${target} − ${nums[i]} = ${complement} is not in seen yet. Store ${nums[i]} at index ${i} and continue.`,
      codeLine: 6,
      pointer: { i },
      highlight: [i],
      aux: seen.size === 0 ? 'seen = { }' : `seen = { ${entries} }`,
      comparisons: probes,
    });
  }

  steps.push({
    message: `The scan ended without finding a complement, so there is no valid pair.`,
    codeLine: 7,
    aux: `${probes} lookups`,
    solved: false,
    comparisons: probes,
  });
  return steps;
}

function maxSubarrayBrute(nums: number[]): TraceStep[] {
  const steps: TraceStep[] = [];
  if (nums.length === 0) return steps;
  let best = -Infinity;
  let comparisons = 0;

  for (let i = 0; i < nums.length; i++) {
    let current = 0;
    for (let j = i; j < nums.length; j++) {
      current += nums[j];
      comparisons++;
      best = Math.max(best, current);
      steps.push({
        message: `Window [${i}..${j}] sums to ${current}. Best window sum so far is ${best}.`,
        codeLine: 6,
        pointer: { i, j },
        highlight: Array.from({ length: j - i + 1 }, (_, k) => i + k),
        aux: `best = ${best}`,
        solved: true,
        comparisons,
      });
    }
  }

  steps.push({
    message: `All windows have been enumerated. The largest contiguous sum is ${best}.`,
    codeLine: 7,
    aux: `${comparisons} window sums`,
    solved: true,
    comparisons,
  });
  return steps;
}

function kadane(nums: number[]): TraceStep[] {
  if (nums.length === 0) return [];
  const steps: TraceStep[] = [];
  let current = nums[0];
  let best = nums[0];
  let start = 0;
  let comparisons = 1;

  steps.push({
    message: `Start with the first value: current = best = ${nums[0]}.`,
    codeLine: 2,
    pointer: { i: 0 },
    highlight: [0],
    aux: `current = ${current}, best = ${best}`,
    solved: true,
    comparisons,
  });

  for (let i = 1; i < nums.length; i++) {
    const extended = current + nums[i];
    if (nums[i] > extended) {
      current = nums[i];
      start = i;
    } else {
      current = extended;
    }
    best = Math.max(best, current);
    comparisons++;
    steps.push({
      message:
        nums[i] > extended
          ? `nums[${i}] = ${nums[i]} is larger than ${extended}, so restart the subarray at index ${i}. Current sum is ${current}; best is ${best}.`
          : `Extending the previous subarray gives ${extended}, which is at least nums[${i}] = ${nums[i]}. Current sum is ${current}; best is ${best}.`,
      codeLine: nums[i] > extended ? 4 : 5,
      pointer: { i, start },
      highlight: Array.from({ length: i - start + 1 }, (_, k) => start + k),
      aux: `current = ${current}, best = ${best}`,
      solved: true,
      comparisons,
    });
  }

  steps.push({
    message: `The scan is complete. The maximum subarray sum is ${best}.`,
    codeLine: 6,
    aux: `${comparisons} scan steps`,
    solved: true,
    comparisons,
  });
  return steps;
}

function linearSearch(nums: number[], target: number): TraceStep[] {
  const steps: TraceStep[] = [];
  let comparisons = 0;

  for (let i = 0; i < nums.length; i++) {
    comparisons++;
    const match = nums[i] === target;
    steps.push({
      message: match
        ? `nums[${i}] = ${nums[i]} equals the target ${target}, so return index ${i}.`
        : `nums[${i}] = ${nums[i]} is not ${target}. Move to the next index.`,
      codeLine: match ? 3 : 2,
      pointer: { i },
      highlight: [i],
      aux: `${comparisons} ${comparisons === 1 ? 'comparison' : 'comparisons'}`,
      solved: match,
      comparisons,
    });
    if (match) return steps;
  }

  steps.push({
    message: `The array ended without finding ${target}, so return -1.`,
    codeLine: 4,
    aux: `${comparisons} comparisons`,
    solved: false,
    comparisons,
  });
  return steps;
}

function binarySearch(nums: number[], target: number): TraceStep[] {
  const steps: TraceStep[] = [];
  let comparisons = 0;
  let low = 0;
  let high = nums.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    comparisons++;
    const value = nums[mid];
    const isBigger = value < target;
    const match = value === target;

    steps.push({
      message: match
        ? `mid = ${mid}, and nums[${mid}] = ${value} is the target. Return index ${mid}.`
        : `mid = ${mid}, nums[${mid}] = ${value} is ${isBigger ? 'smaller' : 'larger'} than ${target}, so keep the ${
            isBigger ? 'right' : 'left'
          } half.`,
      codeLine: match ? 4 : isBigger ? 6 : 8,
      pointer: { low, mid, high },
      highlight: [mid],
      aux: `range [${low}..${high}]`,
      solved: match,
      comparisons,
    });

    if (match) return steps;
    if (isBigger) low = mid + 1;
    else high = mid - 1;
  }

  steps.push({
    message: `The search range is empty, so ${target} is not present. Return -1.`,
    codeLine: 10,
    aux: `${comparisons} comparisons`,
    solved: false,
    comparisons,
  });
  return steps;
}

function duplicatesBrute(nums: number[]): TraceStep[] {
  const steps: TraceStep[] = [];
  let comparisons = 0;

  for (let i = 0; i < nums.length - 1; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      comparisons++;
      const match = nums[i] === nums[j];
      steps.push({
        message: match
          ? `nums[${i}] = nums[${j}] = ${nums[i]}, so a duplicate exists. Return true.`
          : `nums[${i}] = ${nums[i]} and nums[${j}] = ${nums[j]} differ. Continue with the next pair.`,
        codeLine: match ? 4 : 3,
        pointer: { i, j },
        highlight: [i, j],
        aux: `${comparisons} pair ${comparisons === 1 ? 'check' : 'checks'}`,
        solved: match,
        comparisons,
      });
      if (match) return steps;
    }
  }

  steps.push({
    message: 'Every pair was compared and no value repeats, so return false.',
    codeLine: 5,
    aux: `${comparisons} pair checks`,
    solved: false,
    comparisons,
  });
  return steps;
}

function duplicatesSet(nums: number[]): TraceStep[] {
  const seen = new Set<number>();
  const steps: TraceStep[] = [];
  let probes = 0;

  for (let i = 0; i < nums.length; i++) {
    probes++;
    const exists = seen.has(nums[i]);
    const seenText = seen.size === 0 ? 'seen = { }' : `seen = { ${[...seen].join(', ')} }`;

    if (exists) {
      steps.push({
        message: `nums[${i}] = ${nums[i]} is already in the set, so the array contains a duplicate. Return true.`,
        codeLine: 4,
        pointer: { i },
        highlight: [i],
        aux: seenText,
        solved: true,
        comparisons: probes,
      });
      return steps;
    }

    seen.add(nums[i]);
    steps.push({
      message: `nums[${i}] = ${nums[i]} is new. Add it to the set and continue.`,
      codeLine: 5,
      pointer: { i },
      highlight: [i],
      aux: seenText,
      comparisons: probes,
    });
  }

  steps.push({
    message: 'The scan ended with no repeated value, so return false.',
    codeLine: 6,
    aux: `${probes} probes`,
    solved: false,
    comparisons: probes,
  });
  return steps;
}

function buildTraces(preset: ProblemPreset, nums: number[], target: number) {
  switch (preset.id) {
    case 'two-sum':
      return { a: twoSumBrute(nums, target), b: twoSumHash(nums, target) };
    case 'max-subarray':
      return { a: maxSubarrayBrute(nums), b: kadane(nums) };
    case 'search-sorted':
      return { a: linearSearch(nums, target), b: binarySearch(nums, target) };
    case 'find-duplicates':
      return { a: duplicatesBrute(nums), b: duplicatesSet(nums) };
    default:
      return { a: twoSumBrute(nums, target), b: twoSumHash(nums, target) };
  }
}

function worstCaseCounts(presetId: string, n: number) {
  switch (presetId) {
    case 'two-sum':
    case 'find-duplicates':
      return { a: (n * (n - 1)) / 2, b: n };
    case 'max-subarray':
      return { a: (n * (n + 1)) / 2, b: n };
    case 'search-sorted':
      return { a: n, b: Math.ceil(Math.log2(n + 1)) };
    default:
      return { a: n, b: n };
  }
}

function formatNumber(value: number) {
  return value.toLocaleString('en-US');
}

export const ComparePage: React.FC = () => {
  const [selectedProblemId, setSelectedProblemId] = useState<string>('two-sum');
  const activePreset = PRESETS.find((p) => p.id === selectedProblemId) ?? PRESETS[0];

  const [target, setTarget] = useState<number>(activePreset.target ?? 0);
  const [arrayStr, setArrayStr] = useState<string>(`[${activePreset.array.join(', ')}]`);
  const [nums, setNums] = useState<number[]>(activePreset.array);
  const [inputError, setInputError] = useState<string | null>(null);

  const [cursor, setCursor] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);

  // Binary search only runs on sorted data, so we sort a display copy and say so.
  const sortedForSearch = selectedProblemId === 'search-sorted';
  const effectiveNums = useMemo(
    () => (sortedForSearch ? [...nums].sort((x, y) => x - y) : nums),
    [nums, sortedForSearch],
  );
  const wasReordered = useMemo(
    () => sortedForSearch && nums.some((value, index) => value !== effectiveNums[index]),
    [nums, effectiveNums, sortedForSearch],
  );

  const { a: traceA, b: traceB } = useMemo(
    () => buildTraces(activePreset, effectiveNums, target),
    [activePreset, effectiveNums, target],
  );

  const totalSteps = Math.max(traceA.length, traceB.length, 1);

  const handleSelectProblem = (id: string) => {
    const preset = PRESETS.find((item) => item.id === id) ?? PRESETS[0];
    setSelectedProblemId(id);
    setTarget(preset.target ?? 0);
    setNums(preset.array);
    setArrayStr(`[${preset.array.join(', ')}]`);
    setCursor(0);
    setIsPlaying(false);
    setInputError(null);
  };

  const handleRandomize = () => {
    let next: number[] = [];
    let nextTarget = 0;

    if (selectedProblemId === 'two-sum') {
      next = Array.from({ length: 8 }, () => Math.floor(Math.random() * 20) + 1);
      const first = Math.floor(Math.random() * next.length);
      let second = Math.floor(Math.random() * next.length);
      while (second === first) second = Math.floor(Math.random() * next.length);
      nextTarget = next[first] + next[second];
    } else if (selectedProblemId === 'search-sorted') {
      next = Array.from(new Set(Array.from({ length: 8 }, () => Math.floor(Math.random() * 40) + 1))).sort(
        (x, y) => x - y,
      );
      nextTarget = next[Math.floor(Math.random() * next.length)];
    } else if (selectedProblemId === 'max-subarray') {
      next = Array.from({ length: 9 }, () => Math.floor(Math.random() * 19) - 9);
    } else {
      next = Array.from({ length: 8 }, () => Math.floor(Math.random() * 12) + 1);
    }

    setNums(next);
    setArrayStr(`[${next.join(', ')}]`);
    if (activePreset.target !== null) setTarget(nextTarget);
    setCursor(0);
    setIsPlaying(false);
    setInputError(null);
  };

  const handleArrayChange = (value: string) => {
    setArrayStr(value);
    try {
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed) || parsed.some((item) => typeof item !== 'number' || Number.isNaN(item))) {
        setInputError('Use a JSON array of numbers, for example [2, 7, 11, 15].');
        return;
      }
      const clipped = parsed.slice(0, MAX_VALUES);
      setNums(clipped);
      setInputError(
        parsed.length > MAX_VALUES
          ? `The interactive view shows the first ${MAX_VALUES} values to keep both traces readable.`
          : null,
      );
      setCursor(0);
      setIsPlaying(false);
    } catch {
      setInputError('Use a JSON array of numbers, for example [2, 7, 11, 15].');
    }
  };

  useEffect(() => {
    if (!isPlaying) return;
    const delay = Math.max(180, 1200 / speed);
    const timer = setInterval(() => {
      setCursor((prev) => {
        if (prev >= totalSteps - 1) {
          setIsPlaying(false);
          return totalSteps - 1;
        }
        return prev + 1;
      });
    }, delay);
    return () => clearInterval(timer);
  }, [isPlaying, speed, totalSteps]);

  const displayA = traceA[Math.min(cursor, Math.max(traceA.length - 1, 0))];
  const displayB = traceB[Math.min(cursor, Math.max(traceB.length - 1, 0))];
  const finalA = traceA[traceA.length - 1];
  const finalB = traceB[traceB.length - 1];
  const doneA = cursor >= traceA.length - 1;
  const doneB = cursor >= traceB.length - 1;

  const progressPercent = totalSteps > 1 ? (cursor / (totalSteps - 1)) * 100 : 0;

  const renderPanel = (
    version: 'a' | 'b',
    trace: TraceStep[],
    step: TraceStep | undefined,
    done: boolean,
  ) => {
    const isA = version === 'a';
    const name = isA ? activePreset.solAName : activePreset.solBName;
    const desc = isA ? activePreset.solADesc : activePreset.solBDesc;
    const time = isA ? activePreset.solATime : activePreset.solBTime;
    const space = isA ? activePreset.solASpace : activePreset.solBSpace;
    const pseudocode = isA ? activePreset.pseudocodeA : activePreset.pseudocodeB;
    const solvedNow = step?.solved;

    return (
      <article
        className={`flex flex-col rounded-2xl border bg-white p-4 shadow-aurora-sm sm:p-5 ${
          isA ? 'border-rose-200/80' : 'border-aurora-secondary/30'
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-aurora-border pb-3">
          <div className="min-w-0">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                isA ? 'bg-rose-50 text-rose-600' : 'bg-aurora-secondary-soft text-aurora-secondary'
              }`}
            >
              Solution {isA ? 'A' : 'B'}
            </span>
            <h2 className="mt-1.5 text-base font-extrabold tracking-tight text-aurora-text sm:text-lg">
              {name}
            </h2>
            <p className="mt-1 text-[11px] leading-relaxed text-aurora-muted">{desc}</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1 font-mono text-[11px] font-bold">
            <span className="rounded-md bg-aurora-bg px-2 py-0.5 text-aurora-text">Time {time}</span>
            <span className="rounded-md bg-aurora-secondary-soft px-2 py-0.5 text-aurora-secondary">
              Space {space}
            </span>
          </div>
        </div>

        {/* Array with pointers */}
        <div className="mt-3 rounded-xl border border-aurora-border bg-aurora-bg/70 p-3">
          <div className="flex flex-wrap gap-1.5">
            {effectiveNums.map((value, index) => {
              const highlighted = step?.highlight?.includes(index) ?? false;
              const labels = step?.pointer
                ? Object.entries(step.pointer)
                    .filter(([, pointerIndex]) => pointerIndex === index)
                    .map(([label]) => label)
                : [];

              return (
                <div
                  key={index}
                  className={`relative flex h-12 w-11 flex-col items-center justify-center rounded-lg border text-center transition-all ${
                    highlighted
                      ? solvedNow
                        ? 'border-emerald-400 bg-emerald-50 text-emerald-700 shadow-sm'
                        : 'border-aurora-primary bg-aurora-primary-soft text-aurora-primary shadow-sm'
                      : 'border-aurora-border bg-white text-aurora-text'
                  }`}
                >
                  <span className="font-mono text-sm font-bold leading-none">{value}</span>
                  <span className="mt-0.5 font-mono text-[9px] leading-none text-aurora-muted">#{index}</span>
                  {labels.length > 0 && (
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-aurora-primary px-1.5 py-[1px] font-mono text-[8px] font-bold text-white">
                      {labels.join(' · ')}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] text-aurora-muted">
            <span>{step?.aux ?? 'No auxiliary state yet'}</span>
            <span
              className={`rounded-full px-2 py-0.5 font-bold ${
                done
                  ? step?.solved
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-rose-50 text-rose-600'
                  : 'bg-aurora-primary-soft text-aurora-primary'
              }`}
            >
              {done
                ? step?.solved
                  ? 'Answer found'
                  : 'Exhausted — no answer'
                : `Step ${Math.min(cursor + 1, trace.length)} of ${trace.length}`}
            </span>
          </div>
        </div>

        {/* Explanation for this step */}
        <div
          className={`mt-3 rounded-xl border p-3 ${
            solvedNow
              ? 'border-emerald-200 bg-emerald-50/70'
              : 'border-aurora-border bg-white'
          }`}
        >
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-aurora-muted">
            {solvedNow ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <CircleDashed className="h-3.5 w-3.5 text-aurora-primary" />
            )}
            <span>What this step does</span>
          </div>
          <p className="mt-1 min-h-[32px] text-[11px] leading-relaxed text-aurora-text sm:text-xs">
            {step?.message ?? 'Edit the input and press Play to generate a trace.'}
          </p>
        </div>

        {/* Pseudocode */}
        <div className="mt-3 rounded-xl border border-aurora-border bg-aurora-bg/60 p-3">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-aurora-muted">
              Pseudocode
            </span>
            <span className="font-mono text-[10px] text-aurora-primary">
              Line {step?.codeLine ?? 1}
            </span>
          </div>
          <div className="space-y-0.5 font-mono text-[11px] leading-relaxed">
            {pseudocode.map((line, index) => {
              const lineNumber = index + 1;
              const active = lineNumber === step?.codeLine;
              return (
                <div
                  key={line}
                  className={`flex items-start gap-2 rounded px-1.5 py-0.5 ${
                    active
                      ? isA
                        ? 'bg-rose-50 font-bold text-rose-600'
                        : 'bg-aurora-secondary-soft font-bold text-aurora-secondary'
                      : 'text-aurora-muted'
                  }`}
                >
                  <span className="w-4 shrink-0 select-none text-right text-[9px] text-aurora-muted/50">
                    {lineNumber}
                  </span>
                  <span className="whitespace-pre-wrap break-words">{line}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-aurora-border pt-2 text-[10px] text-aurora-muted">
          <span className="font-semibold text-aurora-text">{Math.min(cursor + 1, trace.length)} step(s) shown</span>
          <span className="text-aurora-border">•</span>
          <span>{step?.comparisons ?? 0} comparisons / probes</span>
          <span className="text-aurora-border">•</span>
          <span>Done: {done ? 'yes' : 'no'}</span>
        </div>
      </article>
    );
  };

  const scalingRows = [10, 100, 1000].map((n) => ({ n, ...worstCaseCounts(selectedProblemId, n) }));

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-aurora-bg text-aurora-text">
      <div className="pointer-events-none absolute -top-40 left-1/3 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-aurora-primary/8 blur-[110px]" />
      <div className="pointer-events-none absolute right-0 top-40 h-80 w-80 rounded-full bg-aurora-secondary/8 blur-[100px]" />

      <section className="relative mx-auto w-full max-w-7xl px-4 pb-10 pt-6 sm:px-8 sm:pt-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-aurora-muted">
            <span className="inline-flex items-center gap-1.5 text-aurora-primary">
              <Scale className="h-3.5 w-3.5" />
              Practice
            </span>
            <span className="text-aurora-border">/</span>
            <span className="text-aurora-text">Compare &amp; Learn</span>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-aurora-border bg-white px-3 py-1.5 text-[11px] font-semibold text-aurora-muted shadow-aurora-sm">
            <BookOpen className="h-3.5 w-3.5 text-aurora-secondary" />
            Step counts come from the traces on this page
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-aurora-primary-soft px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-aurora-primary">
              <Scale className="h-3.5 w-3.5" />
              Two solutions, one input
            </span>
            <h1 className="mt-3 max-w-3xl font-heading text-3xl font-extrabold leading-tight tracking-tight text-aurora-text sm:text-4xl">
              Watch the trade-off, not just the answer.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-aurora-muted sm:text-base">
              Pick a problem and step both approaches through the same input. Each panel runs the
              algorithm it names, so you can see where the extra memory buys fewer checks — and
              what it costs when the input is small.
            </p>
          </div>

          <div className="rounded-2xl border border-aurora-border bg-white p-4 shadow-aurora-sm">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-aurora-muted">
              <Info className="h-3.5 w-3.5 text-aurora-primary" />
              How to read the numbers
            </div>
            <p className="mt-1.5 text-[11px] leading-relaxed text-aurora-muted">
              A “step” is one comparison or one hash lookup emitted by the trace. It is a teaching
              count, not a wall-clock benchmark. Big-O describes growth, not seconds.
            </p>
          </div>
        </div>

        {/* Problem selector */}
        <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {PRESETS.map((preset) => {
            const active = preset.id === selectedProblemId;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectProblem(preset.id)}
                aria-pressed={active}
                className={`rounded-2xl border p-3.5 text-left transition-all ${
                  active
                    ? 'border-aurora-primary bg-white shadow-aurora-md ring-1 ring-aurora-primary/15'
                    : 'border-aurora-border bg-white/70 hover:border-aurora-primary/30 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] font-bold text-aurora-muted">
                    {preset.codeNumber}
                  </span>
                  <span
                    className={`h-2 w-2 rounded-full ${active ? 'bg-aurora-primary' : 'bg-aurora-border'}`}
                  />
                </div>
                <div className="mt-1 text-sm font-bold text-aurora-text">{preset.shortName}</div>
                <div className="mt-1 text-[10px] leading-snug text-aurora-muted">
                  {preset.solATime} vs {preset.solBTime}
                </div>
              </button>
            );
          })}
        </div>

        {/* Input bar */}
        <div className="mt-4 rounded-2xl border border-aurora-border bg-white p-4 shadow-aurora-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex-1">
              <label htmlFor="compare-nums" className="mb-1 block text-[10px] font-bold uppercase tracking-[0.14em] text-aurora-muted">
                nums
              </label>
              <input
                id="compare-nums"
                type="text"
                value={arrayStr}
                onChange={(event) => handleArrayChange(event.target.value)}
                className="w-full rounded-xl border border-aurora-border bg-aurora-bg px-3 py-2 font-mono text-xs text-aurora-text outline-none transition-all focus:border-aurora-primary/40 focus:bg-white focus:ring-2 focus:ring-aurora-primary/15"
              />
            </div>

            {activePreset.target !== null && (
              <div className="w-full lg:w-36">
                <label htmlFor="compare-target" className="mb-1 block text-[10px] font-bold uppercase tracking-[0.14em] text-aurora-muted">
                  target
                </label>
                <input
                  id="compare-target"
                  type="number"
                  value={target}
                  onChange={(event) => {
                    setTarget(Number(event.target.value));
                    setCursor(0);
                    setIsPlaying(false);
                  }}
                  className="w-full rounded-xl border border-aurora-border bg-aurora-bg px-3 py-2 font-mono text-xs font-bold text-aurora-text outline-none transition-all focus:border-aurora-primary/40 focus:bg-white focus:ring-2 focus:ring-aurora-primary/15"
                />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 lg:pt-4">
              <button
                type="button"
                onClick={handleRandomize}
                className="inline-flex items-center gap-1.5 rounded-xl border border-aurora-border bg-white px-3.5 py-2 text-[11px] font-bold text-aurora-text transition-colors hover:border-aurora-primary/30 hover:text-aurora-primary"
              >
                <Shuffle className="h-3.5 w-3.5" />
                Randomize
              </button>
              <button
                type="button"
                onClick={() => {
                  setCursor(0);
                  setIsPlaying(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-aurora-primary px-4 py-2 text-[11px] font-bold text-white shadow-[0_10px_20px_-12px_rgba(99,91,255,0.9)] transition-all hover:bg-aurora-primary-ink active:scale-[0.98]"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                Run both
              </button>
            </div>
          </div>

          {inputError && (
            <div className="mt-2 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] text-amber-800">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{inputError}</span>
            </div>
          )}
          {wasReordered && (
            <div className="mt-2 flex items-start gap-2 rounded-lg border border-aurora-border bg-aurora-bg px-3 py-1.5 text-[11px] text-aurora-muted">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-aurora-primary" />
              <span>
                Binary search needs sorted data, so Solution B reads the values in sorted order.
                Solution A still scans the original order.
              </span>
            </div>
          )}
        </div>

        {/* Playback */}
        <div className="mt-3 rounded-2xl border border-aurora-border bg-white px-4 py-3 shadow-aurora-sm">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  setCursor(0);
                  setIsPlaying(false);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-aurora-border bg-white text-aurora-muted transition-colors hover:bg-aurora-bg hover:text-aurora-text"
                title="Reset both traces"
                aria-label="Reset both traces"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCursor((prev) => Math.max(0, prev - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-aurora-border bg-white text-aurora-text transition-colors hover:bg-aurora-bg disabled:opacity-40"
                title="Previous step"
                aria-label="Previous step"
                disabled={cursor <= 0}
              >
                <SkipBack className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsPlaying((prev) => !prev)}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-aurora-primary px-3.5 text-[11px] font-bold text-white shadow-sm transition-all hover:bg-aurora-primary-ink active:scale-[0.98]"
              >
                {isPlaying ? (
                  <Pause className="h-3.5 w-3.5 fill-current" />
                ) : (
                  <Play className="h-3.5 w-3.5 fill-current" />
                )}
                {isPlaying ? 'Pause' : cursor >= totalSteps - 1 ? 'Replay' : 'Play'}
              </button>
              <button
                onClick={() => setCursor((prev) => Math.min(totalSteps - 1, prev + 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-aurora-border bg-white text-aurora-text transition-colors hover:bg-aurora-bg disabled:opacity-40"
                title="Next step"
                aria-label="Next step"
                disabled={cursor >= totalSteps - 1}
              >
                <SkipForward className="h-4 w-4" />
              </button>
            </div>

            <div className="min-w-[180px] flex-1">
              <div className="mb-1 flex items-center justify-between font-mono text-[10px] text-aurora-muted">
                <span>
                  Step <strong className="text-aurora-text">{Math.min(cursor + 1, totalSteps)}</strong> of{' '}
                  {totalSteps}
                </span>
                <span>{Math.round(progressPercent)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={totalSteps - 1}
                value={cursor}
                onChange={(event) => setCursor(Number(event.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-aurora-border accent-aurora-primary"
                aria-label="Scrub both traces"
              />
            </div>

            <div className="flex items-center gap-1 rounded-lg border border-aurora-border bg-aurora-bg p-0.5">
              {[1, 2, 4].map((value) => (
                <button
                  key={value}
                  onClick={() => setSpeed(value)}
                  className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-bold transition-colors ${
                    speed === value
                      ? 'bg-white text-aurora-primary shadow-sm'
                      : 'text-aurora-muted hover:text-aurora-text'
                  }`}
                >
                  {value}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {wasReordered && (
          <p className="mt-2 flex items-center gap-1.5 text-[10px] text-aurora-muted">
            <AlertTriangle className="h-3 w-3" />
            Displayed order for both panels: [{effectiveNums.join(', ')}]
          </p>
        )}
      </section>

      {/* Dual panels */}
      <section className="relative mx-auto w-full max-w-7xl px-4 pb-3 sm:px-8">
        <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2">
          {renderPanel('a', traceA, displayA, doneA)}
          {renderPanel('b', traceB, displayB, doneB)}
        </div>
      </section>

      {/* Verdict */}
      <section className="relative mx-auto w-full max-w-7xl px-4 py-3 sm:px-8">
        <div className="flex flex-col gap-4 rounded-2xl border border-aurora-border bg-white p-5 shadow-aurora-sm sm:flex-row sm:items-start">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-aurora-secondary-soft text-aurora-secondary">
            <CheckCircle2 className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-aurora-secondary">
              What this input shows
            </span>
            <h3 className="mt-0.5 text-sm font-bold text-aurora-text sm:text-base">
              {finalA && finalB
                ? finalA.solved && finalB.solved
                  ? 'Both approaches reach an answer here.'
                  : finalA.solved
                    ? 'Only Solution A reaches an answer on this input.'
                    : finalB.solved
                      ? 'Only Solution B reaches an answer on this input.'
                      : 'Neither approach finds an answer on this input.'
                : 'Run the traces to see the comparison.'}
            </h3>
            <p className="mt-1 max-w-3xl text-[11px] leading-relaxed text-aurora-muted sm:text-xs">
              {finalA && finalB && (
                <>
                  Solution A emitted <strong className="text-aurora-text">{finalA.comparisons}</strong>{' '}
                  comparison step{finalA.comparisons === 1 ? '' : 's'} on this input; Solution B emitted{' '}
                  <strong className="text-aurora-text">{finalB.comparisons}</strong>. The difference
                  comes from the strategy, not from a fabricated speed multiplier — try the other
                  inputs to see how the gap changes.
                </>
              )}
            </p>
            <div className="mt-2 flex flex-wrap gap-2 text-[10px]">
              <span className="rounded-full bg-aurora-bg px-2.5 py-0.5 font-bold text-aurora-muted">
                Solution A: {activePreset.solATime} time · {activePreset.solASpace} space
              </span>
              <span className="rounded-full bg-aurora-secondary-soft px-2.5 py-0.5 font-bold text-aurora-secondary">
                Solution B: {activePreset.solBTime} time · {activePreset.solBSpace} space
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Complexity comparison + scaling */}
      <section className="relative mx-auto w-full max-w-7xl px-4 pb-16 pt-3 sm:px-8">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <div className="xl:col-span-7 rounded-2xl border border-aurora-border bg-white p-5 shadow-aurora-sm">
            <div className="flex flex-wrap items-end justify-between gap-2 border-b border-aurora-border pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-aurora-muted">
                  Side by side
                </span>
                <h3 className="mt-0.5 text-sm font-bold text-aurora-text sm:text-base">
                  {activePreset.shortName} at a glance
                </h3>
              </div>
              <span className="font-mono text-[10px] text-aurora-muted">{activePreset.codeNumber}</span>
            </div>

            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-[11px]">
                <thead>
                  <tr className="border-b border-aurora-border text-[10px] uppercase tracking-wider text-aurora-muted">
                    <th className="py-2 pr-3 font-bold">Dimension</th>
                    <th className="py-2 pr-3 font-bold text-rose-600">Solution A</th>
                    <th className="py-2 font-bold text-aurora-secondary">Solution B</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-aurora-border/70">
                  <tr>
                    <td className="py-2 pr-3 font-semibold text-aurora-text">Worst-case time</td>
                    <td className="py-2 pr-3 font-mono">{activePreset.solATime}</td>
                    <td className="py-2 font-mono font-bold text-aurora-secondary">
                      {activePreset.solBTime}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3 font-semibold text-aurora-text">Auxiliary space</td>
                    <td className="py-2 pr-3 font-mono">{activePreset.solASpace}</td>
                    <td className="py-2 font-mono">{activePreset.solBSpace}</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3 font-semibold text-aurora-text">Core idea</td>
                    <td className="py-2 pr-3 text-aurora-muted">{activePreset.aIdea}</td>
                    <td className="py-2 text-aurora-muted">{activePreset.bIdea}</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3 font-semibold text-aurora-text">Prefer it when</td>
                    <td className="py-2 pr-3 text-aurora-muted">{activePreset.aWhen}</td>
                    <td className="py-2 text-aurora-muted">{activePreset.bWhen}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="mt-3 flex items-start gap-1.5 text-[10px] leading-relaxed text-aurora-muted">
              <Info className="mt-0.5 h-3 w-3 shrink-0 text-aurora-primary" />
              Hash-based bounds are expected (average) costs; adversarial collisions can degrade
              them. The trace uses a JavaScript Map/Set, which resolves lookups in practice.
            </p>
          </div>

          <div className="xl:col-span-5 rounded-2xl border border-aurora-border bg-white p-5 shadow-aurora-sm">
            <div className="border-b border-aurora-border pb-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-aurora-muted">
                Growth, not a benchmark
              </span>
              <h3 className="mt-0.5 text-sm font-bold text-aurora-text sm:text-base">
                Worst-case operation counts
              </h3>
              <p className="mt-1 text-[10px] leading-relaxed text-aurora-muted">
                Calculated from the complexity of each approach at these sizes. Real runtimes also
                depend on the machine, language and constant factors.
              </p>
            </div>

            <div className="mt-3 space-y-2">
              {scalingRows.map((row) => (
                <div
                  key={row.n}
                  className="flex items-center justify-between rounded-xl border border-aurora-border bg-aurora-bg px-3 py-2"
                >
                  <span className="font-mono text-xs font-bold text-aurora-text">n = {formatNumber(row.n)}</span>
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="text-rose-600">{formatNumber(Math.round(row.a))} A</span>
                    <span className="text-aurora-muted">vs</span>
                    <span className="font-bold text-aurora-secondary">
                      {formatNumber(Math.round(row.b))} B
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 rounded-xl border border-aurora-accent/25 bg-aurora-accent-soft p-3">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-aurora-text">
                <Lightbulb className="h-3.5 w-3.5 text-aurora-accent" />
                Takeaway
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-aurora-text/80">
                The faster approach is not automatically better. Solution B buys fewer operations
                with extra memory; Solution A is the safer choice when that memory is not available
                or the input is tiny.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border border-aurora-border bg-white/70 px-4 py-2.5 text-[10px] text-aurora-muted">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-aurora-primary" />
            Time bounds are asymptotic
          </span>
          <span className="inline-flex items-center gap-1.5">
            <HardDrive className="h-3 w-3 text-aurora-secondary" />
            Space counts auxiliary memory
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Scale className="h-3 w-3 text-aurora-accent" />
            Always state the input assumptions
          </span>
        </div>
      </section>
    </div>
  );
};
