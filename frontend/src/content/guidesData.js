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

The Calendar API tags every holiday record with a \`type\` field (\`"gazetted"\`, \`"restricted"\`, or \`"observance"\`), allowing automated systems to filter out optional leaves from enterprise calendar schedules.`
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
        code: `curl -s "https://calendar-api-d7a8.onrender.com/v1/holidays?country=IN&year=2026&region=KA" | jq '.data[] | select(.type=="gazetted")'`
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
  }
];
