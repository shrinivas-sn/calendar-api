export const CALENDAR_GUIDES = [
  {
    id: "gazetted-vs-restricted-holidays",
    title: "Gazetted vs Restricted Holidays in India: Legal Rules & API Calculation",
    summary: "Comprehensive breakdown of compulsory Central and State Gazetted holidays vs optional Restricted holidays under the Negotiable Instruments Act 1881 and Department of Personnel and Training (DoPT) executive orders.",
    category: "Legal & Regulatory",
    readTime: "6 min read",
    date: "Sep 2026",
    keywords: [
      "gazetted holidays india",
      "restricted holidays list",
      "section 25 negotiable instruments act",
      "dopt holiday circular",
      "bank holidays india api"
    ],
    sections: [
      {
        heading: "1. The Statutory Framework for Indian Holidays",
        content: `In the Republic of India, public holidays are not governed by a single monolithic law. Instead, they derive authority from three legal and administrative mechanisms:

1. **National Holidays (Gazetted Compulsory)**: Republic Day (26 Jan), Independence Day (15 Aug), and Mahatma Gandhi's Birthday (02 Oct). These are mandatory nationwide closures for government offices, banks, educational institutions, and industrial establishments.
2. **Section 25 of the Negotiable Instruments Act, 1881 (NI Act)**: Empowers the Central Government and State Governments to declare public holidays for banking operations and commercial instruments.
3. **DoPT (Department of Personnel and Training) Circulars**: Annually issues the list of 14 compulsory Gazetted holidays and a pool of optional Restricted Holidays (RH) for administrative staff.`
      },
      {
        heading: "2. Gazetted Holidays vs. Restricted Holidays (RH)",
        content: `Understanding the operational difference is critical when building payroll, attendance, and SLA engines:

- **Gazetted Holidays (GH)**: Mandatory non-working days for government offices, courts, and banks in the specified jurisdiction. All employees receive paid time off by default.
- **Restricted Holidays (RH / Optional Holidays)**: A curated list of cultural, regional, or religious observances. Employees are typically entitled to pick 2 or 3 optional days per calendar year from this approved list. They are not automatic enterprise closures.

The Calendar API tags every holiday record with a \`type\` field (\`"gazetted_holiday"\`, \`"restricted_holiday"\`, or \`"observance"\`), allowing automated systems to filter out optional leaves from enterprise calendar schedules.`
      },
      {
        heading: "3. State-Level Autonomy and Regional Variations",
        content: `Under the federal structure of the Constitution of India, State Governments possess sovereign authority to declare regional holidays under the NI Act. For example:
- **Maharashtra Day** (May 1) is a Gazetted holiday in Maharashtra (\`MH\`), but a normal working day in Karnataka (\`KA\`).
- **Chhath Puja** is gazetted in Bihar (\`BR\`) and Jharkhand (\`JH\`), but restricted or unobserved in southern states.
- **Onam** is gazetted in Kerala (\`KL\`), while **Ugadi** is gazetted in Andhra Pradesh (\`AP\`), Telangana (\`TS\`), and Karnataka (\`KA\`).

Always query the Calendar API with the exact state code (e.g. \`region=KA\`) to avoid applying wrong regional closures to remote employees.`
      },
      {
        heading: "4. cURL & Integration Example",
        code: `curl -s "https://calendar-api-d7a8.onrender.com/v1/holidays?country=IN&year=2026&region=KA" | jq '.data[] | select(.type=="gazetted_holiday")'`
      }
    ]
  },
  {
    id: "hrms-payroll-leave-automation",
    title: "Automating HRMS Leave Calendars & Payroll Calculations Across 37 States",
    summary: "Engineering guide on architecting automated holiday syncing, shift scheduling, sandwich leave rule handling, and multi-state compliance using the Calendar API.",
    category: "Architecture & Integration",
    readTime: "8 min read",
    date: "Sep 2026",
    keywords: [
      "hrms leave calendar automation",
      "payroll cutoff calculation",
      "sandwich leave rule logic",
      "multi-state workforce attendance",
      "leave management system api"
    ],
    sections: [
      {
        heading: "1. The Multi-State Payroll Challenge",
        content: `Modern Indian tech companies and distributed enterprises employ workforces distributed across multiple states and union territories. Hardcoding static holiday arrays in application databases causes continuous compliance drift when state governments announce ad-hoc holidays, election closures, or shifting lunar calendar dates (e.g. Eid, Diwali, Holi).

A modern Human Resource Management System (HRMS) needs a decoupled holiday resolution pipeline that queries authoritative holiday APIs on-demand or during scheduled payroll runs.`
      },
      {
        heading: "2. Solving the Sandwich Leave Problem",
        content: `Many Indian enterprise HR policies enforce the **Sandwich Rule**: If an employee takes leaves immediately preceding and succeeding a public holiday or weekend, the intervening holiday days are also deducted from their leave balance.

To compute this accurately:
1. Determine the employee's work location state code (\`region\`).
2. Query \`GET /v1/holidays/range?country=IN&start={start_date}&end={end_date}&region={state}\`.
3. Check if all surrounding workdays are marked as unpaid/leave.
4. Calculate net deductible days without manual HR intervention.`
      },
      {
        heading: "3. Caching & Performance Architecture",
        content: `Since public holiday lists for a calendar year are largely deterministic with rare executive updates:
- Fetch and cache the annual regional payload (\`GET /v1/calendar?country=IN&year=2026&region=TN\`) in Redis with a 24-hour TTL.
- For transactional date validation (e.g. attendance punch reconciliation), hit \`GET /v1/date/is-holiday?country=IN&date=YYYY-MM-DD&region=DL\` with sub-10ms cache latency.
- Invalidate cache entries automatically when the API's \`updated_at\` timestamp advances.`
      },
      {
        heading: "4. Node.js Middleware Implementation",
        code: `// Express.js middleware for HRMS holiday gating
import fetch from 'node-fetch';

export async function isWorkday(req, res, next) {
  const { date, employeeState } = req.body;
  const url = \`https://calendar-api-d7a8.onrender.com/v1/date/is-holiday?country=IN&date=\${date}&region=\${employeeState}\`;
  
  try {
    const response = await fetch(url);
    const result = await response.json();
    
    if (result.is_holiday) {
      req.isWorkingDay = false;
      req.holidayDetails = result.holiday;
    } else {
      req.isWorkingDay = true;
    }
    next();
  } catch (err) {
    req.isWorkingDay = true; // Fallback to normal day on network timeout
    next();
  }
}`
      }
    ]
  },
  {
    id: "quickstart-integration-recipes",
    title: "India Calendar API Integration Recipes: Node.js, Python, Go & cURL",
    summary: "Production-ready, copy-pasteable code snippets for fetching state holidays, querying date ranges, checking holiday status, and handling network timeouts.",
    category: "Developer Recipes",
    readTime: "5 min read",
    date: "Sep 2026",
    keywords: [
      "india holiday api python",
      "calendar api nodejs example",
      "golang public holiday check",
      "curl rest api calendar",
      "free indian holiday rest api"
    ],
    sections: [
      {
        heading: "1. Python (Requests & Pydantic)",
        content: "Clean Python script for fetching all Gazetted holidays for Karnataka (`KA`) in 2026 with structured typing:",
        code: `import requests
from typing import List, Optional
from pydantic import BaseModel

class Holiday(BaseModel):
    name: str
    date: str
    day: str
    type: str
    description: Optional[str] = None

def get_karnataka_holidays(year: int = 2026) -> List[Holiday]:
    url = f"https://calendar-api-d7a8.onrender.com/v1/holidays"
    params = {"country": "IN", "year": year, "region": "KA"}
    
    response = requests.get(url, params=params, timeout=10)
    response.raise_for_status()
    payload = response.json()
    
    return [Holiday(**item) for item in payload.get("data", [])]

if __name__ == "__main__":
    holidays = get_karnataka_holidays()
    print(f"Fetched {len(holidays)} holidays.")
    for h in holidays[:3]:
        print(f"- {h.date} ({h.day}): {h.name} [{h.type}]")`
      },
      {
        heading: "2. TypeScript / JavaScript (Modern Fetch)",
        content: "Browser and Node 18+ compliant ES module snippet:",
        code: `/**
 * Check if a given date is a public holiday in Delhi
 */
async function checkDelhiHoliday(dateString) {
  const url = new URL('https://calendar-api-d7a8.onrender.com/v1/date/is-holiday');
  url.searchParams.set('country', 'IN');
  url.searchParams.set('date', dateString);
  url.searchParams.set('region', 'DL');

  const res = await fetch(url);
  if (!res.ok) throw new Error(\`API returned status \${res.status}\`);
  
  const data = await res.json();
  return {
    isHoliday: data.is_holiday,
    name: data.holiday?.name || null,
    type: data.holiday?.type || null
  };
}

// Example usage
checkDelhiHoliday('2026-01-26').then(console.log);`
      },
      {
        heading: "3. Go (net/http)",
        content: "High-performance Golang client implementation:",
        code: `package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type HolidayResponse struct {
	Success bool \`json:"success"\`
	Data    []struct {
		Name string \`json:"name"\`
		Date string \`json:"date"\`
		Type string \`json:"type"\`
	} \`json:"data"\`
}

func main() {
	client := &http.Client{Timeout: 10 * time.Second}
	url := "https://calendar-api-d7a8.onrender.com/v1/holidays?country=IN&year=2026&region=MH"

	resp, err := client.Get(url)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	var result HolidayResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		panic(err)
	}

	fmt.Printf("Maharashtra Holidays: %d found\\n", len(result.Data))
}`
      }
    ]
  },
  {
    id: "rbi-bank-holidays-and-saturday-rules",
    title: "RBI Bank Holidays & 2nd/4th Saturday Rules: Automated Settlement Calculation",
    summary: "How banking closures, Section 25 Negotiable Instruments Act declarations, and mandatory 2nd/4th Saturday rules work in India, with automated settlement date calculation code.",
    category: "Fintech & Banking",
    readTime: "7 min read",
    date: "Oct 2026",
    keywords: [
      "rbi bank holidays api",
      "bank holidays in india api",
      "2nd 4th saturday holiday calculation",
      "nach settlement holiday calendar",
      "section 25 negotiable instruments act"
    ],
    sections: [
      {
        heading: "1. The Statutory Framework for Indian Banking Holidays",
        content: `In the Indian financial system, bank holidays are not uniform across commercial institutions. They are determined by three binding mechanisms:

1. **Section 25 of the Negotiable Instruments Act, 1881**: Empowers the Central Government and respective State Governments to declare public holidays for banking operations, cheque clearing, and bill presentations.
2. **RBI 2nd and 4th Saturday Rule (2015 Notification)**: All scheduled and non-scheduled banks in India observe full public holidays on the 2nd and 4th Saturdays of every month. The 1st, 3rd, and occasional 5th Saturdays are normal working days.
3. **RTGS & NEFT Settlement Hours vs Branch Closures**: While electronic payments like UPI and NEFT operate 24x7x365, bulk clearing systems (NACH debits, cheque clearing under CTS, government bond settlements) remain strictly contingent on working banking days.`
      },
      {
        heading: "2. State-Wise Banking Divergence",
        content: `A critical pitfall in fintech engineering is assuming national uniformity. For example:
- **Ganesh Chaturthi**: State bank holiday in Maharashtra (MH) and Goa (GA), but normal banking in Delhi (DL) and Tamil Nadu (TN).
- **Kanwal / Rath Yatra**: State holiday in Odisha (OR), normal banking across North and South India.
- **Bihu**: Bank closures in Assam (AS), normal working everywhere else.

When scheduling automated loan repayments, salary disbursements, or vendor settlements, systems must resolve holidays against the regional bank account location rather than a single central holiday calendar.`
      },
      {
        heading: "3. Mathematical 2nd & 4th Saturday Rule",
        content: `Instead of hardcoding Saturday lists, 2nd and 4th Saturdays can be calculated with zero external dependencies:
- The **2nd Saturday** of any month always falls between calendar dates **8 and 14** inclusive.
- The **4th Saturday** of any month always falls between calendar dates **22 and 28** inclusive.
- Any other Saturday (dates 1–7, 15–21, or 29–31) is a working day unless a gazetted NI Act holiday coincides with it.`
      },
      {
        heading: "4. Settlement Day Resolver (Node.js / TypeScript)",
        content: "Production-ready helper that takes a target date and state code, checks both the Calendar API and the Saturday rules, and computes the exact next working banking day:",
        code: `import fetch from 'node-fetch';

interface BankingDayResult {
  date: string;
  isWorkingBankingDay: boolean;
  reason?: string;
}

function isSecondOrFourthSaturday(d: Date): boolean {
  if (d.getDay() !== 6) return false;
  const dateNum = d.getDate();
  return (dateNum >= 8 && dateNum <= 14) || (dateNum >= 22 && dateNum <= 28);
}

export async function checkBankingDay(dateStr: string, region: string): Promise<BankingDayResult> {
  const d = new Date(dateStr);
  const dayOfWeek = d.getDay();

  // Rule 1: Sundays are universal bank closures
  if (dayOfWeek === 0) {
    return { date: dateStr, isWorkingBankingDay: false, reason: 'Sunday' };
  }

  // Rule 2: 2nd and 4th Saturdays are mandatory bank holidays
  if (isSecondOrFourthSaturday(d)) {
    return { date: dateStr, isWorkingBankingDay: false, reason: '2nd or 4th Saturday' };
  }

  // Rule 3: Check Central + State NI Act Gazetted Holidays
  const url = \`https://calendar-api-d7a8.onrender.com/v1/date/is-holiday?country=IN&date=\${dateStr}&region=\${region}\`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.is_holiday && data.holiday.type === 'gazetted_holiday') {
    return { date: dateStr, isWorkingBankingDay: false, reason: data.holiday.name };
  }

  return { date: dateStr, isWorkingBankingDay: true };
}

export async function getNextBankingDay(startDateStr: string, region: string): Promise<string> {
  let curr = new Date(startDateStr);
  while (true) {
    const iso = curr.toISOString().split('T')[0];
    const check = await checkBankingDay(iso, region);
    if (check.isWorkingBankingDay) return iso;
    curr.setDate(curr.getDate() + 1);
  }
}`
      }
    ]
  },
  {
    id: "google-calendar-ical-sync-state-holidays",
    title: "Syncing Indian State Holidays to Google Calendar & Outlook: Dynamic iCal Feeds",
    summary: "Why default Google Calendar holiday feeds miss regional Indian state holidays, and how to dynamically generate RFC 5545 iCalendar feeds using the Calendar API.",
    category: "Integration & Productivity",
    readTime: "6 min read",
    date: "Oct 2026",
    keywords: [
      "google calendar indian holidays alternative",
      "indian holidays ics feed",
      "add indian state holidays to calendar",
      "ical holiday calendar india",
      "rfc 5545 holiday feed"
    ],
    sections: [
      {
        heading: "1. The Missing Link in Google Calendar",
        content: `Google Calendar provides a pre-packaged public holiday calendar for India (\`en.indian#holiday@group.v.calendar.google.com\`). While convenient, it exhibits severe operational limitations for distributed engineering teams:

- It bundles central holidays and broad religious festivals, but completely omits state-specific gazetted holidays.
- An employee in Bengaluru does not see **Kannada Rajyotsava** (Nov 1) or **Ugadi**.
- An employee in Mumbai does not see **Maharashtra Day** (May 1) or **Ganesh Chaturthi**.
- Teams relying on Google Calendar for project sprint planning, release freezes, or on-call rotations suffer scheduling conflicts due to untracked regional days off.`
      },
      {
        heading: "2. The iCalendar (RFC 5545) Standard",
        content: `Modern calendar clients (Google Calendar, Apple Calendar, Microsoft Outlook, Thunderbird) support subscribing to web-hosted \`.ics\` calendar feeds via WebCal / HTTP. 

An RFC 5545 compliant feed requires:
- \`BEGIN:VCALENDAR\` and \`VERSION:2.0\` headers.
- Distinct \`VEVENT\` blocks for every holiday event.
- Deterministic \`UID\` generation (e.g. \`uid-\${year}-\${region}-\${holiday_id}@calendar-api.org\`) so calendar clients update existing events rather than duplicating them.
- All-day event timestamps using \`VALUE=DATE:YYYYMMDD\`.`
      },
      {
        heading: "3. Generating Dynamic iCal Feeds from the Calendar API",
        content: `By querying the Calendar API's \`/v1/holidays\` endpoint, you can serialize regional payloads into an on-demand \`.ics\` stream:

\`\`\`bash
# Fetch state holidays for Karnataka (KA) for year 2026
curl -s "https://calendar-api-d7a8.onrender.com/v1/holidays?country=IN&region=KA&year=2026"
\`\`\`

Each returned record contains the exact date, holiday name, and administrative classification (\`gazetted_holiday\` vs \`restricted_holiday\`).`
      },
      {
        heading: "4. Live iCal Feed Server (Node.js Edge Endpoint)",
        content: "Here is an Express/Node.js endpoint that pipes state-filtered Indian holidays directly into Google Calendar or Apple Calendar:",
        code: `import express from 'express';
import fetch from 'node-fetch';

const app = express();

app.get('/feeds/:region.ics', async (req, res) => {
  const { region } = req.params;
  const year = new Date().getFullYear();

  const apiUrl = \`https://calendar-api-d7a8.onrender.com/v1/holidays?country=IN&region=\${region.toUpperCase()}&year=\${year}\`;
  const response = await fetch(apiUrl);
  const payload = await response.json();

  if (!payload.success) {
    return res.status(404).send('Region or year holiday data not found');
  }

  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//India Calendar API//NONSGML Regional Holidays//EN',
    \`X-WR-CALNAME:India Holidays (\${region.toUpperCase()})\`,
    'X-WR-TIMEZONE:Asia/Kolkata',
    'CALSCALE:GREGORIAN'
  ];

  for (const h of payload.data) {
    const compactDate = h.date.replace(/-/g, '');
    const uid = \`\${compactDate}-\${region}-\${h.name.replace(/\\s+/g, '-').toLowerCase()}@calendar-api\`;
    ics.push(
      'BEGIN:VEVENT',
      \`UID:\${uid}\`,
      \`DTSTAMP:\${compactDate}T000000Z\`,
      \`DTSTART;VALUE=DATE:\${compactDate}\`,
      \`SUMMARY:\${h.name} (\${h.type === 'gazetted_holiday' ? 'Gazetted' : 'Restricted'})\`,
      \`DESCRIPTION:\${h.description || 'Public holiday in ' + region}\`,
      'STATUS:CONFIRMED',
      'TRANSP:TRANSPARENT',
      'END:VEVENT'
    );
  }

  ics.push('END:VCALENDAR');

  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', \`attachment; filename="holidays-\${region}.ics"\`);
  res.send(ics.join('\\r\\n'));
});

app.listen(3000, () => console.log('iCal feed generator active on port 3000'));`
      }
    ]
  }
];
