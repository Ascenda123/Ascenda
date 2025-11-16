'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useSupabase } from '@/hooks/useSupabase';
import { trackEvent } from '@/lib/analytics';

interface DocumentUploaderProps {
  onUpload?: (file: File) => Promise<void>;
}

export const DocumentUploader = ({ onUpload }: DocumentUploaderProps) => {
  const supabase = useSupabase();
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploaded, setUploaded] = useState<{ name: string; url?: string }[]>([]);

  const bucket = useMemo(() => process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? 'application-documents', []);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);

    if (file.size > 20 * 1024 * 1024) {
      setStatus(null);
      setError('File exceeds 20 MB limit.');
      return;
    }

    if (!onUpload) {
      setIsUploading(true);
      setStatus('Uploading…');

      try {
        const path = `documents/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
        const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
          upsert: false
        });

        if (uploadError) {
          throw uploadError;
        }

        const { data: signedUrl } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60);
        setUploaded((prev) => [...prev, { name: file.name, url: signedUrl?.signedUrl }]);
        setStatus(`Uploaded ${file.name}`);
        trackEvent('document_uploaded', { fileName: file.name, bucket });
      } catch (uploadError) {
        const message = uploadError instanceof Error ? uploadError.message : 'Unable to upload document.';
        setError(message);
        setStatus(null);
      } finally {
        setIsUploading(false);
      }
      return;
    }

    setStatus('Uploading…');
    try {
      await onUpload(file);
      setStatus(`Uploaded ${file.name}`);
      trackEvent('document_uploaded_custom_handler', { fileName: file.name });
    } catch (customError) {
      const message = customError instanceof Error ? customError.message : 'Upload failed.';
      setError(message);
      setStatus(null);
    }
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
      <input id="document-upload" type="file" className="hidden" onChange={handleFileChange} disabled={isUploading} />
      {status ? <p className="text-xs text-slate-500">{status}</p> : <p className="text-xs text-slate-400">No document selected yet.</p>}
      {error ? (
        <p className="text-xs text-red-500" role="alert">
          {error}
        </p>
      ) : null}
      {uploaded.length ? (
        <ul className="space-y-2 text-xs text-slate-600">
          {uploaded.map((item) => (
            <li key={`${item.name}-${item.url ?? 'local'}`} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 px-3 py-2">
              <span className="truncate font-medium">{item.name}</span>
              {item.url ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] uppercase tracking-[0.3em] text-slate-500 hover:text-slate-900"
                >
                  View
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="soft" disabled={isUploading}>
          {isUploading ? 'Uploading…' : 'Upload to Supabase'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => trackEvent('document_drive_connect_clicked')}
        >
          Connect Google Drive
        </Button>
      </div>
    </div>
  );
};
