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
    <div className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-glow-sm backdrop-blur">
      <div>
        <Label htmlFor="document-upload">Upload document</Label>
        <p className="text-xs text-white/60">PDF, DOCX up to 20 MB.</p>
      </div>
      <input
        id="document-upload"
        type="file"
        className="text-sm text-white file:mr-4 file:rounded-2xl file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-white/80"
        onChange={handleFileChange}
      />
      {status ? <p className="text-xs text-white/60">{status}</p> : null}
      <Button type="button" variant="outline" disabled>
        Upload to Supabase (TODO)
      </Button>
    </div>
  );
};
