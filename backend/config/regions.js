'use strict';

// The one list of regions the data scripts fetch and verify. `alias` is the
// india.gov.in route alias; `code` is the API region code and data folder name.
module.exports = [
  { name: "Central Government", alias: "central", code: "central", isCentral: true },
  { name: "Andhra Pradesh", alias: "andhra-pradesh", code: "AP" },
  { name: "Arunachal Pradesh", alias: "arunachal-pradesh", code: "AR" },
  { name: "Assam", alias: "assam", code: "AS" },
  { name: "Bihar", alias: "bihar", code: "BR" },
  { name: "Chhattisgarh", alias: "chhattisgarh", code: "CG" },
  { name: "Goa", alias: "goa", code: "GA" },
  { name: "Gujarat", alias: "gujarat", code: "GJ" },
  { name: "Haryana", alias: "haryana", code: "HR" },
  { name: "Himachal Pradesh", alias: "himachal-pradesh", code: "HP" },
  { name: "Jharkhand", alias: "jharkhand", code: "JH" },
  { name: "Karnataka", alias: "karnataka", code: "KA" },
  { name: "Kerala", alias: "kerala", code: "KL" },
  { name: "Madhya Pradesh", alias: "madhya-pradesh", code: "MP" },
  { name: "Maharashtra", alias: "maharashtra", code: "MH" },
  { name: "Manipur", alias: "manipur", code: "MN" },
  { name: "Meghalaya", alias: "meghalaya", code: "ML" },
  { name: "Mizoram", alias: "mizoram", code: "MZ" },
  { name: "Nagaland", alias: "nagaland", code: "NL" },
  { name: "Odisha", alias: "odisha", code: "OD" },
  { name: "Punjab", alias: "punjab", code: "PB" },
  { name: "Rajasthan", alias: "rajasthan", code: "RJ" },
  { name: "Sikkim", alias: "sikkim", code: "SK" },
  { name: "Tamil Nadu", alias: "tamil-nadu", code: "TN" },
  { name: "Telangana", alias: "telangana", code: "TS" },
  { name: "Tripura", alias: "tripura", code: "TR" },
  { name: "Uttar Pradesh", alias: "uttar-pradesh", code: "UP" },
  { name: "Uttarakhand", alias: "uttarakhand", code: "UK" },
  { name: "West Bengal", alias: "west-bengal", code: "WB" },
  // UTs
  { name: "Andaman and Nicobar Islands", alias: "andaman-and-nicobar-islands-ut", code: "AN" },
  { name: "Chandigarh", alias: "chandigarh-ut", code: "CH" },
  { name: "Dadra and Nagar Haveli and Daman and Diu", alias: "dadra-and-nagar-haveli-and-daman-and-diu-ut", code: "DN" },
  { name: "Delhi", alias: "delhi-nct", code: "DL" },
  { name: "Jammu and Kashmir", alias: "jammu-and-kashmir-ut", code: "JK" },
  { name: "Lakshadweep", alias: "lakshadweep-ut", code: "LD" },
  { name: "Puducherry", alias: "puducherry-ut", code: "PY" },
  { name: "Ladakh", alias: "ladakh-ut", code: "LA" }
];
