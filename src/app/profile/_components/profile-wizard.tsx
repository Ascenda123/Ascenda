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
import { SubjectGradeTable } from '@/components/inputs/subject-grade-table';

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

  const personalForm = useForm<ProfilePersonalValues>({
    resolver: zodResolver(profilePersonalSchema),
    defaultValues: {
      fullName: profile?.full_name ?? '',
      country: profile?.country ?? '',
      locale: profile?.locale ?? 'en',
      timeZone: profile?.time_zone ?? 'UTC'
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
      countries: preferences?.countries ?? [],
      languages: preferences?.languages ?? ['English'],
      campusType: preferences?.campus_type ?? undefined,
      setting: preferences?.setting ?? undefined,
      size: preferences?.size ?? undefined,
      programLevels: preferences?.program_levels ?? ['Undergraduate'],
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

  return (
    <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
      <aside className="space-y-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold">Onboarding progress</h2>
          <ol className="mt-4 space-y-3">
            {steps.map((step, index) => (
              <li key={step.key} className="flex items-start gap-3">
                <span
                  className={
                    index <= steps.findIndex((item) => item.key === currentStep)
                      ? 'mt-1 h-6 w-6 rounded-full bg-slate-900 text-center text-xs font-semibold text-white'
                      : 'mt-1 h-6 w-6 rounded-full border border-slate-300 text-center text-xs font-semibold text-slate-500'
                  }
                  aria-hidden
                >
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{step.title}</p>
                  <p className="text-xs text-slate-500">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        {status ? <p className="text-sm text-slate-600">{status}</p> : null}
      </aside>
      <div className="space-y-6">
        {currentStep === 'personal' ? (
          <form className="space-y-4" onSubmit={personalForm.handleSubmit(handlePersonalSubmit)}>
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
              <Input id="country" {...personalForm.register('country')} />
              {personalForm.formState.errors.country ? (
                <p className="text-xs text-red-600" role="alert">
                  {personalForm.formState.errors.country.message}
                </p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="locale">Preferred language</Label>
              <Input id="locale" {...personalForm.register('locale')} />
            </div>
            <div>
              <Label htmlFor="timeZone">Time zone</Label>
              <Input id="timeZone" {...personalForm.register('timeZone')} />
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
              <Input id="curriculum" {...academicsForm.register('curriculum')} />
              {academicsForm.formState.errors.curriculum ? (
                <p className="text-xs text-red-600" role="alert">
                  {academicsForm.formState.errors.curriculum.message}
                </p>
              ) : null}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="gpa">GPA</Label>
                <Input id="gpa" type="number" step="0.01" {...academicsForm.register('gpa', { valueAsNumber: true })} />
              </div>
              <div>
                <Label htmlFor="ibTotal">IB Total</Label>
                <Input id="ibTotal" type="number" {...academicsForm.register('ibTotal', { valueAsNumber: true })} />
              </div>
              <div>
                <Label htmlFor="sat">SAT</Label>
                <Input id="sat" type="number" {...academicsForm.register('sat', { valueAsNumber: true })} />
              </div>
              <div>
                <Label htmlFor="act">ACT</Label>
                <Input id="act" type="number" {...academicsForm.register('act', { valueAsNumber: true })} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="toefl">TOEFL</Label>
                <Input id="toefl" type="number" {...academicsForm.register('toefl', { valueAsNumber: true })} />
              </div>
              <div>
                <Label htmlFor="ielts">IELTS</Label>
                <Input id="ielts" type="number" step="0.5" {...academicsForm.register('ielts', { valueAsNumber: true })} />
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
            <div>
              <Label htmlFor="languages">Preferred languages</Label>
              <Input id="languages" {...preferencesForm.register('languages.0')} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="campusType">Campus type</Label>
                <Input id="campusType" {...preferencesForm.register('campusType')} />
              </div>
              <div>
                <Label htmlFor="setting">Setting</Label>
                <Input id="setting" {...preferencesForm.register('setting')} />
              </div>
              <div>
                <Label htmlFor="size">Size</Label>
                <Input id="size" {...preferencesForm.register('size')} />
              </div>
              <div>
                <Label htmlFor="delivery">Delivery</Label>
                <Input id="delivery" {...preferencesForm.register('delivery')} />
              </div>
            </div>
            <div>
              <Label htmlFor="programLevels">Program level</Label>
              <Input id="programLevels" {...preferencesForm.register('programLevels.0')} />
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
              <Input id="targetFields" {...aspirationsForm.register('targetFields.0')} />
              {aspirationsForm.formState.errors.targetFields ? (
                <p className="text-xs text-red-600" role="alert">
                  {aspirationsForm.formState.errors.targetFields.message}
                </p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="jobTitles">Dream jobs</Label>
              <Input id="jobTitles" {...aspirationsForm.register('jobTitles.0')} />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                className="h-32 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
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
