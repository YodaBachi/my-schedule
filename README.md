# Schedule app

`index.html` is a phone/computer/Chromebook-friendly version of the workbook. It includes all four day types, all responsibilities, prayer anchors for Fajr/Dhuhr/Asr/Maghrib/Isha plus sunnah, Quran, SAT, AP classes, family work, projects, leadership, MIT OCW, trading simulation, coding, earning, weekly rotation, goals, and daily checklist.

## Important sync design

GitHub Pages is static and cannot safely write directly to an `.xlsx` file. Use Supabase as the shared source of truth:

1. Create a Supabase project and the `schedule_state` table with RLS policies.
2. Enable email authentication and create your user.
3. The current HTML is configured for this project and now signs in, loads, and upserts `schedule_state` using the browser-safe publishable key.
4. Deploy the `assistant` Edge Function. The website calls `https://uaiqqzuehfcakqamsbmd.supabase.co/functions/v1/assistant` directly and sends the signed-in user's access token.
5. Keep the OpenAI-compatible API key only in Supabase secrets, never in this HTML file.
6. Generate the updated workbook from the same Supabase state using a server-side export function. The included `.xlsx` remains a downloadable baseline, not the live database.

The AI assistant should receive the current schedule and task list, ask for urgency 1–10 when a task has neither a time nor deadline, then return a proposed schedule change for confirmation before writing it.

### Iqama-time refresh

The app now reads the daily Iqama/congregation times from the Islamic Society of Frederick page you provided:
`https://mosqueprayertimes.com/islamicsocietyoffrederick`

It refreshes when the page opens and every six hours while it remains open. It does not run in the background when the browser/watch is closed. The schedule uses Iqama times for congregation planning; verify them against the masjid before relying on them. Manual time fields remain available if the source is unavailable.

### Deploying the AI function

From PowerShell in `C:\Users\justi\schedule-ai`:

```powershell
npx supabase login
npx supabase link --project-ref uaiqqzuehfcakqamsbmd
npx supabase secrets set OPENAI_API_KEY=YOUR_AI_KEY
npx supabase functions deploy assistant
```

The AI key is stored as a Supabase secret. Never put it in GitHub, Excel, or `index.html`.

## Local preview

Open `index.html` directly in a browser. Local save works immediately; cross-device sync and AI require the backend setup above.
