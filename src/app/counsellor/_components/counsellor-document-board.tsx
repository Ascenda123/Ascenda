'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  Check,
  Clock,
  FileText,
  GraduationCap,
  Mail,
  MessageSquare,
  Search
} from 'lucide-react';
import type { CounsellorDocument, CounsellorDocStatus } from '@/lib/data/student-demo-data';

const STATUS_CONFIG: Record<CounsellorDocStatus, { icon: typeof Check; label: string; color: string; bg: string }> = {
  received: { icon: Check, label: 'Received', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-200/60 dark:border-emerald-500/20' },
  pending: { icon: Clock, label: 'Pending', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10 border-amber-200/60 dark:border-amber-500/20' },
  overdue: { icon: AlertTriangle, label: 'Overdue', color: 'text-red-500', bg: 'bg-red-500/10 border-red-200/60 dark:border-red-500/20' }
};

const TYPE_ICON: Record<string, typeof FileText> = {
  transcript: GraduationCap,
  recommendation: Mail,
  essay: FileText,
  certificate: FileText,
  other: MessageSquare
};

type FilterStatus = CounsellorDocStatus | 'all';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

interface CounsellorDocumentBoardProps {
  documents: CounsellorDocument[];
}

export function CounsellorDocumentBoard({ documents }: CounsellorDocumentBoardProps) {
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = documents.filter((doc) => {
    if (statusFilter !== 'all' && doc.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        doc.studentName.toLowerCase().includes(q) ||
        doc.documentName.toLowerCase().includes(q) ||
        doc.type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Group by student
  const grouped = new Map<string, CounsellorDocument[]>();
  for (const doc of filtered) {
    const list = grouped.get(doc.studentId) ?? [];
    list.push(doc);
    grouped.set(doc.studentId, list);
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student or document..."
            className="w-full rounded-full border border-border/60 bg-background/80 pl-9 pr-4 py-2 text-sm outline-none placeholder:text-muted-foreground/50 focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
          />
        </div>
        <div className="flex items-center gap-2">
          {(['all', 'overdue', 'pending', 'received'] as const).map((status) => {
            const isActive = statusFilter === status;
            const cfg = status !== 'all' ? STATUS_CONFIG[status] : null;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs font-semibold transition',
                  isActive
                    ? status === 'all'
                      ? 'border-primary bg-primary text-primary-foreground'
                      : cn('border-transparent', cfg!.bg, cfg!.color)
                    : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted/60'
                )}
              >
                {status === 'all' ? `All (${documents.length})` : `${cfg!.label} (${documents.filter((d) => d.status === status).length})`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Document groups */}
      {[...grouped.entries()].map(([studentId, docs]) => {
        const studentName = docs[0].studentName;
        return (
          <div key={studentId} className="surface-card surface-card--static space-y-3">
            <p className="text-sm font-semibold text-foreground">{studentName}</p>
            <div className="space-y-2">
              {docs.map((doc) => {
                const cfg = STATUS_CONFIG[doc.status];
                const Icon = cfg.icon;
                const TypeIcon = TYPE_ICON[doc.type] ?? FileText;

                return (
                  <div
                    key={doc.id}
                    className={cn(
                      'flex items-center gap-4 rounded-2xl border px-4 py-3 transition',
                      doc.status === 'overdue' ? 'border-red-200/40 bg-red-500/5 dark:border-red-500/15' : 'border-border/60 bg-background/60'
                    )}
                  >
                    <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', cfg.bg)}>
                      <TypeIcon className={cn('h-4 w-4', cfg.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{doc.documentName}</p>
                      <p className="text-xs text-muted-foreground capitalize">{doc.type}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {doc.uploadedDate && (
                        <span className="text-xs text-muted-foreground">Uploaded {formatDate(doc.uploadedDate)}</span>
                      )}
                      {doc.status !== 'received' && doc.dueDate && (
                        <span className={cn('text-xs', doc.status === 'overdue' ? 'text-red-500 font-semibold' : 'text-muted-foreground')}>
                          Due {formatDate(doc.dueDate)}
                        </span>
                      )}
                      <span className={cn('flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold', cfg.bg, cfg.color)}>
                        <Icon className="h-3 w-3" />
                        {cfg.label}
                      </span>
                    </div>
                    {doc.notes && (
                      <span className="text-[11px] text-muted-foreground/70 italic max-w-[140px] truncate" title={doc.notes}>
                        {doc.notes}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {filtered.length === 0 && (
        <div className="rounded-[28px] border border-dashed border-border bg-muted/40 p-12 text-center">
          <FileText className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
          <p className="font-semibold text-foreground">No documents found</p>
          <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters or search query.</p>
        </div>
      )}
    </div>
  );
}
