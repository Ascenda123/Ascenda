-- Update course_scoring_v1 to prefer pre-computed scores from programs.metadata
-- when available (populated by the all_countries_programs import), falling back
-- to the ranking-derived calculations for legacy data.

create or replace view course_scoring_v1 as
with base as (
  select
    p.id as course_id,
    p.id as program_id,
    p.university_id,
    u.name as university,
    p.course_name as course,
    coalesce(c.name, u.city) as city,
    p.ucas_code,
    coalesce(p.study_level, p.level) as level,
    p.name as degree_type,
    p.field as field_of_study,
    coalesce(p.duration, case when p.duration_years is not null then p.duration_years::text || ' years' end) as duration,
    coalesce(u.acceptance_rate_pct, u.acceptance_rate) as acceptance_rate_pct,
    coalesce(u.qs_uk_rank, nullif(regexp_replace((u.metadata->>'qs_uk_rank'), '[^0-9]', '', 'g'), '')::int) as qs_uk_rank,
    coalesce(u.times_sunday_rank, nullif(regexp_replace((u.metadata->>'times_sunday_rank'), '[^0-9]', '', 'g'), '')::int) as times_sunday_rank,
    coalesce(u.guardian_rank, nullif(regexp_replace((u.metadata->>'guardian_rank'), '[^0-9]', '', 'g'), '')::int) as guardian_rank,
    coalesce(
      p.nss_score_pct_override,
      u.nss_score_pct,
      nullif(regexp_replace((p.metadata->>'nss_score_pct'), '[^0-9.]', '', 'g'), '')::numeric,
      nullif(regexp_replace((p.student_satisfaction), '[^0-9.]', '', 'g'), '')::numeric,
      nullif(regexp_replace((u.metadata->>'nss_score_pct'), '[^0-9.]', '', 'g'), '')::numeric
    ) as nss_score_pct,
    p.intake_size,
    p.gender_ratio_pct,
    coalesce(
      p.international_students_ratio_pct_override,
      u.international_students_ratio_pct,
      nullif(regexp_replace((p.metadata->>'international_students_ratio_pct'), '[^0-9.]', '', 'g'), '')::numeric
    ) as international_students_ratio_pct,
    coalesce(
      p.student_to_staff_ratio_override,
      u.student_to_staff_ratio,
      nullif(regexp_replace((p.metadata->>'student_to_staff_ratio'), '[^0-9.]', '', 'g'), '')::numeric
    ) as student_to_staff_ratio,
    coalesce(
      p.yearly_international_tuition_fee_gbp,
      safe_int(nullif(regexp_replace((p.tuition_fees_international), '[^0-9]', '', 'g'), '')),
      safe_int(nullif(regexp_replace((p.tuition)::text, '[^0-9]', '', 'g'), ''))
    ) as yearly_international_tuition_fee_gbp,
    coalesce(
      p.student_dorm_cost_gbp_per_year_override,
      u.student_dorm_cost_gbp_per_year,
      safe_int(nullif(regexp_replace((p.metadata->>'student_dorm_cost_gbp_per_year'), '[^0-9]', '', 'g'), ''))
    ) as student_dorm_cost_gbp_per_year,
    coalesce(
      p.average_rent_outside_campus_gbp_per_month_override,
      u.average_rent_outside_campus_gbp_per_month_override,
      c.average_rent_outside_campus_gbp_per_month,
      safe_int(nullif(regexp_replace((p.metadata->>'average_rent_outside_campus_gbp_per_month'), '[^0-9]', '', 'g'), ''))
    ) as average_rent_outside_campus_gbp_per_month,
    coalesce(p.cost_of_life_override, u.cost_of_life_override, c.cost_of_life) as cost_of_life,
    coalesce(
      p.min_ib_score,
      case
        when nullif(regexp_replace(coalesce(p.min_ib, ''), '[^0-9]', '', 'g'), '')::int between 24 and 45
          then nullif(regexp_replace(coalesce(p.min_ib, ''), '[^0-9]', '', 'g'), '')::int
        else null
      end
    ) as min_ib_score,
    coalesce(
      p.min_a_level_score,
      p.min_alevel,
      (regexp_match(upper(coalesce(p.entry_requirements_overview, '')), '(A\*AA|A\*AB|AAA|AAB|ABB|BBB|BBC|BCC|CCC)'))[1]
    ) as min_a_level_score,
    coalesce(
      p.a_level_min_numeric,
      case
        when upper(regexp_replace(coalesce(
          p.min_a_level_score,
          p.min_alevel,
          (regexp_match(upper(coalesce(p.entry_requirements_overview, '')), '(A\*AA|A\*AB|AAA|AAB|ABB|BBB|BBC|BCC|CCC)'))[1]
        ), '\s+', '', 'g')) like '%A*AA%' then 100
        when upper(regexp_replace(coalesce(
          p.min_a_level_score,
          p.min_alevel,
          (regexp_match(upper(coalesce(p.entry_requirements_overview, '')), '(A\*AA|A\*AB|AAA|AAB|ABB|BBB|BBC|BCC|CCC)'))[1]
        ), '\s+', '', 'g')) = 'A*AB' then 95
        when upper(regexp_replace(coalesce(
          p.min_a_level_score,
          p.min_alevel,
          (regexp_match(upper(coalesce(p.entry_requirements_overview, '')), '(A\*AA|A\*AB|AAA|AAB|ABB|BBB|BBC|BCC|CCC)'))[1]
        ), '\s+', '', 'g')) = 'AAA' then 90
        when upper(regexp_replace(coalesce(
          p.min_a_level_score,
          p.min_alevel,
          (regexp_match(upper(coalesce(p.entry_requirements_overview, '')), '(A\*AA|A\*AB|AAA|AAB|ABB|BBB|BBC|BCC|CCC)'))[1]
        ), '\s+', '', 'g')) = 'AAB' then 80
        when upper(regexp_replace(coalesce(
          p.min_a_level_score,
          p.min_alevel,
          (regexp_match(upper(coalesce(p.entry_requirements_overview, '')), '(A\*AA|A\*AB|AAA|AAB|ABB|BBB|BBC|BCC|CCC)'))[1]
        ), '\s+', '', 'g')) = 'ABB' then 70
        when upper(regexp_replace(coalesce(
          p.min_a_level_score,
          p.min_alevel,
          (regexp_match(upper(coalesce(p.entry_requirements_overview, '')), '(A\*AA|A\*AB|AAA|AAB|ABB|BBB|BBC|BCC|CCC)'))[1]
        ), '\s+', '', 'g')) = 'BBB' then 60
        when upper(regexp_replace(coalesce(
          p.min_a_level_score,
          p.min_alevel,
          (regexp_match(upper(coalesce(p.entry_requirements_overview, '')), '(A\*AA|A\*AB|AAA|AAB|ABB|BBB|BBC|BCC|CCC)'))[1]
        ), '\s+', '', 'g')) = 'BBC' then 50
        when upper(regexp_replace(coalesce(
          p.min_a_level_score,
          p.min_alevel,
          (regexp_match(upper(coalesce(p.entry_requirements_overview, '')), '(A\*AA|A\*AB|AAA|AAB|ABB|BBB|BBC|BCC|CCC)'))[1]
        ), '\s+', '', 'g')) = 'BCC' then 40
        else null
      end
    ) as a_level_min_numeric,
    p.preferred_subjects,
    p.english_score_requirement,
    coalesce(p.course_online_page, p.provider_course_url, p.url) as course_online_page,
    p.start_date as ucas_deadline,
    coalesce(p.admission_test, p.additional_entry_requirements, p.entry_requirements_overview) as admission_test,
    p.interview,
    coalesce(p.university_life_override, u.university_life) as university_life,
    u.number_of_students,
    u.transport_accessibility,
    u.cultural_social_environment,
    u.city_life,
    u.climate,
    u.safety_index,
    p.study_abroad_option,
    u.graduate_employment_rate_pct,
    coalesce(
      p.average_starting_salary_gbp_override,
      u.average_starting_salary_gbp,
      safe_int(nullif(regexp_replace((p.average_salary_after_15m), '[^0-9]', '', 'g'), ''))
    ) as average_starting_salary_gbp,
    p.top_industries,
    p.placement_year,
    p.placement_year_detail,
    p.language as program_language,
    p.mode as program_mode,
    p.tuition as program_tuition,
    p.currency as program_currency,
    coalesce(p.provider_course_url, p.url) as program_url,
    u.country as university_country,
    u.rank_overall as university_rank_overall,
    u.rank_source as university_rank_source,
    u.requires_test as university_requires_test,
    -- Pre-computed scores from metadata (all_countries_programs import)
    nullif(regexp_replace(coalesce(p.metadata->>'total_course_score', ''), '[^0-9.]', '', 'g'), '')::numeric as meta_total_course_score,
    nullif(regexp_replace(coalesce(p.metadata->>'selectivity_score', ''), '[^0-9.]', '', 'g'), '')::numeric as meta_selectivity_score,
    nullif(regexp_replace(coalesce(p.metadata->>'course_tier', ''), '[^0-9]', '', 'g'), '')::int as meta_course_tier,
    nullif(regexp_replace(coalesce(u.metadata->>'university_score', ''), '[^0-9.]', '', 'g'), '')::numeric as meta_university_score
  from programs p
  join universities u on u.id = p.university_id
  left join cities c on c.id = u.city_id
),
ranked as (
  select
    *,
    case
      when qs_uk_rank is null then null
      when qs_uk_rank <= 5 then 100
      when qs_uk_rank <= 10 then 95
      when qs_uk_rank <= 20 then 85
      when qs_uk_rank <= 30 then 75
      when qs_uk_rank <= 40 then 65
      when qs_uk_rank <= 60 then 55
      when qs_uk_rank <= 80 then 45
      when qs_uk_rank <= 100 then 35
      else 25
    end as qs_band,
    case
      when times_sunday_rank is null then null
      when times_sunday_rank <= 5 then 100
      when times_sunday_rank <= 10 then 95
      when times_sunday_rank <= 20 then 85
      when times_sunday_rank <= 30 then 75
      when times_sunday_rank <= 40 then 65
      when times_sunday_rank <= 60 then 55
      when times_sunday_rank <= 80 then 45
      when times_sunday_rank <= 100 then 35
      else 25
    end as times_band,
    case
      when guardian_rank is null then null
      when guardian_rank <= 5 then 100
      when guardian_rank <= 10 then 95
      when guardian_rank <= 20 then 85
      when guardian_rank <= 30 then 75
      when guardian_rank <= 40 then 65
      when guardian_rank <= 60 then 55
      when guardian_rank <= 80 then 45
      when guardian_rank <= 100 then 35
      else 25
    end as guardian_band
  from base
),
scores as (
  select
    *,
    -- University score: prefer metadata, then derive from rankings, else 30
    coalesce(
      meta_university_score,
      case
        when qs_band is null and times_band is null and guardian_band is null then 30
        else round(
          (coalesce(qs_band, 0) + coalesce(times_band, 0) + coalesce(guardian_band, 0))::numeric /
          nullif(
            (case when qs_band is not null then 1 else 0 end) +
            (case when times_band is not null then 1 else 0 end) +
            (case when guardian_band is not null then 1 else 0 end),
            0
          )
        )
      end
    ) as university_score,
    case
      when min_ib_score is null then 40
      when min_ib_score >= 40 then 100
      when min_ib_score >= 38 then 90
      when min_ib_score >= 36 then 80
      when min_ib_score >= 34 then 70
      when min_ib_score >= 32 then 60
      when min_ib_score >= 30 then 50
      when min_ib_score >= 28 then 40
      else 30
    end as ib_score,
    case
      when min_a_level_score is null then 40
      when upper(regexp_replace(min_a_level_score, '\s+', '', 'g')) like '%A*AA%' then 100
      when upper(regexp_replace(min_a_level_score, '\s+', '', 'g')) = 'A*AB' then 95
      when upper(regexp_replace(min_a_level_score, '\s+', '', 'g')) = 'AAA' then 90
      when upper(regexp_replace(min_a_level_score, '\s+', '', 'g')) = 'AAB' then 80
      when upper(regexp_replace(min_a_level_score, '\s+', '', 'g')) = 'ABB' then 70
      when upper(regexp_replace(min_a_level_score, '\s+', '', 'g')) = 'BBB' then 60
      when upper(regexp_replace(min_a_level_score, '\s+', '', 'g')) = 'BBC' then 50
      when upper(regexp_replace(min_a_level_score, '\s+', '', 'g')) = 'BCC' then 40
      else 30
    end as alevel_score
  from ranked
)
select
  course_id,
  program_id,
  university_id,
  university,
  course,
  city,
  ucas_code,
  level,
  degree_type,
  field_of_study,
  duration,
  acceptance_rate_pct,
  nss_score_pct,
  intake_size,
  gender_ratio_pct,
  international_students_ratio_pct,
  student_to_staff_ratio,
  yearly_international_tuition_fee_gbp,
  student_dorm_cost_gbp_per_year,
  average_rent_outside_campus_gbp_per_month,
  cost_of_life,
  min_ib_score,
  min_a_level_score,
  a_level_min_numeric,
  preferred_subjects,
  english_score_requirement,
  course_online_page,
  ucas_deadline,
  admission_test,
  interview,
  university_life,
  number_of_students,
  transport_accessibility,
  cultural_social_environment,
  city_life,
  climate,
  safety_index,
  study_abroad_option,
  graduate_employment_rate_pct,
  average_starting_salary_gbp,
  top_industries,
  placement_year,
  placement_year_detail,
  program_language,
  program_mode,
  program_tuition,
  program_currency,
  program_url,
  university_country,
  university_rank_overall,
  university_rank_source,
  university_requires_test,
  university_score,
  -- Course selectivity: prefer metadata, then derive from IB/A-level
  coalesce(
    meta_selectivity_score,
    case
      when min_ib_score is not null and min_a_level_score is not null then round((ib_score + alevel_score) / 2.0)
      when min_ib_score is not null then ib_score
      when min_a_level_score is not null then alevel_score
      else 40
    end
  ) as course_selectivity_score,
  -- Total course score: prefer metadata, then derive
  coalesce(
    meta_total_course_score,
    round(university_score * 0.6 + (
      case
        when min_ib_score is not null and min_a_level_score is not null then (ib_score + alevel_score) / 2.0
        when min_ib_score is not null then ib_score
        when min_a_level_score is not null then alevel_score
        else 40
      end
    ) * 0.4)
  ) as total_course_score,
  -- Course tier: prefer metadata, then derive
  coalesce(
    meta_course_tier,
    case
      when coalesce(
        meta_total_course_score,
        round(university_score * 0.6 + (
          case
            when min_ib_score is not null and min_a_level_score is not null then (ib_score + alevel_score) / 2.0
            when min_ib_score is not null then ib_score
            when min_a_level_score is not null then alevel_score
            else 40
          end
        ) * 0.4)
      ) >= 85 then 1
      when coalesce(
        meta_total_course_score,
        round(university_score * 0.6 + (
          case
            when min_ib_score is not null and min_a_level_score is not null then (ib_score + alevel_score) / 2.0
            when min_ib_score is not null then ib_score
            when min_a_level_score is not null then alevel_score
            else 40
          end
        ) * 0.4)
      ) >= 75 then 2
      when coalesce(
        meta_total_course_score,
        round(university_score * 0.6 + (
          case
            when min_ib_score is not null and min_a_level_score is not null then (ib_score + alevel_score) / 2.0
            when min_ib_score is not null then ib_score
            when min_a_level_score is not null then alevel_score
            else 40
          end
        ) * 0.4)
      ) >= 65 then 3
      when coalesce(
        meta_total_course_score,
        round(university_score * 0.6 + (
          case
            when min_ib_score is not null and min_a_level_score is not null then (ib_score + alevel_score) / 2.0
            when min_ib_score is not null then ib_score
            when min_a_level_score is not null then alevel_score
            else 40
          end
        ) * 0.4)
      ) >= 50 then 4
      else 5
    end
  ) as course_tier
from scores;
