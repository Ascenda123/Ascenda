'use client';

import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CounsellorStudent } from '@/lib/data/counsellor-dummy-data';
import { StudentCard } from './student-card';

interface StudentRosterProps {
  students: CounsellorStudent[];
}

type SortKey = 'name' | 'completion' | 'matchScore' | 'lastActive';
type ProgrammeFilter = 'all' | 'IB' | 'A_LEVEL';
type FlagFilter = 'all' | 'flagged' | 'clear';

function getAvgScore(s: CounsellorStudent) {
  if (s.matches.length === 0) return 0;
  return s.matches.reduce((acc, m) => acc + m.score, 0) / s.matches.length;
}

export const StudentRoster = ({ students }: StudentRosterProps) => {
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [programme, setProgramme] = useState<ProgrammeFilter>('all');
  const [flagFilter, setFlagFilter] = useState<FlagFilter>('all');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = [...students];

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (s) =>
          `${s.personal.firstName} ${s.personal.lastName}`.toLowerCase().includes(q) ||
          s.personal.school.toLowerCase().includes(q) ||
          s.personal.nationality.toLowerCase().includes(q) ||
          s.personal.schoolCountry.toLowerCase().includes(q)
      );
    }

    if (programme !== 'all') {
      list = list.filter((s) => s.academic.programmeType === programme);
    }

    if (flagFilter === 'flagged') list = list.filter((s) => s.flags.length > 0);
    if (flagFilter === 'clear') list = list.filter((s) => s.flags.length === 0);

    list.sort((a, b) => {
      switch (sortKey) {
        case 'name':
          return `${a.personal.firstName} ${a.personal.lastName}`.localeCompare(`${b.personal.firstName} ${b.personal.lastName}`);
        case 'completion':
          return b.profile.completionPct - a.profile.completionPct;
        case 'matchScore':
          return getAvgScore(b) - getAvgScore(a);
        case 'lastActive':
          return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
        default:
          return 0;
      }
    });

    return list;
  }, [students, query, sortKey, programme, flagFilter]);

  const SORT_OPTS: { key: SortKey; label: string }[] = [
    { key: 'name', label: 'Name' },
    { key: 'completion', label: 'Completion %' },
    { key: 'matchScore', label: 'Match Score' },
    { key: 'lastActive', label: 'Last Active' }
  ];

  return (
    <div className="space-y-5">
      {/* Search + filter bar */}
      <div className="glass-panel flex flex-col gap-3 rounded-[24px] px-4 py-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, school, nationality…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-full border border-border bg-background py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <button
          onClick={() => setFiltersOpen((o) => !o)}
          className={cn(
            'flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition',
            filtersOpen ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-foreground hover:bg-muted/60'
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          <ChevronDown className={cn('h-3.5 w-3.5 transition', filtersOpen && 'rotate-180')} />
        </button>

        <span className="shrink-0 text-sm text-muted-foreground">
          {filtered.length} of {students.length}
        </span>
      </div>

      {/* Expanded filters */}
      {filtersOpen && (
        <div className="surface-card surface-card--static grid grid-cols-2 gap-4 md:grid-cols-3">
          {/* Sort */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Sort by</p>
            <div className="flex flex-col gap-1">
              {SORT_OPTS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setSortKey(key)}
                  className={cn(
                    'rounded-xl px-3 py-1.5 text-left text-sm transition',
                    sortKey === key ? 'bg-primary/10 font-semibold text-primary' : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Programme */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Programme</p>
            <div className="flex flex-col gap-1">
              {(['all', 'IB', 'A_LEVEL'] as ProgrammeFilter[]).map((val) => (
                <button
                  key={val}
                  onClick={() => setProgramme(val)}
                  className={cn(
                    'rounded-xl px-3 py-1.5 text-left text-sm transition',
                    programme === val ? 'bg-primary/10 font-semibold text-primary' : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                  )}
                >
                  {val === 'all' ? 'All' : val === 'IB' ? 'IB' : 'A-Level'}
                </button>
              ))}
            </div>
          </div>

          {/* Flags */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Status</p>
            <div className="flex flex-col gap-1">
              {(['all', 'flagged', 'clear'] as FlagFilter[]).map((val) => (
                <button
                  key={val}
                  onClick={() => setFlagFilter(val)}
                  className={cn(
                    'rounded-xl px-3 py-1.5 text-left text-sm transition',
                    flagFilter === val ? 'bg-primary/10 font-semibold text-primary' : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                  )}
                >
                  {val === 'all' ? 'All students' : val === 'flagged' ? 'Needs attention' : 'On track'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((student) => (
            <StudentCard key={student.id} student={student} highlight={query.trim()} />
          ))}
        </div>
      ) : (
        <div className="rounded-[28px] border border-dashed border-border bg-muted/40 p-12 text-center">
          <p className="text-base font-semibold text-foreground">No students found</p>
          <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
};
