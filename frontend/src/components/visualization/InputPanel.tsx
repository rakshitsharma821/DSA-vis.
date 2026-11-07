import React, { useState, useEffect } from 'react';
import { useAlgorithmStore } from '../../store/useAlgorithmStore';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Shuffle,
  SlidersHorizontal,
  AlertTriangle,
} from 'lucide-react';

export const InputPanel: React.FC = () => {
  const {
    currentAlgorithm,
    input,
    inputError,
    setInput,
    generateRandomInput,
    setPreset,
  } = useAlgorithmStore();

  const isSearchAlgo = currentAlgorithm.boardType === 'array-search';

  // Local state for text input editing
  const [arrayStr, setArrayStr] = useState<string>('');
  const [targetStr, setTargetStr] = useState<string>('');
  const [isEditingCustom, setIsEditingCustom] = useState(false);

  useEffect(() => {
    if (input) {
      if (Array.isArray(input.array)) {
        setArrayStr(input.array.join(', '));
      }
      if (input.target !== undefined) {
        setTargetStr(String(input.target));
      }
    }
  }, [input]);

  const handleApplyCustom = () => {
    try {
      const parsedArray = arrayStr
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .map((s) => Number(s));

      if (parsedArray.some((n) => isNaN(n))) {
        useAlgorithmStore.setState({ inputError: 'All array values must be valid numbers' });
        return;
      }

      if (isSearchAlgo) {
        const parsedTarget = Number(targetStr);
        if (isNaN(parsedTarget)) {
          useAlgorithmStore.setState({ inputError: 'Target must be a valid number' });
          return;
        }
        setInput({ array: parsedArray, target: parsedTarget });
      } else {
        setInput({ array: parsedArray });
      }

      setIsEditingCustom(false);
    } catch (err) {
      useAlgorithmStore.setState({ inputError: 'Failed to parse custom array' });
    }
  };

  return (
    <div className="flex select-none flex-col gap-2 border-b border-aurora-border bg-white p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Input editing toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="mr-1 flex items-center gap-1.5 text-xs font-semibold text-aurora-text">
            <SlidersHorizontal className="h-3.5 w-3.5 text-aurora-primary" />
            <span>Input</span>
          </div>

          {/* Preset Buttons */}
          {currentAlgorithm.presets && currentAlgorithm.presets.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {currentAlgorithm.presets.slice(0, 3).map((preset, idx) => (
                <Button
                  key={preset.label}
                  variant="outline"
                  size="sm"
                  className="h-7 rounded-md border-aurora-border px-2.5 text-xs text-aurora-text hover:bg-aurora-bg"
                  onClick={() => setPreset(idx)}
                  title={preset.description ?? `Load the “${preset.label}” sample input`}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          )}

          {/* Random Generate Button */}
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1.5 rounded-md border-aurora-border px-2.5 text-xs text-aurora-text hover:bg-aurora-bg"
            onClick={generateRandomInput}
            title="Generate a fresh random input"
          >
            <Shuffle className="h-3 w-3 text-aurora-primary" />
            <span>Randomize</span>
          </Button>

          {/* Custom Input Toggle Button */}
          <Button
            variant={isEditingCustom ? 'secondary' : 'ghost'}
            size="sm"
            className={
              isEditingCustom
                ? 'h-7 rounded-md bg-aurora-primary-soft px-2.5 text-xs text-aurora-primary'
                : 'h-7 rounded-md px-2.5 text-xs text-aurora-muted hover:text-aurora-text'
            }
            onClick={() => setIsEditingCustom(!isEditingCustom)}
          >
            {isEditingCustom ? 'Cancel custom' : 'Custom input'}
          </Button>
        </div>

        {/* Right Info: current input summary */}
        <div className="hidden items-center gap-2 font-mono text-xs text-aurora-muted md:flex">
          <span>Array ({input?.array?.length || 0} items)</span>
          {isSearchAlgo && <span>• Target: {input?.target}</span>}
        </div>
      </div>

      {/* Expanded Custom Input Form */}
      {isEditingCustom && (
        <div className="mt-1 flex flex-wrap items-center gap-3 rounded-lg border border-aurora-border bg-aurora-bg p-3">
          <div className="min-w-[200px] flex-1">
            <label className="mb-1 block text-[11px] font-medium text-aurora-muted">
              Array elements (comma separated)
            </label>
            <Input
              value={arrayStr}
              onChange={(e) => setArrayStr(e.target.value)}
              placeholder="e.g. 5, 12, 23, 45, 67"
              className="h-8 border-aurora-border bg-white font-mono text-xs text-aurora-text"
            />
          </div>

          {isSearchAlgo && (
            <div className="w-28">
              <label className="mb-1 block text-[11px] font-medium text-aurora-muted">
                Target value
              </label>
              <Input
                value={targetStr}
                onChange={(e) => setTargetStr(e.target.value)}
                placeholder="Target"
                className="h-8 border-aurora-border bg-white font-mono text-xs text-aurora-text"
              />
            </div>
          )}

          <div className="flex items-end gap-2 pt-4">
            <Button
              size="sm"
              className="h-8 rounded-md bg-aurora-primary px-3 text-xs text-white hover:bg-aurora-primary-ink"
              onClick={handleApplyCustom}
            >
              Apply custom input
            </Button>
          </div>
        </div>
      )}

      {/* Input Validation Error Banner */}
      {inputError && (
        <div className="flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs text-rose-700">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{inputError}</span>
        </div>
      )}
    </div>
  );
};
