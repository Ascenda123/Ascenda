'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const templates = ['universities', 'programs', 'requirements', 'deadlines'] as const;
type Template = (typeof templates)[number];

export const ImportPanel = () => {
  const [template, setTemplate] = useState<Template>('universities');
  const [status, setStatus] = useState<string>('Awaiting upload');
  const [rowCount, setRowCount] = useState<number>(0);

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setStatus('Parsing…');
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (result) => {
        setRowCount(result.data.length);
        setStatus(`Parsed ${result.data.length} rows for ${template}. (Stubbed upsert)`);
      },
      error: (error) => {
        setStatus(`Error parsing file: ${error.message}`);
      }
    });
  };

  return (
    <div className="space-y-4 rounded-[28px] border border-slate-100 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Import catalog data</h2>
        <p className="text-sm text-slate-600">
          Upload CSV exports to refresh the universities, programs, requirements, or deadlines catalog.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="template">Dataset</Label>
        <select
          id="template"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/30"
          value={template}
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
          onChange={handleFile}
          className="text-sm text-slate-600 file:mr-4 file:rounded-2xl file:border file:border-slate-200 file:bg-slate-50 file:px-4 file:py-2 file:text-slate-900"
        />
      </div>
      <p className="text-sm text-slate-500">Status: {status}</p>
      <Button type="button" variant="outline" disabled>
        Run edge function sync (TODO)
      </Button>
      {rowCount > 0 ? (
        <p className="text-xs text-slate-400">Preview limited to parsing only in this prototype.</p>
      ) : null}
    </div>
  );
};
