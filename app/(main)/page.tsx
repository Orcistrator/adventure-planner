import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export default function CampaignsPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-heading font-bold text-gray-900">Campaigns</h1>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">
          + New Campaign
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="h-32 bg-gray-900 relative">
            <img
              src="https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=800&auto=format&fit=crop"
              alt="Underdark"
              className="w-full h-full object-cover opacity-50"
            />
            <div className="absolute inset-0 p-6 flex flex-col justify-end">
              <h2 className="text-2xl font-heading font-bold text-white">
                The Shattered Obelisk
              </h2>
            </div>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-600 mb-4">
              A sprawling campaign through the Underdark and beyond, dealing with ancient Netherese magic.
            </p>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Adventures
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/adventure/cistern-of-echoed-names"
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-indigo-50 text-indigo-700 text-sm font-medium flex items-center gap-2 transition-colors"
                >
                  <BookOpen size={16} />
                  The Cistern of Echoed Names
                </Link>
              </li>
              <li>
                <button className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 text-gray-600 text-sm font-medium flex items-center gap-2 transition-colors">
                  <BookOpen size={16} />
                  Ruins of Phandalin (Draft)
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
