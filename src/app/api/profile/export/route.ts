import { NextResponse } from 'next/server';
import { createRouteHandlerSupabaseClient } from '@/lib/supabase/server';

type CsvRow = [string, string, string];

const stringifyValue = (value: unknown) => {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.filter(Boolean).join('; ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

const escapeCsv = (value: string) => {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

const buildCsv = (rows: CsvRow[]) => {
  const header: CsvRow = ['section', 'field', 'value'];
  return [header, ...rows]
    .map((row) => row.map((cell) => escapeCsv(cell)).join(','))
    .join('\n');
};

export async function GET() {
  const supabase = createRouteHandlerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const [personalResult, academicResult, lifestyleResult, subjectsResult, testsResult] = await Promise.all([
    supabase.from('student_personal_information').select('*').eq('profile_id', user.id).single(),
    supabase.from('student_academic_input').select('*').eq('profile_id', user.id).single(),
    supabase.from('student_lifestyle_preference').select('*').eq('profile_id', user.id).single(),
    supabase.from('student_subjects').select('*').eq('profile_id', user.id).order('created_at', { ascending: true }),
    supabase.from('student_admissions_tests').select('*').eq('profile_id', user.id).order('created_at', { ascending: true })
  ]);

  const rows: CsvRow[] = [];
  const pushRow = (section: string, field: string, value: unknown) => {
    rows.push([section, field, stringifyValue(value)]);
  };

  const personal = personalResult.data;
  if (personal) {
    pushRow('personal_information', 'first_name', personal.first_name);
    pushRow('personal_information', 'last_name', personal.last_name);
    pushRow('personal_information', 'email', personal.email);
    pushRow('personal_information', 'phone', personal.phone);
    pushRow('personal_information', 'nationality', personal.nationality);
    pushRow('personal_information', 'age', personal.age);
    pushRow('personal_information', 'gender', personal.gender);
    pushRow('personal_information', 'resident_country', personal.resident_country);
    pushRow('personal_information', 'current_location_city', personal.current_location_city);
    pushRow('personal_information', 'time_zone', personal.time_zone);
  }

  const academic = academicResult.data;
  if (academic) {
    pushRow('academic_input', 'programme_type', academic.programme_type);
    pushRow('academic_input', 'school_name', academic.school_name);
    pushRow('academic_input', 'school_country', academic.school_country);
    pushRow('academic_input', 'school_city', academic.school_city);
    pushRow('academic_input', 'school_type', academic.school_type);
    pushRow('academic_input', 'language_of_instruction', academic.language_of_instruction);
    pushRow('academic_input', 'graduation_year', academic.graduation_year);
    pushRow('academic_input', 'desired_start_date', academic.desired_start_date);
    pushRow('academic_input', 'intended_clusters', academic.intended_clusters);
    pushRow('academic_input', 'secondary_clusters', academic.secondary_clusters);
    pushRow('academic_input', 'career_aspiration', academic.career_aspiration);
    pushRow('academic_input', 'ib_total_points', academic.ib_total_points);
    pushRow('academic_input', 'ib_core_points', academic.ib_core_points);
    pushRow('academic_input', 'ib_tok_grade', academic.ib_tok_grade);
    pushRow('academic_input', 'ib_ee_grade', academic.ib_ee_grade);
    pushRow('academic_input', 'ib_math_pathway', academic.ib_math_pathway);
    pushRow('academic_input', 'ee_subject', academic.ee_subject);
    pushRow('academic_input', 'ee_title', academic.ee_title);
    pushRow('academic_input', 'ee_summary', academic.ee_summary);
    pushRow('academic_input', 'a_level_predicted_grades', academic.a_level_predicted_grades);
    pushRow('academic_input', 'english_required', academic.english_required);
    pushRow('academic_input', 'english_test_type', academic.english_test_type);
    pushRow('academic_input', 'english_status', academic.english_status);
    pushRow('academic_input', 'english_score_overall', academic.english_score_overall);
  }

  const lifestyle = lifestyleResult.data;
  if (lifestyle) {
    pushRow('lifestyle_preference', 'teaching_style', lifestyle.teaching_style);
    pushRow('lifestyle_preference', 'desired_location_type', lifestyle.desired_location_type);
    pushRow('lifestyle_preference', 'campus_size', lifestyle.campus_size);
    pushRow('lifestyle_preference', 'extracurricular_interests', lifestyle.extracurricular_interests);
    pushRow('lifestyle_preference', 'other_extracurriculars', lifestyle.other_extracurriculars);
  }

  const subjects = subjectsResult.data ?? [];
  subjects.forEach((subject, index) => {
    const summary = [subject.subject_name, subject.level, subject.grade_value].filter(Boolean).join(' | ');
    pushRow('subjects', `subject_${index + 1}`, summary);
  });

  const tests = testsResult.data ?? [];
  tests.forEach((test, index) => {
    const summary = [test.test_type, test.status, test.score_numeric, test.percentile].filter(Boolean).join(' | ');
    pushRow('admissions_tests', `test_${index + 1}`, summary);
  });

  const csvContent = buildCsv(rows);
  const filename = `ascenda-profile-${user.id}.csv`;

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`
    }
  });
}
