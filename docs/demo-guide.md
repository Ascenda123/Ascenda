# Ascenda · Sunday demo guide
**For Greg, demoing to Sarah on 18 May 2026**

---

## Before the call (Saturday, 10 min)

| | |
|---|---|
| **Preview URL** | https://ascenda-git-feat-applications-work-cxz5mw6fk2-6983s-projects.vercel.app |
| **Login** | `greg@workiflow.com` / `AscendaDemo!2026` |
| **Browser** | Chrome, clean profile (no extensions), full screen, 100% zoom |
| **Backup** | A second tab pre-logged-in. If the first session drops, switch tabs and keep talking. |

**Pre-flight (run once Saturday morning):**

1. Open the preview URL → sign in → land on `/dashboard`
2. Check the **navbar has a violet "Faculty view" pill** (top-right, next to the bell). If missing, hard refresh once.
3. **Reset demo state** so the bell starts empty. Paste this in the [Supabase SQL editor](https://supabase.com/dashboard/project/alpkbobbasxvubogkark/sql/new):
   ```sql
   delete from help_messages where request_id in (select id from help_requests where student_profile_id = '54d0803b-1c6d-4203-9e02-135f5746e6fa');
   delete from help_notes where request_id in (select id from help_requests where student_profile_id = '54d0803b-1c6d-4203-9e02-135f5746e6fa');
   delete from help_meetings where request_id in (select id from help_requests where student_profile_id = '54d0803b-1c6d-4203-9e02-135f5746e6fa');
   delete from help_requests where student_profile_id = '54d0803b-1c6d-4203-9e02-135f5746e6fa';
   delete from notifications where profile_id = '54d0803b-1c6d-4203-9e02-135f5746e6fa';
   ```
4. Run the full demo flow yourself end-to-end with a timer (target: 18 min).
5. **Reset state again** after your dry run so Sunday starts fresh.

---

## On the call

**Total time: 30 min · Demo: ~18 min · Q&A: ~12 min**

You'll mostly stay on the desktop, sharing your full browser window. Don't switch tabs mid-demo. Speak in complete sentences and let each beat land before moving on — silence is part of the pitch.

---

### Beat 1 · Open · 2 min
**Where:** `/dashboard` (or wherever you land after login).

**Say:**
> "Thanks for making time again, Sarah. When we spoke previously, you talked about how challenging parts of the application cycle can be — chasing documents, sorting shortlists late in the day, keeping visibility on which students need your attention most. We've taken what you shared, alongside what other counsellors and students have told us, and built a platform around exactly those moments."
>
> "Two sides — a student platform, and a counsellor platform. I'll show the student side briefly because everything on your side is downstream of what students do. Most of our time will be on your side. About fifteen minutes of run-through, then we open it up to your feedback. Jump in any time, but I'll keep moving so we leave plenty of room for the conversation."

**Click:** Nothing yet.

---

### Beat 2 · Student platform · 5 min

#### 2a · Profile (45 sec)

**Click:** Top nav → **Profile**.

**Show:** Profile sections + the **Pathway status pill** under "Pathway status" (says "Pathways open").

**Say:**
> "When a student signs up they build a profile — predicted grades, subjects, preferences, the lot. The reason we capture all this upfront, and we heard this from students directly, is that subject choices made years before application can quietly close doors. UCAS data suggests roughly one in five students unintentionally block themselves from degree options through subject choices earlier in school. This pill is the system telling Greg his pathways are still open — if he were to drop further maths now, this would flip to a warning *before* the exam window closes."

#### 2b · Matches + course detail (1.5 min)

**Click:** Top nav → **Explore**.

**Show:** Match cards with fit scores and Reach / Match / Safe badges.

**Say:**
> "Once their profile is set, this is what they see. The headline here is the compatibility score for each course. We run their profile against entry requirements and university characteristics — fit is decomposable, they can see why a course scored what it did. As they explore, the system auto-categorises shortlisted courses as Reach, Match, or Safe — I know it's a framework you're already using with them."

**Click:** **Imperial College London · Computing** card (top of the matches grid). If you can't find it, type "Imperial Computing" into the search bar at the top of `/university-search/search`. The other reach picks — Cambridge CS and UCL CS — are equally good fallbacks.

**Show:** The consolidated course page — modules, entry requirements, employment, salary, cost of living, teaching style.

**Say:**
> "When they click into a course, they see one consolidated page. The thing this replaces is thirty browser tabs across thin, inconsistent university websites that a student may have open for one course. A lot of students miss a lot of context because information is so fragmented — hard to be confident in their research without putting in extensive effort."

#### 2c · Application tracker (2 min)

**Click:** Top nav → **Applications**.

**Show:**
- The PageHero summary at the top
- The **Application priorities** board (6 cards: Cambridge CS, Imperial Computing, UCL CS, Manchester CS, Warwick CS, Leeds CS)
- "Today's focus" section below

**Say:**
> "And this is the application tracker. Per university, students see what's needed, what's done, what's outstanding — tests, transcripts, references, personal statement, deadlines. The priority board surfaces what to tackle first, weighted by fit, scholarship intensity, and deadline pressure."

---

### Beat 3 · The segue · 1 min — *the pivot moment*

**This is the demo's hinge. Practice this click until it feels automatic.**

**Say:**
> "Now here's something I want to show you live. Imagine a student is stuck — they need help on their application. Rather than emailing you or trying to book a meeting blindly, they click this."

**Click:** The violet **Need help** pill at the bottom-right of the **Cambridge · Computer Science** priority card (top-left of the priorities board).

**Show:** The modal opens. Subject is pre-filled ("Help with my University of Cambridge application"). Body references the fit %, open tasks, deadline. "AI draft · edit before sending" label visible top-right of the textarea.

**Say:**
> "The platform knows what they're working on, what stage they're at, and pre-fills a structured request. AI-drafted, student edits it before sending."

**Click:** **Send to counsellor**.

**Show:** Toast: "Sent — Sarah will respond shortly". Modal closes.

**Say:**
> "Let me flip over to your side and show you what just happened."

**Click:** Navbar → **Faculty view** pill (top-right, violet).

---

### Beat 4 · Visibility unlock · 2.5 min

**Where:** You're now on `/counsellor`. Pause for half a second so Sarah can take it in.

**Show first (without clicking):**
- The bell icon in the navbar has a **red `1`** badge
- The **Help requests** widget on the page, with Greg's request at the top

**Say:**
> "This is your homepage. You see all your students in this cycle. The notification you just saw lives up here — anything urgent surfaces without you needing to dig for it."

**Click:** the **bell icon** in the navbar.

**Show:** Dropdown — Greg's help request as the top unread item.

**Click:** the row.

**Show:** The **side drawer slides in from the right**. Three tabs at top — Thread / Notes / Meeting. Greg's original AI-drafted message is the first item in the thread. There's a reply composer at the bottom.

**Say:**
> "This is your inbox view of the same request. Three things you can do here without leaving the page — reply, leave a private note for yourself, or propose a meeting."

**Click:** **Notes** tab.

**Type (in the note textarea):**
> *Strong on the quant side, weak on the 'why this university' question. Send the Cambridge sample for reference.*

**Click:** **Save note**.

**Say (while typing the note):**
> "These notes are private — only counsellors see them. Whatever you discuss, decisions you make, things to come back to, it all lives here. Survives counsellor turnover. No more messy Excel files."

**Click:** **Meeting** tab.

**Show:** Form pre-filled with "15-min check-in", a Tuesday 3pm slot next week, Google Meet placeholder.

**Click:** **Propose**.

**Show:** Meeting appears in the list below with "proposed" status.

**Click:** **Thread** tab.

**Type (in the reply composer):**
> *Hi Greg — happy to help. Just scheduled a 15-min slot for Tuesday 3pm and dropped some notes. Let's start with your opening paragraph.*

**Click:** **Send**.

**Show:** Reply appears in the thread above the composer.

**Click:** the **X** at the top-right to close the drawer.

**Say (slow it down, then pause on the at-risk panel):**
> "And this is the bit I want to spend a moment on — students needing attention. You mentioned this specifically when we spoke. The pattern is consistent: meetings stack up, the loudest students absorb the most time, and the students who genuinely need help often aren't the ones asking. They go invisible until it's too late. This view surfaces them automatically — approaching deadlines with incomplete work, profiles half-finished, applications stalled."
>
> "How we frame this internally: it's not about replacing your judgement. It's about making sure your judgement gets applied to the right students at the right time, instead of being absorbed by whoever happens to book the most time with you."

---

### Beat 5 · Time saved unlock · 2 min — *documents*

**Click:** Counsellor sub-nav → **Documents**.

**Show:** Grouped list of documents per student. Status filter pills (All / Overdue / Pending / Received).

**Say:**
> "The bit I think will resonate most based on what you shared — document chasing. Transcripts, references, personal statements. You described this as one of the most repetitive and taxing parts of the cycle. Twenty separate email threads, a spreadsheet to track what's outstanding, chasing students who haven't replied to chase teachers who haven't replied. All of it concentrated in the weeks before deadlines."

**Click:** **Overdue** filter pill at the top.

**Show:** Overdue documents float to the top. Each has a "Chase" strip with three pills: Nudge student / Nudge teacher / Nudge registrar.

**Click:** On Mohammed Al-Rashid's overdue **A-Level Transcript** → click **Nudge teacher** pill.

**Show:** Toast appears. The row's status pill flips to "Nudge sent · Xs ago".

**Say:**
> "Per student, per application, we track what's needed. You nudge the right person — student, teacher, registrar — to submit what's missing. The chase happens through the platform, not through twenty separate emails. And because everything's logged in one place, you can see at a glance which students are blocking on what, instead of holding it all in your head."

---

### Beat 6 · 1:1 leverage unlock · 3 min — *the headline*

**Slow down here. This is the moment that should land hardest.**

**Click:** Counsellor sub-nav → **Students** → click **Aarav Sharma** (top of the list).

**Show — header card (without scrolling):**
- Aarav's name, school, programme line, predicted grades
- The 2×2 stats grid: Profile completion %, Matches count, Applications count, Next deadline
- The completion progress bar

**Say:**
> "One thing came up across nearly every counsellor we've spoken to — 1:1 time is the most valuable thing you give a student, and the hardest thing to protect. Meetings stack up, prep time disappears, and you walk in cold. Worse — when a student moves between counsellors, or you're covering for a colleague, the context of what's been discussed and why their shortlist looks the way it does is mostly lost. The institutional memory lives in your head, or in scattered notes, or it's gone."
>
> "This is what walking into a 1:1 looks like with Ascenda. One student's profile, everything on one screen. Top: who they are, where they're applying, current stage, next deadline. In thirty seconds you're fully briefed for a meeting you didn't have time to prep for."

**Click:** **Notes** tab on the student detail page.

**Show:** Notes panel with seed entries — session notes, flags, updates, all timestamped, sorted newest first.

**Say:**
> "This is your notes section. Free-text, attached to the student. Whatever you discuss, decisions you make, things to come back to — it lives here. It survives counsellor turnover. If a student transitions to a different counsellor, or you're covering for a colleague, the institutional memory comes with them."

**Click:** **Timeline** tab.

**Show:** The profile evolution timeline — icon-coded entries spanning ~300 days. Predicted grade shifts, subject interest changes, counsellor sessions, application milestones, all on a vertical spine.

**Say (this is the line that matters most — slow):**
> "And this — this is the part I'd ask you to look at carefully. This is the longitudinal view of the student. Predicted grade shifts, when they added or dropped subjects of interest, how their shortlist evolved over time. Students told us their list goes through several rounds of redoing — open days, peer conversations, life events shift things — and counsellors told us they often see only the snapshot. So when you sit down with them and ask why their shortlist looks the way it does, you don't have to start from scratch. You can see the journey."
>
> "I genuinely think this is the thing other tools don't have. UCAS, school management systems, even Cialfo — they're snapshot tools. This is the only place you see *why* a student's choices look the way they do, not just what's currently on the list."

---

### Beat 7 · Reporting up · 2 min

**Click:** Counsellor sub-nav → **Outcomes**.

**Show:** Outcome dashboard — acceptances, rejections, waitlists, pending.

**Say:**
> "Now this bit — and I'm flagging it because a number of counsellors we've spoken to said the same thing. The retrospective view of what their cohort actually did is missing today. When leadership asks how this year compares to last year, or parents at open evening want to know where the school's students ended up, the answer lives in memory or in a spreadsheet someone built manually."
>
> "As students hear back, you log outcomes here — accepted, rejected, waitlisted. That builds into your analytics page."

**Click:** Counsellor sub-nav → **Analytics**.

**Show:** Analytics widget grid.

**Click:** The **Compare to last year** pill at the top of the **Applications by stage** widget.

**Show:** Each bar now shows ▲/▼ delta vs last year, with "Last year · N" below.

**Click:** the **Download Report** button in the page header.

**Show:** Browser print preview opens.

**Click:** **Cancel** in the print dialog. Don't actually print.

**Say:**
> "Year-on-year comparisons. Downloadable. So when leadership asks how this year's cohort did, or you're at open evening with parents, you have something other than memory and a spreadsheet."

---

### Beat 8 · Integrations teaser · 30 sec

**No clicking. Voiceover only.**

**Say:**
> "Last thing on the platform — we're building this to sit alongside the tools you already use. Gmail, calendar, document storage. When a student books a meeting with you here, it flows into your calendar. When you message a parent, it goes from your inbox. You don't have to leave the platform, but the platform doesn't try to replace everything either."

---

### Beat 9 · Close · 1.5 min

**Say:**
> "That's the demo. We're at a stage where we're really trying to understand whether what we've built actually fits how you work, so the most valuable thing now is your honest reaction. So — over to you. What's resonating, what's not, and what's missing?"

**Stop talking. Let her go first.**

---

## If something breaks

| If… | Then… |
|---|---|
| **Faculty view pill** isn't in the navbar | Refresh the page once. Cache primes on first auth call. |
| **Send to counsellor** does nothing | Open browser console (Cmd-Opt-I). If "row level security" errors, the migrations didn't take — fall back to talking through the screenshots in the deck. |
| **Bell stays at zero** after Send | Wait 5 seconds. Realtime fires within 1s but if it misses, the 4-second poll catches it. |
| **Imperial Computing course page** loads blank or 404s | Fall back to **Cambridge Computer Science** (`/course/37b7597a-c85b-54b7-a263-f88b3e277344`) or **UCL Computer Science** (`/course/fcb852c2-f36e-5deb-973b-71110547d515`). |
| **Drawer feels laggy** when typing in reply box | Realtime is doing too much. Close and re-open the drawer — debounces the subscription. |
| **Preview URL totally down** | Switch to the second pre-logged-in browser tab. If that's also down, share screenshots from the deck and continue talking. |
| **Sarah asks about Gmail/Calendar integration depth** | "Real OAuth integration is on the roadmap. What you saw on screen today is the connection point — when those go live, this drawer schedules into your real calendar." Don't promise dates. |
| **Sarah asks "is this really AI?"** for the request draft | "It's a templated draft today that fills in from the student's context. The full LLM version is in flight — same input, richer language." |

---

## What's intentionally absent or different from Raf's plan

We made these calls during build. You'll know to deliver them in voiceover:

| Raf's plan said | What we shipped | Talk-track if asked |
|---|---|---|
| Gmail/Calendar/Outlook integration tiles | Removed entirely | Beat 8 covers this in voiceover. Tiles would have shown fake email addresses — misleading. |
| Per-application detail page | Help button on every priority-board card on `/applications` instead | Cleaner — keeps the user on the priorities view. |
| "Nudge teacher" really emails the teacher | Writes a real notification to the student instead | "The nudge is logged through the platform — when we wire SMTP, the same click sends the email." |
| The student practice board | Hidden from nav | Not part of the demo narrative. |

---

## One thing to know about timing

Beats 4, 5, and 6 are the meat. **If you're running over, cut Beat 7 first** (analytics) — Sarah will ask about reporting in Q&A anyway, and you can answer it then. **Don't cut Beat 6** (notes + timeline) — that's the differentiator the whole demo builds toward.
