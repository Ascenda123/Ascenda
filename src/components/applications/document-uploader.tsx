'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface DocumentUploaderProps {
  onUpload?: (file: File) => Promise<void>;
}

export const DocumentUploader = ({ onUpload }: DocumentUploaderProps) => {
  const [status, setStatus] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!onUpload) {
      setStatus(`Selected ${file.name}`);
      return;
    }
    setStatus('Uploading…');
    await onUpload(file);
    setStatus(`Uploaded ${file.name}`);
  };

  return (
    <div className="space-y-4 rounded-[30px] border border-[#e5e5e7] bg-white p-6 text-sm shadow-[0_25px_50px_rgba(15,23,42,0.08)]">
      <div>
        <Label htmlFor="document-upload">Upload document</Label>
        <p className="text-xs text-slate-500">PDF, DOCX up to 20 MB.</p>
      </div>
      <label
        htmlFor="document-upload"
        className="group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[26px] border border-dashed border-slate-200 bg-slate-50/60 p-8 text-center transition hover:border-slate-400 hover:bg-white"
      >
        <span className="text-2xl">⬆️</span>
        <p className="text-sm font-semibold text-slate-900">Drag & drop or click to browse</p>
        <p className="text-xs text-slate-500">We auto-tag the document to the right checklist item.</p>
      </label>
      <input id="document-upload" type="file" className="hidden" onChange={handleFileChange} />
      {status ? <p className="text-xs text-slate-500">{status}</p> : <p className="text-xs text-slate-400">No document selected yet.</p>}
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="soft" disabled>
          Upload to Supabase (Coming soon)
        </Button>
        <Button type="button" variant="ghost">
          Connect Google Drive
        </Button>
      </div>
    </div>
  );
};
