'use client';

import { useMemo, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  profilePersonalSchema,
  profileAcademicsSchema,
  profilePreferencesSchema,
  profileAspirationsSchema,
  CURRICULUM_OPTIONS,
  DESTINATION_COUNTRIES,
  CAMPUS_TYPE_OPTIONS,
  SETTING_TYPE_OPTIONS,
  SIZE_OPTIONS,
  DELIVERY_OPTIONS,
  PROGRAM_LEVEL_OPTIONS,
  type ProfilePersonalValues,
  type ProfileAcademicsValues,
  type ProfilePreferencesValues,
  type ProfileAspirationsValues
} from '@/lib/validation/profile';
import {
  savePersonalStep,
  saveAcademicsStep,
  savePreferencesStep,
  saveAspirationsStep
} from '../actions';
import { CountrySelect } from '@/components/inputs/country-select';
import { HomeCountrySelect } from '@/components/inputs/home-country-select';
import { SubjectGradeTable } from '@/components/inputs/subject-grade-table';

const DESTINATION_COUNTRY_SET = new Set<string>(DESTINATION_COUNTRIES);
const PROGRAM_LEVEL_SET = new Set<string>(PROGRAM_LEVEL_OPTIONS);

const humanizeLabel = (value: string) =>
  value
    .split('_')
    .map((segment) => `${segment.charAt(0).toUpperCase()}${segment.slice(1)}`)
    .join(' ');

const TARGET_FIELD_OPTIONS = [
  'Business',
  'Engineering',
  'Data Science',
  'Finance',
  'Health Sciences',
  'Law',
  'Creative Arts',
  'Technology',
  'Education'
] as const;

const JOB_TITLE_OPTIONS = [
  'Data Scientist',
  'Product Manager',
  'Software Engineer',
  'Consultant',
  'Researcher',
  'Analyst',
  'Entrepreneur',
  'Designer',
  'Investment Banker'
] as const;

interface ProfileWizardProps {
  profile: Record<string, any> | null;
  academics: Record<string, any> | null;
  preferences: Record<string, any> | null;
  aspirations: Record<string, any> | null;
}

type StepKey = 'personal' | 'academics' | 'preferences' | 'aspirations';

export const ProfileWizard = ({ profile, academics, preferences, aspirations }: ProfileWizardProps) => {
  const [currentStep, setCurrentStep] = useState<StepKey>('personal');
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<string | null>(null);
  const [targetFieldOther, setTargetFieldOther] = useState('');
  const [jobTitleOther, setJobTitleOther] = useState('');

  const deviceTimeZone = useMemo(() => {
    if (typeof Intl !== 'undefined' && typeof Intl.DateTimeFormat === 'function') {
      return Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC';
    }
    return 'UTC';
  }, []);

  const normalizedCountries = (preferences?.countries ?? []).filter((country: string) =>
    DESTINATION_COUNTRY_SET.has(country)
  );
  const initialCountries = normalizedCountries.length ? normalizedCountries : [DESTINATION_COUNTRIES[0]];

  const normalizedProgramLevels = (preferences?.program_levels ?? []).filter((level: string) =>
    PROGRAM_LEVEL_SET.has(level)
  );
  const initialProgramLevels = normalizedProgramLevels.length
    ? normalizedProgramLevels
    : [PROGRAM_LEVEL_OPTIONS[0]];

  const personalForm = useForm<ProfilePersonalValues>({
    resolver: zodResolver(profilePersonalSchema),
    defaultValues: {
      fullName: profile?.full_name ?? '',
      country: profile?.country ?? '',
      locale: profile?.locale ?? 'en',
      timeZone: profile?.time_zone ?? deviceTimeZone
    }
  });

  const academicsForm = useForm<ProfileAcademicsValues>({
    resolver: zodResolver(profileAcademicsSchema),
    defaultValues: {
      curriculum: academics?.curriculum ?? '',
      gpa: academics?.gpa ?? undefined,
      ibTotal: academics?.ib_total ?? undefined,
      sat: academics?.sat ?? undefined,
      act: academics?.act ?? undefined,
      toefl: academics?.toefl ?? undefined,
      ielts: academics?.ielts ?? undefined,
      subjectGrades: (academics?.subject_grades as any[]) ?? []
    }
  });

  const preferencesForm = useForm<ProfilePreferencesValues>({
    resolver: zodResolver(profilePreferencesSchema),
    defaultValues: {
      budgetMin: preferences?.budget_min ?? 0,
      budgetMax: preferences?.budget_max ?? 0,
      aidNeeded: preferences?.aid_needed ?? false,
      countries: initialCountries,
      campusType: preferences?.campus_type ?? undefined,
      setting: preferences?.setting ?? undefined,
      size: preferences?.size ?? undefined,
      programLevels: initialProgramLevels,
      delivery: preferences?.delivery ?? undefined
    }
  });

  const aspirationsForm = useForm<ProfileAspirationsValues>({
    resolver: zodResolver(profileAspirationsSchema),
    defaultValues: {
      targetFields: aspirations?.target_fields ?? [],
      jobTitles: aspirations?.job_titles ?? [],
      notes: aspirations?.notes ?? ''
    }
  });

  const {
    ref: targetFieldsRef,
    onChange: targetFieldsOnChange,
    onBlur: targetFieldsOnBlur,
    name: targetFieldsName
  } = aspirationsForm.register('targetFields');
  const {
    ref: jobTitlesRef,
    onChange: jobTitlesOnChange,
    onBlur: jobTitlesOnBlur,
    name: jobTitlesName
  } = aspirationsForm.register('jobTitles');

  const steps: { key: StepKey; title: string; description: string }[] = useMemo(
    () => [
      {
        key: 'personal',
        title: 'Personal details',
        description: 'Tell us about yourself so we can personalize guidance.'
      },
      {
        key: 'academics',
        title: 'Academic profile',
        description: 'Share grades and test scores to assess eligibility.'
      },
      {
        key: 'preferences',
        title: 'Preferences',
        description: 'Where do you want to study and under what conditions?'
      },
      {
        key: 'aspirations',
        title: 'Aspirations',
        description: 'Help us understand your goals and target outcomes.'
      }
    ],
    []
  );

  const goToNext = (key: StepKey) => {
    const order: StepKey[] = ['personal', 'academics', 'preferences', 'aspirations'];
    const currentIndex = order.indexOf(key);
    const nextKey = order[currentIndex + 1] ?? 'aspirations';
    setCurrentStep(nextKey);
  };

  const handlePersonalSubmit = (values: ProfilePersonalValues) => {
    startTransition(async () => {
      await savePersonalStep(values);
      setStatus('Personal information saved');
      goToNext('personal');
    });
  };

  const handleAcademicsSubmit = (values: ProfileAcademicsValues) => {
    startTransition(async () => {
      await saveAcademicsStep(values);
      setStatus('Academic profile saved');
      goToNext('academics');
    });
  };

  const handlePreferencesSubmit = (values: ProfilePreferencesValues) => {
    startTransition(async () => {
      await savePreferencesStep(values);
      setStatus('Preferences saved');
      goToNext('preferences');
    });
  };

  const handleAspirationsSubmit = (values: ProfileAspirationsValues) => {
    startTransition(async () => {
      await saveAspirationsStep(values);
      setStatus('Aspirations saved. You are all set!');
    });
  };

  const handleAddTargetField = () => {
    const trimmed = targetFieldOther.trim();
    if (!trimmed) {
      return;
    }
    const current = aspirationsForm.getValues('targetFields');
    const nextValues = current.includes(trimmed) ? current : [...current, trimmed];
    aspirationsForm.setValue('targetFields', nextValues, { shouldValidate: true });
    setTargetFieldOther('');
  };

  const handleAddJobTitle = () => {
    const trimmed = jobTitleOther.trim();
    if (!trimmed) {
      return;
    }
    const current = aspirationsForm.getValues('jobTitles');
    const nextValues = current.includes(trimmed) ? current : [...current, trimmed];
    aspirationsForm.setValue('jobTitles', nextValues, { shouldValidate: true });
    setJobTitleOther('');
  };

  return (
    <div className="grid gap-6 text-white lg:grid-cols-[320px,1fr]">
      <aside className="space-y-4">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-glow-sm backdrop-blur">
          <h2 className="font-display text-xl">Onboarding progress</h2>
          <ol className="mt-4 space-y-3">
            {steps.map((step, index) => (
              <li key={step.key} className="flex items-start gap-3">
                <span
                  className={
                    index <= steps.findIndex((item) => item.key === currentStep)
                      ? 'mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-iris to-sunrise text-xs font-semibold text-night'
                      : 'mt-1 flex h-6 w-6 items-center justify-center rounded-full border border-white/30 text-xs font-semibold text-white/60'
                  }
                  aria-hidden
                >
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{step.title}</p>
                  <p className="text-xs text-white/60">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        {status ? <p className="text-sm text-white/70">{status}</p> : null}
      </aside>
      <div className="space-y-6 rounded-4xl border border-white/10 bg-white/5 p-6 shadow-glow-sm backdrop-blur">
        {currentStep === 'personal' ? (
          <form className="space-y-4" onSubmit={personalForm.handleSubmit(handlePersonalSubmit)}>
            <input type="hidden" {...personalForm.register('locale')} />
            <div>
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" {...personalForm.register('fullName')} />
              {personalForm.formState.errors.fullName ? (
                <p className="text-xs text-red-600" role="alert">
                  {personalForm.formState.errors.fullName.message}
                </p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="country">Home country</Label>
              <HomeCountrySelect
                id="country"
                value={personalForm.watch('country')}
                onChange={(value) => personalForm.setValue('country', value)}
              />
              {personalForm.formState.errors.country ? (
                <p className="text-xs text-red-600" role="alert">
                  {personalForm.formState.errors.country.message}
                </p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="timeZone">Time zone</Label>
              <Input id="timeZone" readOnly {...personalForm.register('timeZone')} />
              {personalForm.formState.errors.timeZone ? (
                <p className="text-xs text-red-600" role="alert">
                  {personalForm.formState.errors.timeZone.message}
                </p>
              ) : null}
            </div>
            <Button type="submit" disabled={isPending}>
              Save and continue
            </Button>
          </form>
        ) : null}

        {currentStep === 'academics' ? (
          <form className="space-y-4" onSubmit={academicsForm.handleSubmit(handleAcademicsSubmit)}>
            <div>
              <Label htmlFor="curriculum">Curriculum</Label>
              <select
                id="curriculum"
                {...academicsForm.register('curriculum')}
                className="w-full rounded-2xl border border-white/10 bg-night/40 px-4 py-3 text-sm text-white shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/50"
              >
                <option value="">Select curriculum</option>
                {CURRICULUM_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {academicsForm.formState.errors.curriculum ? (
                <p className="text-xs text-red-600" role="alert">
                  {academicsForm.formState.errors.curriculum.message}
                </p>
              ) : null}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="gpa">GPA</Label>
                <Input
                  id="gpa"
                  type="number"
                  step="0.01"
                  min={0}
                  max={4}
                  {...academicsForm.register('gpa', { valueAsNumber: true })}
                />
              </div>
              <div>
                <Label htmlFor="ibTotal">IB Total</Label>
                <Input
                  id="ibTotal"
                  type="number"
                  min={0}
                  max={45}
                  {...academicsForm.register('ibTotal', { valueAsNumber: true })}
                />
              </div>
              <div>
                <Label htmlFor="sat">SAT</Label>
                <Input
                  id="sat"
                  type="number"
                  min={400}
                  max={1600}
                  {...academicsForm.register('sat', { valueAsNumber: true })}
                />
              </div>
              <div>
                <Label htmlFor="act">ACT</Label>
                <Input
                  id="act"
                  type="number"
                  min={1}
                  max={36}
                  {...academicsForm.register('act', { valueAsNumber: true })}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="toefl">TOEFL</Label>
                <Input
                  id="toefl"
                  type="number"
                  min={0}
                  max={120}
                  {...academicsForm.register('toefl', { valueAsNumber: true })}
                />
              </div>
              <div>
                <Label htmlFor="ielts">IELTS</Label>
                <Input
                  id="ielts"
                  type="number"
                  min={0}
                  max={9}
                  step="0.5"
                  {...academicsForm.register('ielts', { valueAsNumber: true })}
                />
              </div>
            </div>
            <div>
              <Label>Subject grades</Label>
              <SubjectGradeTable
                value={academicsForm.watch('subjectGrades')}
                onChange={(rows) => academicsForm.setValue('subjectGrades', rows)}
              />
            </div>
            <Button type="submit" disabled={isPending}>
              Save and continue
            </Button>
          </form>
        ) : null}

        {currentStep === 'preferences' ? (
          <form className="space-y-4" onSubmit={preferencesForm.handleSubmit(handlePreferencesSubmit)}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="budgetMin">Budget minimum (USD)</Label>
                <Input id="budgetMin" type="number" {...preferencesForm.register('budgetMin', { valueAsNumber: true })} />
              </div>
              <div>
                <Label htmlFor="budgetMax">Budget maximum (USD)</Label>
                <Input id="budgetMax" type="number" {...preferencesForm.register('budgetMax', { valueAsNumber: true })} />
              </div>
            </div>
            <div>
              <Label id="countries-label">Preferred countries</Label>
              <CountrySelect
                id="countries"
                name="countries"
                value={preferencesForm.watch('countries')}
                onChange={(val) => preferencesForm.setValue('countries', val)}
              />
              {preferencesForm.formState.errors.countries ? (
                <p className="text-xs text-red-600" role="alert">
                  {preferencesForm.formState.errors.countries.message}
                </p>
              ) : null}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="campusType">Campus type</Label>
                <select
                  id="campusType"
                  {...preferencesForm.register('campusType')}
                  className="w-full rounded-2xl border border-white/10 bg-night/40 px-4 py-3 text-sm text-white shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/50"
                >
                  <option value="">Select campus type</option>
                  {CAMPUS_TYPE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {humanizeLabel(option)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="setting">Setting</Label>
                <select
                  id="setting"
                  {...preferencesForm.register('setting')}
                  className="w-full rounded-2xl border border-white/10 bg-night/40 px-4 py-3 text-sm text-white shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/50"
                >
                  <option value="">Select setting</option>
                  {SETTING_TYPE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {humanizeLabel(option)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="size">Size</Label>
                <select
                  id="size"
                  {...preferencesForm.register('size')}
                  className="w-full rounded-2xl border border-white/10 bg-night/40 px-4 py-3 text-sm text-white shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/50"
                >
                  <option value="">Select size</option>
                  {SIZE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {humanizeLabel(option)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="delivery">Delivery</Label>
                <select
                  id="delivery"
                  {...preferencesForm.register('delivery')}
                  className="w-full rounded-2xl border border-white/10 bg-night/40 px-4 py-3 text-sm text-white shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/50"
                >
                  <option value="">Select delivery</option>
                  {DELIVERY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {humanizeLabel(option)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="programLevels">Program level</Label>
              <select
                id="programLevels"
                multiple
                value={preferencesForm.watch('programLevels')}
                onChange={(event) => {
                  const selected = Array.from(event.target.selectedOptions).map((option) => option.value);
                  preferencesForm.setValue('programLevels', selected);
                }}
                className="w-full rounded-2xl border border-white/10 bg-night/40 px-4 py-3 text-sm text-white shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/50"
              >
                {PROGRAM_LEVEL_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {preferencesForm.formState.errors.programLevels ? (
                <p className="text-xs text-red-600" role="alert">
                  {preferencesForm.formState.errors.programLevels.message}
                </p>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <input
                id="aidNeeded"
                type="checkbox"
                checked={preferencesForm.watch('aidNeeded')}
                onChange={(event) => preferencesForm.setValue('aidNeeded', event.target.checked)}
              />
              <Label htmlFor="aidNeeded">I need financial aid</Label>
            </div>
            <Button type="submit" disabled={isPending}>
              Save and continue
            </Button>
          </form>
        ) : null}

        {currentStep === 'aspirations' ? (
          <form className="space-y-4" onSubmit={aspirationsForm.handleSubmit(handleAspirationsSubmit)}>
            <div>
              <Label htmlFor="targetFields">Target fields</Label>
              <select
                id="targetFields"
                name={targetFieldsName}
                ref={targetFieldsRef}
                multiple
                value={aspirationsForm.watch('targetFields')}
                onBlur={targetFieldsOnBlur}
                onChange={(event) => {
                  const selected = Array.from(event.target.selectedOptions).map((option) => option.value);
                  aspirationsForm.setValue('targetFields', selected, { shouldValidate: true });
                  targetFieldsOnChange(event);
                }}
                className="w-full rounded-2xl border border-white/10 bg-night/40 px-4 py-3 text-sm text-white shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/50"
              >
                {TARGET_FIELD_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {aspirationsForm.formState.errors.targetFields ? (
                <p className="text-xs text-red-600" role="alert">
                  {aspirationsForm.formState.errors.targetFields.message}
                </p>
              ) : null}
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                <Input
                  placeholder="Add another field"
                  value={targetFieldOther}
                  onChange={(event) => setTargetFieldOther(event.target.value)}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="self-start"
                  disabled={!targetFieldOther.trim()}
                  onClick={handleAddTargetField}
                >
                  Add
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="jobTitles">Dream jobs</Label>
              <select
                id="jobTitles"
                name={jobTitlesName}
                ref={jobTitlesRef}
                multiple
                value={aspirationsForm.watch('jobTitles')}
                onBlur={jobTitlesOnBlur}
                onChange={(event) => {
                  const selected = Array.from(event.target.selectedOptions).map((option) => option.value);
                  aspirationsForm.setValue('jobTitles', selected, { shouldValidate: true });
                  jobTitlesOnChange(event);
                }}
                className="w-full rounded-2xl border border-white/10 bg-night/40 px-4 py-3 text-sm text-white shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/50"
              >
                {JOB_TITLE_OPTIONS.map((title) => (
                  <option key={title} value={title}>
                    {title}
                  </option>
                ))}
              </select>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                <Input
                  placeholder="Add another job title"
                  value={jobTitleOther}
                  onChange={(event) => setJobTitleOther(event.target.value)}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="self-start"
                  disabled={!jobTitleOther.trim()}
                  onClick={handleAddJobTitle}
                >
                  Add
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                className="h-32 w-full rounded-2xl border border-white/10 bg-night/40 px-4 py-3 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/50"
                {...aspirationsForm.register('notes')}
              />
            </div>
            <Button type="submit" disabled={isPending}>
              Save profile
            </Button>
          </form>
        ) : null}
      </div>
    </div>
  );
};
