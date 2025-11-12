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
    <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-4">
      <div>
        <Label htmlFor="document-upload">Upload document</Label>
        <p className="text-xs text-slate-500">PDF, DOCX up to 20 MB.</p>
      </div>
      <input id="document-upload" type="file" className="text-sm" onChange={handleFileChange} />
      {status ? <p className="text-xs text-slate-500">{status}</p> : null}
      <Button type="button" variant="outline" disabled>
        Upload to Supabase (TODO)
      </Button>
    </div>
  );
};
