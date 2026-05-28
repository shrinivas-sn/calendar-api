# India Calendar API — ICS to JSON Automation Agent

## Your Role
You are a data pipeline agent for the India Calendar API project.
Your job is to fetch Indian holiday .ics files from the government 
website and convert them into clean structured JSON files.

---

## PART 1 — Fetch .ics Files from Government Website

Visit the following URLs and download the .ics calendar file from each page.
The download button is labeled "Sync Calendar" on each page.

### Central Government
- https://www.india.gov.in/calendar

### All States
- https://www.india.gov.in/calendar/andhra-pradesh
- https://www.india.gov.in/calendar/arunachal-pradesh
- https://www.india.gov.in/calendar/assam
- https://www.india.gov.in/calendar/bihar
- https://www.india.gov.in/calendar/chhattisgarh
- https://www.india.gov.in/calendar/goa
- https://www.india.gov.in/calendar/gujarat
- https://www.india.gov.in/calendar/haryana
- https://www.india.gov.in/calendar/himachal-pradesh
- https://www.india.gov.in/calendar/jharkhand
- https://www.india.gov.in/calendar/karnataka
- https://www.india.gov.in/calendar/kerala
- https://www.india.gov.in/calendar/madhya-pradesh
- https://www.india.gov.in/calendar/maharashtra
- https://www.india.gov.in/calendar/manipur
- https://www.india.gov.in/calendar/meghalaya
- https://www.india.gov.in/calendar/mizoram
- https://www.india.gov.in/calendar/nagaland
- https://www.india.gov.in/calendar/odisha
- https://www.india.gov.in/calendar/punjab
- https://www.india.gov.in/calendar/rajasthan
- https://www.india.gov.in/calendar/sikkim
- https://www.india.gov.in/calendar/tamil-nadu
- https://www.india.gov.in/calendar/telangana
- https://www.india.gov.in/calendar/tripura
- https://www.india.gov.in/calendar/uttar-pradesh
- https://www.india.gov.in/calendar/uttarakhand
- https://www.india.gov.in/calendar/west-bengal

### Union Territories
- https://www.india.gov.in/calendar/andaman-and-nicobar-islands-ut
- https://www.india.gov.in/calendar/chandigarh-ut
- https://www.india.gov.in/calendar/dadra-and-nagar-haveli-and-daman-and-diu-ut
- https://www.india.gov.in/calendar/delhi-nct
- https://www.india.gov.in/calendar/jammu-and-kashmir-ut
- https://www.india.gov.in/calendar/lakshadweep-ut
- https://www.india.gov.in/calendar/puducherry-ut
- https://www.india.gov.in/calendar/ladakh-ut

---

## PART 2 — Naming Convention for Downloaded Files

Name each downloaded .ics file using this pattern:
IN_<REGION_CODE>_<YEAR>.ics

Use these region codes:
central → IN_central_2026.ics
andhra-pradesh → IN_AP_2026.ics
arunachal-pradesh → IN_AR_2026.ics
assam → IN_AS_2026.ics
bihar → IN_BR_2026.ics
chhattisgarh → IN_CG_2026.ics
goa → IN_GA_2026.ics
gujarat → IN_GJ_2026.ics
haryana → IN_HR_2026.ics
himachal-pradesh → IN_HP_2026.ics
jharkhand → IN_JH_2026.ics
karnataka → IN_KA_2026.ics
kerala → IN_KL_2026.ics
madhya-pradesh → IN_MP_2026.ics
maharashtra → IN_MH_2026.ics
manipur → IN_MN_2026.ics
meghalaya → IN_ML_2026.ics
mizoram → IN_MZ_2026.ics
nagaland → IN_NL_2026.ics
odisha → IN_OD_2026.ics
punjab → IN_PB_2026.ics
rajasthan → IN_RJ_2026.ics
sikkim → IN_SK_2026.ics
tamil-nadu → IN_TN_2026.ics
telangana → IN_TS_2026.ics
tripura → IN_TR_2026.ics
uttar-pradesh → IN_UP_2026.ics
uttarakhand → IN_UK_2026.ics
west-bengal → IN_WB_2026.ics
andaman-and-nicobar-islands-ut → IN_AN_2026.ics
chandigarh-ut → IN_CH_2026.ics
dadra-and-nagar-haveli-and-daman-and-diu-ut → IN_DN_2026.ics
delhi-nct → IN_DL_2026.ics
jammu-and-kashmir-ut → IN_JK_2026.ics
lakshadweep-ut → IN_LD_2026.ics
puducherry-ut → IN_PY_2026.ics
ladakh-ut → IN_LA_2026.ics

---

## PART 3 — Convert Each .ics File to JSON

For every .ics file downloaded, parse and convert it using these rules:

### Parsing Rules
1. Split the file content by "BEGIN:VEVENT" to get individual events
2. From each event extract:
   - SUMMARY → holiday name (replace "\," with ",")
   - DTSTART;VALUE=DATE → date in format YYYYMMDD, convert to YYYY-MM-DD
   - DESCRIPTION → holiday type text
3. Map holiday type:
   - "Gazetted Holiday" → "gazetted_holiday"
   - "Restricted Holiday" → "restricted_holiday"
   - anything else → "observance"
4. Sort all holidays by date ascending
5. Detect year from the date values in the file
6. Detect region from the filename (e.g. IN_KA_2026.ics → region: "KA")
7. For central file → region: "central"

### Output JSON Structure (strictly follow this)
{
  "country": "IN",
  "year": <detected year as integer>,
  "region": "<region code>",
  "data": [
    {
      "name": "<holiday name>",
      "date": "<YYYY-MM-DD>",
      "type": "<gazetted_holiday | restricted_holiday | observance>",
      "region": ["IN"],
      "description": "<original description text from ics>",
      "source": "https://www.india.gov.in/calendar"
    }
  ],
  "meta": {
    "apiVersion": "v1",
    "totalHolidays": <count of holidays>,
    "gazettedCount": <count of gazetted only>,
    "restrictedCount": <count of restricted only>,
    "source": "Ministry of Personnel, Public Grievances and Pensions via india.gov.in",
    "lastVerified": "<today's date in YYYY-MM-DD>"
  }
}

---

## PART 4 — Folder Structure and File Saving

### Folder Structure
Save every JSON file using this exact folder structure:

data/
└── <YEAR>/
    └── IN/
        └── <REGION_CODE>/
            └── holidays.json

### Examples
- Central → data/2026/IN/central/holidays.json
- Karnataka → data/2026/IN/KA/holidays.json
- Maharashtra → data/2026/IN/MH/holidays.json
- Delhi → data/2026/IN/DL/holidays.json
- Tamil Nadu → data/2026/IN/TN/holidays.json

### Rule
- YEAR is always detected from the data inside the .ics file
- REGION_CODE is always uppercase (KA, MH, DL, TN etc.)
- The file is always named holidays.json inside the region folder
- Create all folders automatically if they don't exist

---

## PART 5 — Final Index File

After processing all regions, create one summary index file at:
data/<YEAR>/IN/INDEX.json

INDEX.json structure:
{
  "country": "IN",
  "year": <year>,
  "lastUpdated": "<today's date in YYYY-MM-DD>",
  "totalRegions": <count of regions processed>,
  "regions": [
    {
      "region": "central",
      "path": "data/2026/IN/central/holidays.json",
      "year": 2026,
      "totalHolidays": <count>,
      "gazettedCount": <count>,
      "restrictedCount": <count>
    },
    ... one entry per region
  ]
}

---

## PART 6 — Rules to Follow Always

- Never skip a region — process all 37 URLs
- If a page fails to load, log it and move on, don't stop
- If an .ics file is empty or has 0 events, still create holidays.json with empty data array
- Always sort holidays by date
- Never duplicate entries
- Keep names exactly as they appear in the SUMMARY field
- Source URL is always "https://www.india.gov.in/calendar"
- Always create folders automatically, never throw an error for missing folders
- When a new year comes (e.g. 2027), a new data/2027/IN/ folder is created automatically — never overwrite previous years