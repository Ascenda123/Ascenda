#!/usr/bin/env python3
"""
Import rich content from all_countries_programs.csv into Supabase.
Safely merges new fields into existing program metadata (preserves existing keys).

Universities table (update by name match):
  university_life, transport_accessibility, cultural_social_environment,
  city_life, climate, safety_index, graduate_employment_rate_pct,
  average_starting_salary_gbp, number_of_students, student_to_staff_ratio,
  international_students_ratio_pct

Programs table (merge into metadata JSONB, keyed by university_id + course_name):
  career_outcomes_overview, course_requirements, student_life_overview,
  student_life_tags, cost_overview, cost_of_life, monthly_housing_gbp,
  monthly_food_gbp, monthly_transport_gbp, monthly_total_gbp,
  annual_living_cost_gbp (all costs USD->GBP @ 0.79)
"""

import csv, json, time, urllib.request, urllib.error

SUPABASE_URL = "https://alpkbobbasxvubogkark.supabase.co"
ANON_KEY = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
    "eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFscGtib2JiYXN4dnVib2drYXJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5Nzg2OTEsImV4cCI6MjA3ODU1NDY5MX0."
    "Wp12PbRYVHimDB9IR6m6nX7GUa-zeBPKku1wOMx44MA"
)
CSV_PATH = "/Users/rubenkahn/Documents/Claude_Ascenda/all_countries_programs.csv"
USD_TO_GBP = 0.79

HEADERS = {
    "apikey": ANON_KEY,
    "Authorization": f"Bearer {ANON_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal",
}


def api_get(path, params=""):
    url = f"{SUPABASE_URL}/rest/v1/{path}?{params}"
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())


def api_patch(table, filter_param, payload):
    url = f"{SUPABASE_URL}/rest/v1/{table}?{filter_param}"
    data = json.dumps(payload).encode()
    req = urllib.request.Request(url, data=data, headers=HEADERS, method="PATCH")
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status
    except urllib.error.HTTPError as e:
        print(f"  ERR {e.code}: {e.read().decode()[:120]}")
        return e.code


def to_float(v):
    try:
        return float(str(v).replace(",", "").strip())
    except:
        return None


def to_int(v):
    f = to_float(v)
    return int(f) if f is not None else None


def placement_bool(v):
    return str(v).strip().upper() in ("Y", "YES", "TRUE", "1") if v else None


def staff_ratio(v):
    if not v:
        return None
    if ":" in v:
        try:
            return float(v.split(":")[0].strip())
        except:
            return None
    return to_float(v)


def cost_level(v):
    return {"$": "LOW", "$$": "MEDIUM", "$$$": "HIGH", "$$$$": "HIGH"}.get(str(v).strip())


# ── Load CSV ──────────────────────────────────────────────────────────────────
print("Loading CSV…")
rows = []
with open(CSV_PATH, "r", encoding="utf-8-sig") as f:
    for row in csv.DictReader(f):
        rows.append(row)
print(f"  {len(rows):,} rows")

# ── Group CSV by university and by (university, course) ──────────────────────
by_uni_name = {}   # first row per uni (for uni-level fields)
by_prog_key = {}   # first row per (uni_name, course_name)

for row in rows:
    u = row["university_name"]
    c = row["course_name"]
    if u not in by_uni_name:
        by_uni_name[u] = row
    key = (u, c)
    if key not in by_prog_key:
        by_prog_key[key] = row

print(f"  {len(by_uni_name):,} unique universities, {len(by_prog_key):,} unique programs")

# ── Load all universities from Supabase ───────────────────────────────────────
print("\nLoading Supabase universities…")
uni_map = {}   # name → id
offset, limit = 0, 1000
while True:
    batch = api_get("universities", f"select=id,name&limit={limit}&offset={offset}")
    if not batch:
        break
    for u in batch:
        uni_map[u["name"]] = u["id"]
    if len(batch) < limit:
        break
    offset += limit
print(f"  {len(uni_map):,} universities")

# ── Update universities ───────────────────────────────────────────────────────
print("\nUpdating universities…")
updated = skipped = errors = 0

for uni_name, data in by_uni_name.items():
    uni_id = uni_map.get(uni_name)
    if not uni_id:
        skipped += 1
        continue

    p = {}
    if data.get("university_life"):        p["university_life"] = data["university_life"]
    if data.get("transport_accessibility"): p["transport_accessibility"] = data["transport_accessibility"]
    if data.get("cultural_environment"):    p["cultural_social_environment"] = data["cultural_environment"]
    if data.get("city_life"):               p["city_life"] = data["city_life"]
    if data.get("climate"):                 p["climate"] = data["climate"]
    v = to_float(data.get("safety_index"));           p["safety_index"] = v if v else p.get("safety_index")
    v = to_float(data.get("graduate_employment_rate")); p["graduate_employment_rate_pct"] = v if v else p.get("graduate_employment_rate_pct")
    v = to_float(data.get("avg_starting_salary_usd"));
    if v: p["average_starting_salary_gbp"] = int(v * USD_TO_GBP)
    v = to_int(data.get("total_students"));   p["number_of_students"] = v if v else p.get("number_of_students")
    v = staff_ratio(data.get("student_to_staff_ratio")); p["student_to_staff_ratio"] = v if v else p.get("student_to_staff_ratio")
    v = to_float(data.get("international_pct")); p["international_students_ratio_pct"] = v if v else p.get("international_students_ratio_pct")

    # Remove None values
    p = {k: v for k, v in p.items() if v is not None}
    if not p:
        skipped += 1
        continue

    status = api_patch("universities", f"id=eq.{uni_id}", p)
    if status in (200, 204):
        updated += 1
    else:
        errors += 1

    total = updated + skipped + errors
    if total % 200 == 0:
        print(f"  {total}/{len(by_uni_name)} — ✓{updated} skip{skipped} err{errors}")

print(f"  Universities done: {updated} updated, {skipped} skipped, {errors} errors")

# ── Update programs ───────────────────────────────────────────────────────────
print("\nUpdating programs…")
updated = skipped = errors = 0

# Group program CSV data by university for batched Supabase loads
progs_by_uni = {}
for (uni_name, course_name), data in by_prog_key.items():
    uni_id = uni_map.get(uni_name)
    if uni_id:
        progs_by_uni.setdefault(uni_id, []).append((course_name, data))

prog_cache = {}   # uni_id → {course_name: {id, metadata}}

total_unis = len(progs_by_uni)
for idx, (uni_id, prog_list) in enumerate(progs_by_uni.items()):
    # Load all programs for this university (with existing metadata)
    if uni_id not in prog_cache:
        db_progs = api_get("programs", f"select=id,course_name,metadata&university_id=eq.{uni_id}&limit=500")
        prog_cache[uni_id] = {p["course_name"]: {"id": p["id"], "metadata": p.get("metadata") or {}} for p in (db_progs or [])}

    for course_name, data in prog_list:
        prog_info = prog_cache[uni_id].get(course_name)
        if not prog_info:
            skipped += 1
            continue

        prog_id = prog_info["id"]
        existing_meta = dict(prog_info["metadata"])  # copy

        # Build direct column updates
        direct = {}
        py = placement_bool(data.get("placement_year"))
        if py is not None:
            direct["placement_year"] = py
        if data.get("top_industries"):
            direct["top_industries"] = data["top_industries"]
        if data.get("study_abroad"):
            direct["study_abroad_option"] = data["study_abroad"]

        # Build metadata additions (merge into existing)
        meta_add = {}
        for src_key, dst_key in [
            ("career_outcomes_overview", "career_outcomes_overview"),
            ("course_requirements", "course_requirements"),
            ("student_life_overview", "student_life_overview"),
            ("student_life_tags", "student_life_tags"),
            ("cost_overview", "cost_overview"),
        ]:
            if data.get(src_key):
                meta_add[dst_key] = data[src_key]

        cl = cost_level(data.get("cost_of_living_rating"))
        if cl:
            meta_add["cost_of_life"] = cl

        for src, dst in [
            ("monthly_housing_usd", "monthly_housing_gbp"),
            ("monthly_food_usd", "monthly_food_gbp"),
            ("monthly_transport_usd", "monthly_transport_gbp"),
            ("monthly_total_usd", "monthly_total_gbp"),
            ("annual_living_cost_usd", "annual_living_cost_gbp"),
        ]:
            v = to_int(data.get(src))
            if v:
                meta_add[dst] = int(v * USD_TO_GBP)

        if not direct and not meta_add:
            skipped += 1
            continue

        payload = dict(direct)
        if meta_add:
            merged_meta = {**existing_meta, **meta_add}
            payload["metadata"] = merged_meta

        status = api_patch("programs", f"id=eq.{prog_id}", payload)
        if status in (200, 204):
            updated += 1
        else:
            errors += 1

    total = updated + skipped + errors
    if idx % 50 == 0:
        print(f"  unis {idx}/{total_unis} — ✓{updated} skip{skipped} err{errors}")
    time.sleep(0.05)  # gentle throttle

print(f"\nPrograms done: {updated} updated, {skipped} skipped, {errors} errors")
print("\n✅ Import complete!")
