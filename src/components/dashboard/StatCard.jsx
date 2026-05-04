import { cn } from '@/lib/utils';

export default function StatCard({ icon: Icon, label, value, sublabel, colorClass }) {
  return (
    <div className="bg-card rounded-2xl border border-border p-5 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
          <p className="text-3xl font-bold mt-1 tracking-tight">{value}</p>
          {sublabel && (
            <p className="text-xs text-muted-foreground mt-1">{sublabel}</p>
          )}
        </div>
        <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center', colorClass || 'bg-accent')}>
          <Icon className="h-5 w-5 text-accent-foreground" />
        </div>
      </div>
    </div>
  );
}