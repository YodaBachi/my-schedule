# Schedule app

`index.html` is a phone/computer/Chromebook-friendly version of the workbook. It includes all four day types, all responsibilities, prayer anchors for Fajr/Dhuhr/Asr/Maghrib/Isha plus sunnah, Quran, SAT, AP classes, family work, projects, leadership, MIT OCW, trading simulation, coding, earning, weekly rotation, goals, and daily checklist.

## Important sync design

GitHub Pages is static and cannot safely write directly to an `.xlsx` file. Use Supabase as the shared source of truth:

1. Create a Supabase project and the `schedule_state` table with RLS policies.
2. Enable email authentication and create your user.
3. The current HTML is configured for this project and now signs in, loads, and upserts `schedule_state` using the browser-safe publishable key.
4. Deploy an Edge Function at `/api/assistant` (or route that path through your hosting setup).
5. Keep the OpenAI-compatible API key only in Supabase secrets, never in this HTML file.
6. Generate the updated workbook from the same Supabase state using a server-side export function. The included `.xlsx` remains a downloadable baseline, not the live database.

The AI assistant should receive the current schedule and task list, ask for urgency 1–10 when a task has neither a time nor deadline, then return a proposed schedule change for confirmation before writing it.

## Local preview

Open `index.html` directly in a browser. Local save works immediately; cross-device sync and AI require the backend setup above.
