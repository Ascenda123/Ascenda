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
    <div className="space-y-3 rounded-[28px] border border-slate-100 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div>
        <Label htmlFor="document-upload">Upload document</Label>
        <p className="text-xs text-slate-500">PDF, DOCX up to 20 MB.</p>
      </div>
      <input
        id="document-upload"
        type="file"
        className="text-sm text-slate-600 file:mr-4 file:rounded-2xl file:border file:border-slate-200 file:bg-slate-50 file:px-4 file:py-2 file:text-slate-900"
        onChange={handleFileChange}
      />
      {status ? <p className="text-xs text-slate-500">{status}</p> : null}
      <Button type="button" variant="outline" disabled>
        Upload to Supabase (TODO)
      </Button>
    </div>
  );
};
