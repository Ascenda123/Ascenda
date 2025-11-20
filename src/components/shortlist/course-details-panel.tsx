'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { NotebookPen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CourseModule {
  name: string;
  credits: string;
  highlight: string;
}

interface CourseSchedule {
  tutorials: string;
  seminars: string;
  assessments: string;
}

export interface ShortlistCourse {
  id: string;
  university: string;
  program: string;
  location: string;
  fitScore: number;
  stage: string;
  nextAction: string;
  modules: CourseModule[];
  immersion: string;
  schedule: CourseSchedule;
}

export const CourseDetailsPanel = ({ courses }: { courses: ShortlistCourse[] }) => {
  const [activeId, setActiveId] = useState(() => courses[0]?.id ?? null);

  const activeCourse = useMemo(() => courses.find((course) => course.id === activeId), [courses, activeId]);

  if (courses.length === 0) {
    return (
      <div className="rounded-[28px] border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center">
        <p className="text-lg font-semibold text-slate-900">No courses selected yet</p>
        <p className="text-sm text-slate-500">Add programs to your shortlist from search or matches to see details here.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.38fr,1fr]">
      <div className="rounded-[28px] border border-slate-100 bg-slate-50/70 p-4">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Select a course</p>
        <div className="mt-4 space-y-3">
          {courses.map((course) => {
            const isActive = activeCourse?.id === course.id;
            return (
              <button
                key={course.id}
                type="button"
                onClick={() => setActiveId(course.id)}
                className={cn(
                  'w-full rounded-2xl border px-4 py-3 text-left transition',
                  isActive
                    ? 'border-slate-900 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.12)]'
                    : 'border-slate-200 bg-white/70 hover:border-slate-400 hover:bg-white'
                )}
              >
                <p className="text-xs uppercase tracking-[0.4em] text-slate-400">{course.university}</p>
                <p className="text-sm font-semibold text-slate-900">{course.program}</p>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>{course.location}</span>
                  <span className="font-semibold text-slate-900">{course.fitScore}% fit</span>
                </div>
                <p className="mt-1 text-[0.65rem] uppercase tracking-[0.35em] text-slate-400">{course.stage}</p>
              </button>
            );
          })}
        </div>
      </div>
      {activeCourse ? (
        <article className="flex flex-col gap-4 rounded-[30px] border border-slate-100 bg-slate-50/70 p-5 shadow-[0_20px_55px_rgba(15,23,42,0.08)]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">{activeCourse.university}</p>
              <h3 className="text-2xl font-semibold text-slate-900">{activeCourse.program}</h3>
              <p className="text-sm text-slate-500">{activeCourse.location}</p>
            </div>
            <div className="rounded-2xl bg-white px-4 py-2 text-right shadow-sm">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Fit</p>
              <p className="text-2xl font-semibold text-slate-900">{activeCourse.fitScore}%</p>
              <p className="text-xs text-slate-500">{activeCourse.stage}</p>
            </div>
            <Link
              href={`/course/${activeCourse.id}`}
              className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-600 underline-offset-4 hover:underline"
            >
              Open course page
            </Link>
          </div>
          <div className="rounded-[26px] border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Modules</p>
            <ul className="mt-3 space-y-3">
              {activeCourse.modules.map((module) => (
                <li key={module.name} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">{module.name}</p>
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">{module.credits}</span>
                  </div>
                  <p className="text-xs text-slate-500">{module.highlight}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid gap-4 text-sm text-slate-600 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-100 bg-white px-3 py-2">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Tutorials</p>
              <p className="font-semibold text-slate-900">{activeCourse.schedule.tutorials}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white px-3 py-2">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Seminars / studios</p>
              <p className="font-semibold text-slate-900">{activeCourse.schedule.seminars}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white px-3 py-2">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Assessments</p>
              <p className="font-semibold text-slate-900">{activeCourse.schedule.assessments}</p>
            </div>
          </div>
          <div className="rounded-[26px] border border-dashed border-slate-200 bg-white/70 p-4">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Immersion</p>
            <p className="text-sm text-slate-600">{activeCourse.immersion}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <NotebookPen className="h-4 w-4 text-indigo-500" aria-hidden />
            <p className="font-semibold text-slate-900">Next action:</p>
            <p>{activeCourse.nextAction}</p>
          </div>
        </article>
      ) : null}
    </div>
  );
};
