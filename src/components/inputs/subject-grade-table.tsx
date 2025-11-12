'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SubjectGrade {
  subject: string;
  level: string;
  score: string;
}

interface SubjectGradeTableProps {
  value: SubjectGrade[];
  onChange: (value: SubjectGrade[]) => void;
}

export const SubjectGradeTable = ({ value, onChange }: SubjectGradeTableProps) => {
  const handleFieldChange = (index: number, field: keyof SubjectGrade, newValue: string) => {
    const next = value.map((entry, idx) => (idx === index ? { ...entry, [field]: newValue } : entry));
    onChange(next);
  };

  const handleAddRow = () => {
    onChange([...value, { subject: '', level: '', score: '' }]);
  };

  const handleRemoveRow = (index: number) => {
    onChange(value.filter((_, idx) => idx !== index));
  };

  return (
    <div className="space-y-3">
      {value.map((row, index) => (
        <div key={index} className="grid grid-cols-1 gap-3 sm:grid-cols-4 sm:items-end">
          <div>
            <Label htmlFor={`subject-${index}`}>Subject</Label>
            <Input
              id={`subject-${index}`}
              value={row.subject}
              onChange={(event) => handleFieldChange(index, 'subject', event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor={`level-${index}`}>Level</Label>
            <Input
              id={`level-${index}`}
              value={row.level}
              onChange={(event) => handleFieldChange(index, 'level', event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor={`score-${index}`}>Score</Label>
            <Input
              id={`score-${index}`}
              value={row.score}
              onChange={(event) => handleFieldChange(index, 'score', event.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={() => handleRemoveRow(index)}>
              Remove
            </Button>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" onClick={handleAddRow}>
        Add subject
      </Button>
    </div>
  );
};
