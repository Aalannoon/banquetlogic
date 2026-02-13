# BanquetLogic – Test Case Evaluation

Using the scheduling rules (global constraints, employee attributes, shift-assignment priority, preference logic, seniority, overtime handling), each scenario below is evaluated for **expected assignment**, **rule that caused the decision**, and **global constraint check**. Cases that cannot be satisfied are flagged with a reason.

---

## Reference: Rules Summary

- **Global:** Min shift 4h; never auto-assign OT; if coverage needs OT → suggestion only + "Coverage Requires Overtime Approval"; always remind manager to review before publishing.
- **Priority order:** 1) Availability → 2) Legal/min 4h → 3) No-OT eligibility → 4) Preference → 5) Seniority → 6) Hour balancing → 7) Rebalancing → 8) OT suggestion only → 9) Manual review flag.
- **Preference:** Preferred +2, Neutral 0, Dislikes −2; preference before seniority when coverage is equal; seniority overrides only for coverage fail, min-shift violation, or OT avoidance.
- **OT:** Never assign OT; if only OT candidates remain → do not assign; record suggestion only.

---

## Test Case 1: Single slot, one available employee, prefers shift

**Setup**

- One event, one day, 1 server slot, 6h shift (≥4h).
- One employee: available, pref = PM, shift is PM (latest/only shift of day), seniority = 10, 0h scheduled this day.

**Expected assignment:** That employee is assigned to the slot.

**Rule that caused the decision:**  
(1) Availability: only candidate.  
(3) No-OT: 0 + 6 ≤ 8.  
(4) Preference: PM preferred and shift is PM → +2.  
(5) Seniority: only candidate, no tie.

**Global constraints:**  
- Min shift 4h: satisfied (6h).  
- No auto-OT: satisfied (6h ≤ 8h).  
- Manager review reminder: shown in UI (always).

**Result:** Satisfied.

---

## Test Case 2: Two candidates, same availability; one prefers shift, one dislikes

**Setup**

- One event, one day, 1 server slot, 5h.
- Employee A: pref = PM, seniority = 5.  
- Employee B: pref = AM, seniority = 3 (higher seniority).  
- Shift is PM (only shift of day). Both available, 0h today, no conflicts.

**Expected assignment:** Employee A (prefers PM) is assigned, not B (dislikes PM).

**Rule that caused the decision:**  
Preference before seniority when coverage is equal. A gets preference +2, B gets −2 (dislikes). Sort by preference first → A wins. Seniority does not override because coverage is equal and no min-shift/OT issue.

**Global constraints:**  
- Min shift 4h: satisfied.  
- No auto-OT: satisfied.  
- Preference respected before seniority: satisfied.

**Result:** Satisfied.

---

## Test Case 3: Only candidate would go into overtime

**Setup**

- One event, one day, 1 server slot, 4h.
- One employee: already has 6h on that day (e.g. from another pool or prior assignment). 6 + 4 = 10 > 8.

**Expected assignment:** No one is assigned to this slot.

**Rule that caused the decision:**  
No-OT rule: all eligible candidates would exceed 8h today → `wouldAvoidOT.length === 0` → system does not assign; records an overtime suggestion only (non-binding) and marks "Coverage Requires Overtime Approval".

**Global constraints:**  
- Min shift 4h: satisfied (slot is 4h).  
- Never auto-assign OT: satisfied (no assignment).  
- Suggestion only: satisfied (suggestion stored, no employee auto-selected).

**Result:** Satisfied. Slot appears as needing OT approval; suggestion may list that employee.

---

## Test Case 4: Two candidates; one prefers, one neutral; same seniority

**Setup**

- One event, one day, 1 server slot, 4h.
- Employee A: pref = AM, seniority = 10.  
- Employee B: pref = null (Neutral), seniority = 10.  
- Shift is AM (earliest). Both available, 0h today.

**Expected assignment:** Employee A (prefers AM) is assigned.

**Rule that caused the decision:**  
Preference alignment: A gets +2 (preferred), B gets 0 (neutral). Sort by preference score first → A wins. Seniority tie (same number) doesn’t change outcome.

**Global constraints:**  
- Min shift 4h: satisfied.  
- No auto-OT: satisfied.  
- Preference before seniority: satisfied.

**Result:** Satisfied.

---

## Test Case 5: Minimum shift length – event only 3h

**Setup**

- One event, one day, 1 server slot; event duration 3h (e.g. 09:00–12:00).

**Expected assignment:** No auto-assignment for this slot (or event normalized/merged so no sub-4h slot is offered).

**Rule that caused the decision:**  
`normalizeHours` and slot building: minimum shift length is 4h. A single segment of 3h is below MIN_SHIFT_HOURS → segment list is cleared or slot not created for auto-assign. System does not assign shifts &lt; 4h.

**Global constraints:**  
- Minimum shift length 4h: satisfied (no sub-4h assignment).  
- No auto-OT: N/A.

**Result:** Satisfied. Case is satisfied by not assigning a sub-4h shift; may be flagged for manual review depending on implementation.

---

## Test Case 6: Seniority as tie-breaker when preference equal

**Setup**

- One event, one day, 1 server slot, 5h.
- Employee A: pref = PM, seniority = 8.  
- Employee B: pref = PM, seniority = 5.  
- Shift is PM. Both available, 0h today, same preference score.

**Expected assignment:** Employee B (seniority 5, higher than 8) is assigned.

**Rule that caused the decision:**  
Preference equal (both +2). Score = (prefScore + 2)*100000 + (100 − seniority). B has higher (100 − 5) → B wins. Seniority used only as tie-breaker after preference.

**Global constraints:**  
- Min shift 4h: satisfied.  
- No auto-OT: satisfied.  
- Preference first, then seniority: satisfied.

**Result:** Satisfied.

---

## Test Case 7: Preference overridden to prevent uncovered hours (only disliker available)

**Setup**

- One event, one day, 1 server slot, 4h.
- Only one available employee: pref = AM, shift is PM (so they "dislike" this shift). Seniority 10, 0h today.

**Expected assignment:** That employee is assigned (only candidate).

**Rule that caused the decision:**  
Availability: only one can cover. No-OT: they’re under 8h. Even with preference −2, they’re the only candidate → assigned. Dominant reason stored: "Preference overridden to prevent uncovered hours."

**Global constraints:**  
- Min shift 4h: satisfied.  
- No auto-OT: satisfied.  
- Preference overridden only when necessary for coverage: satisfied.

**Result:** Satisfied.

---

## Test Case 8: Two slots same day; first slot uses preferred employee; second slot gets next by preference/seniority

**Setup**

- One day, two events (AM and PM), each 1 server slot, 4h.
- Employee A: pref = AM, seniority = 5.  
- Employee B: pref = PM, seniority = 10.  
- Both available, 0h today.

**Expected assignment:**  
- Slot 1 (AM): A (prefers AM, seniority tie-breaker if needed).  
- Slot 2 (PM): B (A already `assignedToday`; B prefers PM).

**Rule that caused the decision:**  
One shift per day: after A is assigned to AM, A is excluded from PM. For PM slot, only B is eligible; preference +2 for B on PM. Assignment order and `assignedToday` enforce one shift per day.

**Global constraints:**  
- Min shift 4h: both slots.  
- No auto-OT: 4+4 would be 8 for one person if same employee could do both; one-shift-per-day prevents that.  
- No double-assignment same day: satisfied.

**Result:** Satisfied.

---

## Test Case 9: 8h rest between days

**Setup**

- Day 1: Employee works until 23:00.  
- Day 2: One event starts 06:00 (7h gap).

**Expected assignment:** That employee is not assigned to the 06:00 shift (gap &lt; 8h).

**Rule that caused the decision:**  
`canWorkShift`: 8h rest between previous day end and current shift start required. 7h &lt; 480 minutes → not allowed → excluded from eligible list.

**Global constraints:**  
- Min shift 4h: N/A to rest.  
- No auto-OT: N/A.  
- Legal/rest constraint: satisfied by exclusion.

**Result:** Satisfied.

---

## Test Case 10: Max days per week (e.g. 5)

**Setup**

- Employee already has 5 days assigned this week; maxDaysPerWeek = 5.  
- One more event, one slot, needs that employee.

**Expected assignment:** That employee is not assigned to the 6th day (skipped due to max days).

**Rule that caused the decision:**  
Eligibility: `employeeWorkDays[emp.id] >= empMaxDays` → excluded. So another eligible employee gets the slot, or the slot stays unfilled / OT suggestion if no one else can cover.

**Global constraints:**  
- Min shift 4h: satisfied for the slot.  
- No auto-OT: no OT assigned.  
- Max days respected: satisfied.

**Result:** Satisfied.

---

## Test Case 11: Coverage possible only with overtime – multiple employees but all would be OT

**Setup**

- One event, one day, 1 server slot, 4h.  
- Two employees, both already 6h that day. So both would be 10h if assigned (OT).

**Expected assignment:** No one is assigned. "Coverage Requires Overtime Approval" with non-binding suggestion (e.g. list one or both names).

**Rule that caused the decision:**  
`wouldAvoidOT.length === 0` → no assignment; push to `overtimeSuggestions` with suggested names; do not assign anyone.

**Global constraints:**  
- Min shift 4h: slot is 4h.  
- Never auto-assign OT: satisfied (no assignment).  
- Suggestion only: satisfied.

**Result:** Satisfied.

---

## Test Case 12: Day preference (prefers day / dislikes day)

**Setup**

- One event, Wednesday, 1 server slot, 4h.  
- Employee A: dayPreferences[3] = true (prefers Wed), seniority 20.  
- Employee B: dayPreferences[3] = false (dislikes Wed), seniority 5.  
- Both available, same AM/PM preference for the shift.

**Expected assignment:** Employee A (prefers Wednesday) is assigned.

**Rule that caused the decision:**  
Preference score: day preferred +2 for A, day disliked −2 for B. Preference before seniority → A wins despite lower seniority (20 vs 5). Seniority does not override because coverage is equal.

**Global constraints:**  
- Min shift 4h: satisfied.  
- No auto-OT: satisfied.  
- Preference (including day) before seniority: satisfied.

**Result:** Satisfied.

---

## Summary

| Case | Description                          | Satisfied? | Violation / Note                    |
|------|--------------------------------------|------------|-------------------------------------|
| 1    | Single employee, prefers shift       | Yes        | —                                   |
| 2    | Prefer vs dislike; seniority lower   | Yes        | Preference over seniority           |
| 3    | Only candidate would be OT           | Yes        | No assign; OT suggestion only        |
| 4    | Prefer vs neutral; same seniority     | Yes        | Prefer wins                         |
| 5    | Event 3h (min 4h)                    | Yes        | No sub-4h assign                    |
| 6    | Same preference; seniority tie-break | Yes        | Seniority breaks tie                |
| 7    | Only candidate dislikes shift         | Yes        | Override for coverage               |
| 8    | Two slots same day                    | Yes        | One shift per day                   |
| 9    | 8h rest between days                  | Yes        | Rest enforced                      |
| 10   | Max 5 days per week                   | Yes        | 6th day skipped                    |
| 11   | All candidates would be OT            | Yes        | No assign; OT suggestion             |
| 12   | Day preference vs seniority           | Yes        | Day preference wins                 |

All 12 test cases are satisfied under the stated rules. No global constraints are violated. Cases that could be "unsatisfied" in a business sense (e.g. no coverage in Case 3 or 11) are handled correctly by the system: no illegal or OT assignment, and suggestions/flags for manager review.
