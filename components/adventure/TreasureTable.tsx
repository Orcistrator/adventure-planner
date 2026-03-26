'use client';

import { useState } from 'react';
import { Dice5 } from 'lucide-react';

interface TreasureTableItem {
  roll: string;
  result: React.ReactNode;
}

interface TreasureTableProps {
  title: string;
  items: TreasureTableItem[];
}

function getStandardDie(n: number): number {
  const dice = [4, 6, 8, 10, 12, 20, 100];
  return dice.find((d) => d >= n) ?? n;
}

export default function TreasureTable({ title, items }: TreasureTableProps) {
  const [rolledIndex, setRolledIndex] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  const dieSize = getStandardDie(items.length);

  const pickResult = () => {
    const roll = Math.floor(Math.random() * dieSize) + 1;
    // Find matching item by roll value; fall back to clamping within range
    const idx = items.findIndex((item) => parseInt(item.roll) === roll);
    return idx >= 0 ? idx : Math.min(roll - 1, items.length - 1);
  };

  const handleRoll = () => {
    if (isRolling || items.length === 0) return;
    setIsRolling(true);
    setRolledIndex(null);

    let ticks = 0;
    const interval = setInterval(() => {
      setRolledIndex(Math.floor(Math.random() * items.length));
      ticks++;
      if (ticks > 10) {
        clearInterval(interval);
        setIsRolling(false);
        setRolledIndex(pickResult());
      }
    }, 50);
  };

  return (
    <div className="my-6 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h4 className="font-heading font-bold text-gray-900">{title}</h4>
        <button
          onClick={handleRoll}
          disabled={isRolling || items.length === 0}
          className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          <Dice5 size={16} className={isRolling ? 'animate-spin' : ''} />
          Roll d{dieSize}
        </button>
      </div>
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
          <tr>
            <th className="px-4 py-2 w-16 text-center">d{dieSize}</th>
            <th className="px-4 py-2">Result</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map((item, idx) => (
            <tr
              key={idx}
              className={`transition-colors ${
                rolledIndex === idx ? 'bg-indigo-50' : 'bg-white'
              }`}
            >
              <td
                className={`px-4 py-3 text-center font-mono ${
                  rolledIndex === idx ? 'text-indigo-700 font-bold' : 'text-gray-400'
                }`}
              >
                {item.roll}
              </td>
              <td
                className={`px-4 py-3 ${
                  rolledIndex === idx ? 'text-indigo-900 font-medium' : 'text-gray-700'
                }`}
              >
                {item.result}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
