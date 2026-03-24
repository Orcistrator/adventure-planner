import { Search } from 'lucide-react';
import EntityLink from '@/components/entities/EntityLink';
import ReadAloud from '@/components/adventure/ReadAloud';
import TreasureTable from '@/components/adventure/TreasureTable';
import EncounterTracker from '@/components/adventure/EncounterTracker';

export default function AdventurePage() {
  return (
    <div className="min-h-full bg-white pb-24">
      {/* Hero */}
      <header className="relative h-[60vh] min-h-[400px] flex items-end pb-12 pt-32">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2568&auto=format&fit=crop"
            alt="Ruins at night"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 w-full">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-white font-semibold tracking-wider text-sm">
              LEVEL 4
            </span>
            <span className="px-2 py-0.5 border border-amber-500 text-amber-400 text-xs font-bold tracking-widest uppercase rounded-sm">
              Desert
            </span>
            <span className="px-2 py-0.5 border border-teal-500 text-teal-400 text-xs font-bold tracking-widest uppercase rounded-sm">
              Ruins
            </span>
          </div>

          <h1 className="font-heading text-5xl md:text-7xl text-white font-bold leading-tight mb-4 drop-shadow-lg">
            The Cistern of
            <br />
            Echoed Names
          </h1>

          <div className="flex items-center gap-2 text-gray-300 text-lg">
            <Search size={20} />
            <span>Mystery</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
          {/* Left Column */}
          <div>
            <p className="drop-cap text-lg leading-relaxed text-gray-700 mb-6">
              t the edge of a salt-blasted plateau stands a stone arch that hums
              softly when the wind passes through it. Beyond the arch lies the
              Cistern of Echoed Names, a sanctum where voices are drawn from
              water and given fleeting form.
            </p>

            <h2 className="font-heading text-3xl font-bold text-gray-900 mt-10 mb-4">
              The Thirsting Antechamber
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              This circular chamber slopes inward toward a dry basin carved with
              overlapping names in dozens of scripts. The walls weep condensation
              that never quite reaches the floor, evaporating just before it can
              pool.
            </p>
            <p className="text-gray-700 leading-relaxed mb-6">
              <strong className="text-gray-900">Carvings.</strong> A character
              examining the basin finds their name etched among the others, even
              if they do not share it aloud.
            </p>

            <ReadAloud
              text="The chamber is quiet, yet you feel watched. Names—some familiar, some utterly alien—are carved again and again into the stone basin at the room's center. As you step closer, your own name briefly darkens among them, then fades."
              prompts={[
                {
                  trigger: 'a player speaks their name aloud',
                  response:
                    'The condensation on the walls momentarily freezes, and a faint, mocking echo of their voice bounces from the dry basin.',
                },
                {
                  trigger: 'a player touches the basin',
                  response:
                    'The stone is bone-dry and unnaturally warm. A sudden thirst grips you, parching your throat instantly.',
                },
              ]}
            />

            <EncounterTracker
              title="The Thirsting Shadows"
              monsters={[{ id: 'echoing-shade', count: 2 }]}
            />
          </div>

          {/* Right Column */}
          <div>
            <h3 className="font-heading text-2xl font-bold text-gray-900 mb-3">
              M1: Narrow Channel
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              A narrow channel leads from the basin into a low passageway, its
              edges smoothed by centuries of flowing water that no longer comes.
            </p>
            <div className="text-gray-700 leading-relaxed mb-10">
              <strong className="text-gray-900">Treasure.</strong> Hidden beneath
              loose stone in the basin is a{' '}
              <EntityLink id="silver-vial">silver vial</EntityLink> that refills
              with fresh water at dawn.
            </div>

            <h2 className="font-heading text-3xl font-bold text-gray-900 mt-10 mb-4">
              The Reservoir of Answering Voices
            </h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              This rectangular chamber is dominated by a deep, still pool fed by
              unseen sources. Pale light emanates from the water itself,
              illuminating the vaulted ceiling above.
            </p>

            <ReadAloud text="The water is perfectly still, reflecting your faces with unsettling clarity. When one of you exhales, ripples spread across the pool, and a voice—yours, but not—softly repeats the sound back." />

            <div className="text-gray-700 leading-relaxed mb-6">
              <strong className="text-gray-900">Pool.</strong> Speaking a
              creature&apos;s true name causes the water to briefly glow
              brighter. If the name belongs to a hostile entity, a{' '}
              <EntityLink id="water-weird">Water Weird</EntityLink> forms from
              the pool and attacks.
            </div>

            <TreasureTable
              title="Reservoir Plinth Offerings"
              items={[
                {
                  roll: '01-40',
                  result: 'A handful of tarnished copper coins from an unknown empire.',
                },
                {
                  roll: '41-70',
                  result: 'A dried desert flower that blooms when touched by water.',
                },
                {
                  roll: '71-90',
                  result: (
                    <span>
                      A <EntityLink id="silver-vial">Silver Vial of Dawn</EntityLink>
                    </span>
                  ),
                },
                {
                  roll: '91-00',
                  result:
                    'A perfectly spherical pearl that whispers secrets when held to the ear.',
                },
              ]}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
