'use client';

import { useState, useTransition } from 'react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { trackEvent } from '@/lib/analytics';

const templates = ['universities', 'programs', 'requirements', 'deadlines'] as const;
type Template = (typeof templates)[number];

export const ImportPanel = () => {
  const [template, setTemplate] = useState<Template>('universities');
  const [status, setStatus] = useState<string>('Awaiting upload');
  const [rowCount, setRowCount] = useState<number>(0);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isParsing, startParsing] = useTransition();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setStatus('Parsing…');
    startParsing(() => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (result: any) => {
          setRowCount(result.data.length);
          setRows(result.data as Record<string, unknown>[]);
          setStatus(`Parsed ${result.data.length} rows for ${template}. Review & sync.`);
        },
        error: (parseError: any) => {
          setStatus('Parsing failed');
          setError(parseError.message);
        }
      });
    });
  };

  const syncRows = async () => {
    if (!rows.length) return;
    setIsSyncing(true);
    setStatus('Syncing with Supabase…');
    setError(null);

    try {
      const response = await fetch('/api/admin/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template, rows })
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? 'Failed to sync data.');
      }

      setStatus(`Synced ${payload.count ?? rows.length} ${template} rows.`);
      trackEvent('admin_import_synced', { template, count: payload.count ?? rows.length });
    } catch (syncError) {
      const message = syncError instanceof Error ? syncError.message : 'Sync failed.';
      setError(message);
      setStatus('Sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-4 rounded-[28px] border border-border bg-card p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] transition-colors">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Import catalog data</h2>
        <p className="text-sm text-muted-foreground">
          Upload CSV exports to refresh the universities, programs, requirements, or deadlines catalog.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="template">Dataset</Label>
        <select
          id="template"
          className="form-input w-full text-sm text-foreground"
          value={template}
          disabled={isParsing || isSyncing}
          onChange={(event) => setTemplate(event.target.value as Template)}
        >
          {templates.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="csv-upload">Upload CSV</Label>
        <input
          id="csv-upload"
          type="file"
          accept=".csv"
          disabled={isParsing || isSyncing}
          onChange={handleFile}
          className="text-sm text-muted-foreground file:mr-4 file:rounded-2xl file:border file:border-border file:bg-muted/60 file:px-4 file:py-2 file:text-foreground"
        />
      </div>
      <p className="text-sm text-muted-foreground">Status: {status}</p>
      {error ? (
        <p className="text-xs text-red-500" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="button" variant="outline" disabled={!rows.length || isSyncing} onClick={syncRows}>
        {isSyncing ? 'Syncing…' : 'Run data sync'}
      </Button>
      {rowCount > 0 ? (
        <p className="text-xs text-muted-foreground">Ready to sync {rowCount} rows. Server-side validation runs before upserts.</p>
      ) : null}
    </div>
  );
};
