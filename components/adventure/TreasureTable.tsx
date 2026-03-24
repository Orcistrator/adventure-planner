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

export default function TreasureTable({ title, items }: TreasureTableProps) {
  const [rolledIndex, setRolledIndex] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  const handleRoll = () => {
    if (isRolling) return;
    setIsRolling(true);
    setRolledIndex(null);

    let rolls = 0;
    const interval = setInterval(() => {
      setRolledIndex(Math.floor(Math.random() * items.length));
      rolls++;
      if (rolls > 10) {
        clearInterval(interval);
        setIsRolling(false);
        setRolledIndex(Math.floor(Math.random() * items.length));
      }
    }, 50);
  };

  return (
    <div className="my-6 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h4 className="font-heading font-bold text-gray-900">{title}</h4>
        <button
          onClick={handleRoll}
          disabled={isRolling}
          className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          <Dice5 size={16} className={isRolling ? 'animate-spin' : ''} />
          Roll
        </button>
      </div>
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
          <tr>
            <th className="px-4 py-2 w-16 text-center">d100</th>
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
                  rolledIndex === idx
                    ? 'text-indigo-700 font-bold'
                    : 'text-gray-500'
                }`}
              >
                {item.roll}
              </td>
              <td
                className={`px-4 py-3 ${
                  rolledIndex === idx ? 'text-indigo-900' : 'text-gray-700'
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
