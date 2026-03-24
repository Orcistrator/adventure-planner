'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Library, Map, Skull, Backpack, X, Menu } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { href: '/', label: 'Campaigns', icon: Map },
  { href: '/bestiary', label: 'Bestiary', icon: Skull },
  { href: '/items', label: 'Items Library', icon: Backpack },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gray-900 text-white rounded-md shadow-lg"
        >
          <Menu size={20} />
        </button>
      )}

      <aside
        className={`
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          fixed md:relative z-40 w-64 h-full bg-gray-900 text-gray-300
          transition-transform duration-300 ease-in-out flex flex-col shrink-0
        `}
      >
        <div className="p-4 flex items-center justify-between border-b border-gray-800">
          <Link href="/" className="flex items-center gap-2 text-white font-heading font-bold text-xl tracking-wide">
            <Library className="text-indigo-500" size={22} />
            D&D Vault
          </Link>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-gray-800 text-white'
                        : 'hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <Icon
                      size={18}
                      className={isActive ? 'text-indigo-400' : 'text-gray-400'}
                    />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 px-4">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Recent Adventures
            </h4>
            <Link
              href="/adventure/cistern-of-echoed-names"
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors ${
                pathname.startsWith('/adventure')
                  ? 'text-indigo-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span className="truncate">The Cistern of Echoed Names</span>
            </Link>
          </div>
        </nav>

        <div className="p-4 border-t border-gray-800 text-xs text-gray-500">
          DM Tools v0.1
        </div>
      </aside>
    </>
  );
}
