-- Catalog validation checklist

-- Counts
select count(*) as programs_count from programs;
select count(*) as universities_count from universities;
select count(*) as cities_count from cities;

-- FK integrity
select count(*) as programs_missing_university
from programs p
left join universities u on u.id = p.university_id
where u.id is null;

select count(*) as universities_missing_city
from universities u
left join cities c on c.id = u.city_id
where u.city_id is not null and c.id is null;

-- Score sanity
select
  min(university_score) as min_uni_score,
  max(university_score) as max_uni_score,
  min(course_selectivity_score) as min_selectivity,
  max(course_selectivity_score) as max_selectivity,
  min(total_course_score) as min_total,
  max(total_course_score) as max_total
from course_scoring_v1;

-- Spot-check missing data
select
  sum((course_name is null)::int) as missing_course_name,
  sum((min_ib_score is null)::int) as missing_ib_score,
  sum((min_a_level_score is null)::int) as missing_a_level_score,
  sum((yearly_international_tuition_fee_gbp is null)::int) as missing_tuition
from programs;
