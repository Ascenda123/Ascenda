import { validateTemplateRows, MAX_IMPORT_ROWS } from '@/app/api/admin/import/validation';

describe('admin import validation', () => {
  it('accepts valid university rows and coerces types', () => {
    const { error, rows } = validateTemplateRows('universities', [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test University',
        country: 'Canada',
        acceptance_rate: '75',
        requires_test: 'false'
      }
    ]);

    expect(error).toBeUndefined();
    expect(rows).toHaveLength(1);
    expect(rows?.[0]).toMatchObject({
      name: 'Test University',
      country: 'Canada',
      acceptance_rate: 75,
      requires_test: false
    });
  });

  it('rejects invalid templates and enforces row limits', () => {
    const invalidTemplate = validateTemplateRows('unknown' as any, []);
    expect(invalidTemplate.error).toMatch(/Invalid dataset template/);

    const tooMany = Array.from({ length: MAX_IMPORT_ROWS + 1 }, () => ({ name: 'A', country: 'B' }));
    const limitResult = validateTemplateRows('universities', tooMany);
    expect(limitResult.error).toMatch(/Row limit exceeded/);
  });
});
