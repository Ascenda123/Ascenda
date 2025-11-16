'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
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
import { PROFILE_STEPS, STEP_ORDER, type StepKey, type StepCompletionMap } from '../constants';
import { CountrySelect } from '@/components/inputs/country-select';
import { HomeCountrySelect } from '@/components/inputs/home-country-select';
import { SubjectGradeTable } from '@/components/inputs/subject-grade-table';
import { Check } from 'lucide-react';

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

const STEP_PAGE_TRANSITION = {
  duration: 0.45,
  ease: [0.32, 0.72, 0, 1]
};

const STEP_PAGE_VARIANTS = {
  initial: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 72 : -72,
    filter: 'blur(12px)'
  }),
  animate: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: {
      ...STEP_PAGE_TRANSITION
    }
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -72 : 72,
    filter: 'blur(12px)',
    transition: {
      ...STEP_PAGE_TRANSITION
    }
  })
};

interface ProfileWizardProps {
  profile: Record<string, any> | null;
  academics: Record<string, any> | null;
  preferences: Record<string, any> | null;
  aspirations: Record<string, any> | null;
  initialStep: StepKey;
  stepCompletion: StepCompletionMap;
}

export const ProfileWizard = ({
  profile,
  academics,
  preferences,
  aspirations,
  initialStep,
  stepCompletion
}: ProfileWizardProps) => {
  const [currentStep, setCurrentStep] = useState<StepKey>(initialStep);
  const [completionState, setCompletionState] = useState<StepCompletionMap>(stepCompletion);
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

  const switchStep = (key: StepKey) => {
    setStatus(null);
    setCurrentStep(key);
  };

  const goToNext = (key: StepKey) => {
    const currentIndex = STEP_ORDER.indexOf(key);
    const nextKey = STEP_ORDER[currentIndex + 1] ?? 'aspirations';
    switchStep(nextKey);
  };

  const markStepComplete = (key: StepKey) => {
    setCompletionState((prev) => ({ ...prev, [key]: true }));
  };

  const handlePersonalSubmit = (values: ProfilePersonalValues) => {
    startTransition(async () => {
      await savePersonalStep(values);
      setStatus('Personal information saved');
      markStepComplete('personal');
      goToNext('personal');
    });
  };

  const handleAcademicsSubmit = (values: ProfileAcademicsValues) => {
    startTransition(async () => {
      await saveAcademicsStep(values);
      setStatus('Academic profile saved');
      markStepComplete('academics');
      goToNext('academics');
    });
  };

  const handlePreferencesSubmit = (values: ProfilePreferencesValues) => {
    startTransition(async () => {
      await savePreferencesStep(values);
      setStatus('Preferences saved');
      markStepComplete('preferences');
      goToNext('preferences');
    });
  };

  const handleAspirationsSubmit = (values: ProfileAspirationsValues) => {
    startTransition(async () => {
      await saveAspirationsStep(values);
      setStatus('Aspirations saved. You are all set!');
      markStepComplete('aspirations');
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

  const stepIndex = Math.max(0, STEP_ORDER.indexOf(currentStep));
  const previousStepIndex = useRef(stepIndex);
  const stepDirection = stepIndex >= previousStepIndex.current ? 1 : -1;

  useEffect(() => {
    previousStepIndex.current = stepIndex;
  }, [stepIndex]);

  return (
    <div className="grid form-grid form-flow text-slate-900 lg:grid-cols-[320px,1fr]">
      <aside className="form-stack">
        <Button
          asChild
          size="sm"
          variant="secondary"
          className="w-full border border-slate-900/20 text-slate-900 shadow-[0_10px_30px_rgba(15,23,42,0.12)] hover:shadow-[0_14px_34px_rgba(15,23,42,0.18)] uppercase tracking-[0.2em]"
        >
          <Link href="/profile?onboarding=true">Start profile wizard</Link>
        </Button>
        <div className="form-panel form-panel--quiet form-stack">
          <h2 className="text-xl font-semibold">Onboarding progress</h2>
          <ol className="form-stack">
            {PROFILE_STEPS.map((step, index) => {
              const complete = completionState[step.key];
              const active = currentStep === step.key;
              return (
                <li key={step.key}>
                  <button
                    type="button"
                    className={cn(
                      'flex w-full items-start gap-3 rounded-2xl p-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300',
                      active && 'bg-slate-50'
                    )}
                    onClick={() => switchStep(step.key)}
                    disabled={isPending}
                  >
                    <span
                      className={cn(
                        'mt-1 flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold shadow-sm',
                        complete
                          ? 'bg-emerald-600 text-white'
                          : active
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-500'
                      )}
                      aria-hidden
                    >
                      {complete ? <Check className="h-4 w-4" /> : index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{step.title}</p>
                      <p className="text-xs text-slate-500">{step.description}</p>
                      <p
                        className={cn(
                          'text-xs font-medium',
                          complete ? 'text-emerald-600' : active ? 'text-slate-900' : 'text-slate-400'
                        )}
                      >
                        {complete ? 'Complete' : active ? 'In progress' : 'Pending'}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </aside>
      <div className="form-panel form-panel--roomy form-stack">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-400">
          <span>
            Step {stepIndex + 1} of {PROFILE_STEPS.length}
          </span>
          <span className={completionState[currentStep] ? 'text-emerald-600' : 'text-slate-500'}>
            {completionState[currentStep] ? 'Saved' : 'In progress'}
          </span>
        </div>
        {status ? (
          <p className="form-feedback form-feedback--success" role="status">
            {status}
          </p>
        ) : null}
        <AnimatePresence mode="wait" initial={false}>
          {currentStep === 'personal' ? (
            <motion.form
              key="personal"
              className="form-stack"
              onSubmit={personalForm.handleSubmit(handlePersonalSubmit)}
              variants={STEP_PAGE_VARIANTS}
              custom={stepDirection}
              initial="initial"
              animate="animate"
              exit="exit"
            >
            <input type="hidden" {...personalForm.register('locale')} />
            <div className="form-field">
              <Label className="form-label" htmlFor="fullName">
                Full name
              </Label>
              <Input id="fullName" className="form-input" {...personalForm.register('fullName')} />
              {personalForm.formState.errors.fullName ? (
                <p className="form-feedback form-feedback--error" role="alert">
                  {personalForm.formState.errors.fullName.message}
                </p>
              ) : null}
            </div>
            <div className="form-field">
              <Label className="form-label" htmlFor="country">
                Home country
              </Label>
              <HomeCountrySelect
                id="country"
                value={personalForm.watch('country')}
                onChange={(value) => personalForm.setValue('country', value)}
              />
              {personalForm.formState.errors.country ? (
                <p className="form-feedback form-feedback--error" role="alert">
                  {personalForm.formState.errors.country.message}
                </p>
              ) : null}
            </div>
            <div className="form-field">
              <Label className="form-label" htmlFor="timeZone">
                Time zone
              </Label>
              <Input id="timeZone" className="form-input" readOnly {...personalForm.register('timeZone')} />
              {personalForm.formState.errors.timeZone ? (
                <p className="form-feedback form-feedback--error" role="alert">
                  {personalForm.formState.errors.timeZone.message}
                </p>
              ) : null}
            </div>
            <Button
              type="submit"
              variant="secondary"
              className="form-action"
              disabled={isPending}
              data-loading={isPending ? 'true' : undefined}
            >
              Save and continue
            </Button>
            </motion.form>
          ) : null}

          {currentStep === 'academics' ? (
            <motion.form
              key="academics"
              className="form-stack"
              onSubmit={academicsForm.handleSubmit(handleAcademicsSubmit)}
              variants={STEP_PAGE_VARIANTS}
              custom={stepDirection}
              initial="initial"
              animate="animate"
              exit="exit"
            >
            <div className="form-field">
              <Label className="form-label" htmlFor="curriculum">
                Curriculum
              </Label>
              <select id="curriculum" {...academicsForm.register('curriculum')} className="form-input">
                <option value="">Select curriculum</option>
                {CURRICULUM_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {academicsForm.formState.errors.curriculum ? (
                <p className="form-feedback form-feedback--error" role="alert">
                  {academicsForm.formState.errors.curriculum.message}
                </p>
              ) : null}
            </div>
            <div className="grid form-grid sm:grid-cols-2">
              <div className="form-field">
                <Label className="form-label" htmlFor="gpa">
                  GPA
                </Label>
                <Input
                  id="gpa"
                  type="number"
                  step="0.01"
                  min={0}
                  max={4}
                  className="form-input"
                  {...academicsForm.register('gpa', { valueAsNumber: true })}
                />
              </div>
              <div className="form-field">
                <Label className="form-label" htmlFor="ibTotal">
                  IB Total
                </Label>
                <Input
                  id="ibTotal"
                  type="number"
                  min={0}
                  max={45}
                  className="form-input"
                  {...academicsForm.register('ibTotal', { valueAsNumber: true })}
                />
              </div>
              <div className="form-field">
                <Label className="form-label" htmlFor="sat">
                  SAT
                </Label>
                <Input
                  id="sat"
                  type="number"
                  min={400}
                  max={1600}
                  className="form-input"
                  {...academicsForm.register('sat', { valueAsNumber: true })}
                />
              </div>
              <div className="form-field">
                <Label className="form-label" htmlFor="act">
                  ACT
                </Label>
                <Input
                  id="act"
                  type="number"
                  min={1}
                  max={36}
                  className="form-input"
                  {...academicsForm.register('act', { valueAsNumber: true })}
                />
              </div>
              <div className="form-field">
                <Label className="form-label" htmlFor="toefl">
                  TOEFL
                </Label>
                <Input
                  id="toefl"
                  type="number"
                  min={0}
                  max={120}
                  className="form-input"
                  {...academicsForm.register('toefl', { valueAsNumber: true })}
                />
              </div>
              <div className="form-field">
                <Label className="form-label" htmlFor="ielts">
                  IELTS
                </Label>
                <Input
                  id="ielts"
                  type="number"
                  min={0}
                  max={9}
                  step="0.5"
                  className="form-input"
                  {...academicsForm.register('ielts', { valueAsNumber: true })}
                />
              </div>
            </div>
            <div className="form-field">
              <Label className="form-label">Subject grades</Label>
              <SubjectGradeTable
                value={academicsForm.watch('subjectGrades')}
                onChange={(rows) => academicsForm.setValue('subjectGrades', rows)}
              />
            </div>
            <Button
              type="submit"
              variant="secondary"
              className="form-action"
              disabled={isPending}
              data-loading={isPending ? 'true' : undefined}
            >
              Save and continue
            </Button>
            </motion.form>
          ) : null}

          {currentStep === 'preferences' ? (
            <motion.form
              key="preferences"
              className="form-stack"
              onSubmit={preferencesForm.handleSubmit(handlePreferencesSubmit)}
              variants={STEP_PAGE_VARIANTS}
              custom={stepDirection}
              initial="initial"
              animate="animate"
              exit="exit"
            >
            <div className="grid form-grid sm:grid-cols-2">
              <div className="form-field">
                <Label className="form-label" htmlFor="budgetMin">
                  Budget minimum (USD)
                </Label>
                <Input
                  id="budgetMin"
                  type="number"
                  className="form-input"
                  {...preferencesForm.register('budgetMin', { valueAsNumber: true })}
                />
              </div>
              <div className="form-field">
                <Label className="form-label" htmlFor="budgetMax">
                  Budget maximum (USD)
                </Label>
                <Input
                  id="budgetMax"
                  type="number"
                  className="form-input"
                  {...preferencesForm.register('budgetMax', { valueAsNumber: true })}
                />
              </div>
            </div>
            <div className="form-field">
              <Label className="form-label" id="countries-label">
                Preferred countries
              </Label>
              <CountrySelect
                id="countries"
                name="countries"
                value={preferencesForm.watch('countries')}
                onChange={(val) => preferencesForm.setValue('countries', val)}
              />
              {preferencesForm.formState.errors.countries ? (
                <p className="form-feedback form-feedback--error" role="alert">
                  {preferencesForm.formState.errors.countries.message}
                </p>
              ) : null}
            </div>
            <div className="grid form-grid sm:grid-cols-2">
              <div className="form-field">
                <Label className="form-label" htmlFor="campusType">
                  Campus type
                </Label>
                <select id="campusType" {...preferencesForm.register('campusType')} className="form-input">
                  <option value="">Select campus type</option>
                  {CAMPUS_TYPE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {humanizeLabel(option)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <Label className="form-label" htmlFor="setting">
                  Setting
                </Label>
                <select id="setting" {...preferencesForm.register('setting')} className="form-input">
                  <option value="">Select setting</option>
                  {SETTING_TYPE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {humanizeLabel(option)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <Label className="form-label" htmlFor="size">
                  Size
                </Label>
                <select id="size" {...preferencesForm.register('size')} className="form-input">
                  <option value="">Select size</option>
                  {SIZE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {humanizeLabel(option)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <Label className="form-label" htmlFor="delivery">
                  Delivery
                </Label>
                <select id="delivery" {...preferencesForm.register('delivery')} className="form-input">
                  <option value="">Select delivery</option>
                  {DELIVERY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {humanizeLabel(option)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-field">
              <Label className="form-label" htmlFor="programLevels">
                Program level
              </Label>
              <select
                id="programLevels"
                multiple
                value={preferencesForm.watch('programLevels')}
                onChange={(event) => {
                  const selected = Array.from(event.target.selectedOptions).map((option) => option.value);
                  preferencesForm.setValue('programLevels', selected);
                }}
                className="form-input form-input--multi"
              >
                {PROGRAM_LEVEL_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {preferencesForm.formState.errors.programLevels ? (
                <p className="form-feedback form-feedback--error" role="alert">
                  {preferencesForm.formState.errors.programLevels.message}
                </p>
              ) : null}
            </div>
            <label className="form-touch-target flex items-center gap-3 text-sm text-slate-600">
              <input
                id="aidNeeded"
                type="checkbox"
                className="rounded-full border border-slate-200 accent-slate-900"
                checked={preferencesForm.watch('aidNeeded')}
                onChange={(event) => preferencesForm.setValue('aidNeeded', event.target.checked)}
              />
              <span>I need financial aid</span>
            </label>
            <Button
              type="submit"
              variant="secondary"
              className="form-action"
              disabled={isPending}
              data-loading={isPending ? 'true' : undefined}
            >
              Save and continue
            </Button>
            </motion.form>
          ) : null}

          {currentStep === 'aspirations' ? (
            <motion.form
              key="aspirations"
              className="form-stack"
              onSubmit={aspirationsForm.handleSubmit(handleAspirationsSubmit)}
              variants={STEP_PAGE_VARIANTS}
              custom={stepDirection}
              initial="initial"
              animate="animate"
              exit="exit"
            >
            <div className="form-field">
              <Label className="form-label" htmlFor="targetFields">
                Target fields
              </Label>
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
                className="form-input form-input--multi"
              >
                {TARGET_FIELD_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {aspirationsForm.formState.errors.targetFields ? (
                <p className="form-feedback form-feedback--error" role="alert">
                  {aspirationsForm.formState.errors.targetFields.message}
                </p>
              ) : null}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Input
                  placeholder="Add another field"
                  value={targetFieldOther}
                  className="form-input"
                  onChange={(event) => setTargetFieldOther(event.target.value)}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="form-action self-start"
                  disabled={!targetFieldOther.trim()}
                  onClick={handleAddTargetField}
                >
                  Add
                </Button>
              </div>
            </div>
            <div className="form-field">
              <Label className="form-label" htmlFor="jobTitles">
                Dream jobs
              </Label>
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
                className="form-input form-input--multi"
              >
                {JOB_TITLE_OPTIONS.map((title) => (
                  <option key={title} value={title}>
                    {title}
                  </option>
                ))}
              </select>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Input
                  placeholder="Add another job title"
                  value={jobTitleOther}
                  className="form-input"
                  onChange={(event) => setJobTitleOther(event.target.value)}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="form-action self-start"
                  disabled={!jobTitleOther.trim()}
                  onClick={handleAddJobTitle}
                >
                  Add
                </Button>
              </div>
            </div>
            <div className="form-field">
              <Label className="form-label" htmlFor="notes">
                Notes
              </Label>
              <textarea
                id="notes"
                className="form-input form-input--textarea"
                {...aspirationsForm.register('notes')}
              />
            </div>
            <Button
              type="submit"
              variant="secondary"
              className="form-action"
              disabled={isPending}
              data-loading={isPending ? 'true' : undefined}
            >
              Save profile
            </Button>
            </motion.form>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
};
