import Link from 'next/link';
import { BrainCircuit, Wind, Timer, StickyNote, type LucideIcon } from 'lucide-react';
import { getLabApps, type LabAppData } from '@/lib/cms';

const iconMap: Record<string, LucideIcon> = {
  BrainCircuit,
  Wind,
  Timer,
  StickyNote,
};

function AppCard({ app }: { app: LabAppData }) {
  const isLive = app.status === 'live';
  const Icon = iconMap[app.icon];

  const card = (
    <div className="group flex flex-col gap-5 p-6 rounded-xl border border-border bg-card h-full transition-all duration-200 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/8">
      <div className="flex items-start justify-between">
        <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
          {Icon && <Icon size={22} />}
        </div>
        <span
          className={`text-[10px] font-mono font-medium px-2.5 py-1 rounded-full border ${
            isLive
              ? 'bg-green-500/10 text-green-500 border-green-500/20'
              : 'bg-muted text-muted-foreground border-border'
          }`}
        >
          {isLive ? 'live' : 'coming soon'}
        </span>
      </div>

      <div className="flex flex-col gap-2 flex-1">
        <h2 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
          {app.name}
        </h2>
        <p className="text-secondary text-sm leading-relaxed">{app.description}</p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {app.tags.map((tag) => (
          <span
            key={tag}
            className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-medium"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );

  return isLive ? (
    <Link href={app.href} className="block h-full">
      {card}
    </Link>
  ) : (
    <div className="opacity-60 cursor-default">{card}</div>
  );
}

export default async function AppsPage() {
  const apps = await getLabApps();

  return (
    <main className="max-w-3xl mx-auto px-6 py-12 md:py-20">
      <div className="mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Lab</h1>
        <p className="text-secondary text-sm leading-relaxed max-w-lg">
          Small tools I built for myself. localStorage-first, no login, no tracking.
          Each one scratches an itch I had as an engineer.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {apps.map((app) => (
          <AppCard key={app.id} app={app} />
        ))}
      </div>
    </main>
  );
}
