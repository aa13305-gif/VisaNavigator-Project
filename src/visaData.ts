import { type VisaStatus } from "./App";

// Schengen zone countries - all visa free to each other
const SCHENGEN = ["AT","BE","CZ","DK","EE","FI","FR","DE","GR","HU","IS","IT","LV","LI","LT","LU","MT","NL","NO","PL","PT","SK","SI","ES","SE","CH"];

// EU non-Schengen
const EU_NON_SCHENGEN = ["BG","HR","CY","IE","RO"];

// All European visa-free bloc
const EUROPE_FREE = [...SCHENGEN, ...EU_NON_SCHENGEN, "AL","BA","MD","ME","MK","RS","UA","GE","AM"];

// Build Schengen passport data - all Schengen to each other = Visa Free
const buildSchengenData = (passport: string): Record<string, VisaStatus> => {
  const data: Record<string, VisaStatus> = {};
  // All European countries visa free
  EUROPE_FREE.forEach(code => { if (code !== passport) data[code] = "Visa Free"; });
  // Common destinations
  const commonVisaFree = ["US","CA","MX","BR","AR","CL","CO","PE","UY","JP","KR","SG","MY","TH","ID","PH","IL","AE","QA","MA","TN","ZA","NZ","AU"];
  commonVisaFree.forEach(code => { data[code] = "Visa Free"; });
  // eVisa destinations
  ["KE","TZ","UG","EG","TR","AZ","VN","KH","LK","IN"].forEach(code => { data[code] = "e-Visa"; });
  // Visa required
  ["CN","RU","NG","PK","BD","AF","IQ","IR","SY","CU","KP","BY"].forEach(code => { data[code] = "Visa Required"; });
  return data;
};

const visaData: Record<string, Record<string, VisaStatus>> = {
  // ─── SCHENGEN COUNTRIES ───────────────────────────────────────────
  "FR": buildSchengenData("FR"),
  "DE": buildSchengenData("DE"),
  "IT": buildSchengenData("IT"),
  "ES": buildSchengenData("ES"),
  "PT": buildSchengenData("PT"),
  "NL": buildSchengenData("NL"),
  "BE": buildSchengenData("BE"),
  "AT": buildSchengenData("AT"),
  "CH": buildSchengenData("CH"),
  "SE": buildSchengenData("SE"),
  "NO": buildSchengenData("NO"),
  "DK": buildSchengenData("DK"),
  "FI": buildSchengenData("FI"),
  "PL": buildSchengenData("PL"),
  "CZ": buildSchengenData("CZ"),
  "HU": buildSchengenData("HU"),
  "RO": buildSchengenData("RO"),
  "BG": buildSchengenData("BG"),
  "HR": buildSchengenData("HR"),
  "SK": buildSchengenData("SK"),
  "SI": buildSchengenData("SI"),
  "EE": buildSchengenData("EE"),
  "LV": buildSchengenData("LV"),
  "LT": buildSchengenData("LT"),
  "LU": buildSchengenData("LU"),
  "MT": buildSchengenData("MT"),
  "CY": buildSchengenData("CY"),
  "GR": buildSchengenData("GR"),
  "IS": buildSchengenData("IS"),
  "LI": buildSchengenData("LI"),

  // ─── UK ──────────────────────────────────────────────────────────
  "GB": {
    ...buildSchengenData("GB"),
    "US": "Visa Free", "CA": "e-Visa", "AU": "e-Visa", "NZ": "Visa Free",
    "JP": "Visa Free", "KR": "Visa Free", "SG": "Visa Free", "MY": "Visa Free",
    "TH": "Visa Free", "ID": "Visa Free", "PH": "Visa Free",
    "IL": "Visa Free", "AE": "Visa Free", "QA": "Visa Free",
    "ZA": "Visa Free", "BR": "Visa Free", "AR": "Visa Free", "MX": "Visa Free",
    "MA": "Visa Free", "TN": "Visa Free",
    "IN": "Visa Required", "CN": "Visa Required", "RU": "Visa Required",
    "NG": "Visa Required", "PK": "Visa Required", "BD": "Visa Required",
  },

  // ─── IRELAND ─────────────────────────────────────────────────────
  "IE": {
    ...buildSchengenData("IE"),
    "US": "Visa Free", "CA": "Visa Free", "AU": "e-Visa", "NZ": "Visa Free",
    "JP": "Visa Free", "SG": "Visa Free", "AE": "Visa Free",
    "IN": "Visa Required", "CN": "Visa Required",
  },

  // ─── UNITED STATES ───────────────────────────────────────────────
  "US": {
    "GB": "Visa Free", "FR": "Visa Free", "DE": "Visa Free", "IT": "Visa Free",
    "ES": "Visa Free", "PT": "Visa Free", "NL": "Visa Free", "BE": "Visa Free",
    "AT": "Visa Free", "CH": "Visa Free", "SE": "Visa Free", "NO": "Visa Free",
    "DK": "Visa Free", "FI": "Visa Free", "PL": "Visa Free", "CZ": "Visa Free",
    "HU": "Visa Free", "RO": "Visa Free", "BG": "Visa Free", "HR": "Visa Free",
    "SK": "Visa Free", "SI": "Visa Free", "EE": "Visa Free", "LV": "Visa Free",
    "LT": "Visa Free", "LU": "Visa Free", "MT": "Visa Free", "CY": "Visa Free",
    "GR": "Visa Free", "IE": "Visa Free", "IS": "Visa Free", "LI": "Visa Free",
    "MC": "Visa Free", "AD": "Visa Free", "SM": "Visa Free", "AL": "Visa Free",
    "RS": "Visa Free", "ME": "Visa Free", "MK": "Visa Free", "BA": "Visa Free",
    "CA": "Visa Free", "MX": "Visa Free", "AU": "e-Visa", "NZ": "e-Visa",
    "JP": "Visa Free", "KR": "Visa Free", "SG": "Visa Free", "MY": "Visa Free",
    "TH": "Visa Free", "ID": "Visa Free", "PH": "Visa Free", "VN": "e-Visa",
    "KH": "e-Visa", "LA": "Visa on Arrival", "IL": "Visa Free", "AE": "Visa Free",
    "QA": "Visa Free", "BH": "Visa on Arrival", "JO": "Visa on Arrival",
    "TR": "e-Visa", "EG": "e-Visa", "MA": "Visa Free", "TN": "Visa Free",
    "KE": "e-Visa", "TZ": "e-Visa", "UG": "e-Visa", "RW": "Visa on Arrival",
    "ZA": "Visa Free", "GH": "Visa Free", "BR": "Visa Free", "AR": "Visa Free",
    "CL": "Visa Free", "CO": "Visa Free", "PE": "Visa Free", "UY": "Visa Free",
    "GE": "Visa Free", "KZ": "Visa Free", "UZ": "Visa Free", "AZ": "e-Visa",
    "IN": "Visa Required", "CN": "Visa Required", "RU": "Visa Required",
    "NG": "Visa Required", "PK": "Visa Required", "BD": "Visa Required",
    "AF": "Visa Required", "IQ": "Visa Required", "IR": "Visa Required",
    "SY": "Visa Required", "CU": "Visa Required", "KP": "Visa Required",
  },

  // ─── CANADA ──────────────────────────────────────────────────────
  "CA": {
    "US": "Visa Free", "GB": "Visa Free", "FR": "Visa Free", "DE": "Visa Free",
    "IT": "Visa Free", "ES": "Visa Free", "PT": "Visa Free", "NL": "Visa Free",
    "BE": "Visa Free", "AT": "Visa Free", "CH": "Visa Free", "SE": "Visa Free",
    "NO": "Visa Free", "DK": "Visa Free", "FI": "Visa Free", "IE": "Visa Free",
    "AU": "e-Visa", "NZ": "Visa Free", "JP": "Visa Free", "KR": "Visa Free",
    "SG": "Visa Free", "MX": "Visa Free", "TH": "Visa Free", "AE": "Visa Free",
    "BR": "Visa Free", "AR": "Visa Free", "CL": "Visa Free", "MA": "Visa Free",
    "IL": "Visa Free", "ZA": "Visa Free",
    "IN": "Visa Required", "CN": "Visa Required", "RU": "Visa Required",
    "NG": "Visa Required", "PK": "Visa Required",
  },

  // ─── AUSTRALIA ───────────────────────────────────────────────────
  "AU": {
    "NZ": "Visa Free", "GB": "Visa Free", "US": "e-Visa", "CA": "e-Visa",
    "FR": "e-Visa", "DE": "e-Visa", "IT": "e-Visa", "ES": "e-Visa",
    "JP": "Visa Free", "KR": "Visa Free", "SG": "Visa Free", "MY": "Visa Free",
    "TH": "Visa Free", "ID": "Visa Free", "PH": "Visa Free",
    "AE": "Visa Free", "QA": "Visa Free", "IL": "Visa Free",
    "ZA": "Visa Free", "BR": "e-Visa", "AR": "Visa Free",
    "IN": "Visa Required", "CN": "Visa Required", "NG": "Visa Required",
    "PK": "Visa Required",
  },

  // ─── NEW ZEALAND ─────────────────────────────────────────────────
  "NZ": {
    "AU": "Visa Free", "GB": "Visa Free", "US": "e-Visa", "CA": "e-Visa",
    "JP": "Visa Free", "SG": "Visa Free", "TH": "Visa Free", "AE": "Visa Free",
    "FR": "Visa Free", "DE": "Visa Free", "IT": "Visa Free",
    "IN": "Visa Required", "CN": "Visa Required",
  },

  // ─── JAPAN ───────────────────────────────────────────────────────
  "JP": {
    "US": "Visa Free", "GB": "Visa Free", "FR": "Visa Free", "DE": "Visa Free",
    "IT": "Visa Free", "ES": "Visa Free", "AU": "Visa Free", "CA": "Visa Free",
    "NZ": "Visa Free", "KR": "Visa Free", "SG": "Visa Free", "MY": "Visa Free",
    "TH": "Visa Free", "ID": "Visa Free", "PH": "Visa Free", "VN": "Visa Free",
    "AE": "Visa Free", "TR": "Visa Free", "MA": "Visa Free", "ZA": "Visa Free",
    "BR": "Visa Free", "AR": "Visa Free", "MX": "Visa Free",
    "IN": "Visa Required", "CN": "Visa Required", "RU": "Visa Required",
    "NG": "Visa Required", "PK": "Visa Required",
  },

  // ─── SOUTH KOREA ─────────────────────────────────────────────────
  "KR": {
    "US": "Visa Free", "GB": "Visa Free", "FR": "Visa Free", "DE": "Visa Free",
    "JP": "Visa Free", "AU": "Visa Free", "CA": "Visa Free", "SG": "Visa Free",
    "TH": "Visa Free", "AE": "Visa Free", "BR": "Visa Free", "MX": "Visa Free",
    "IN": "Visa Required", "CN": "Visa Required", "RU": "Visa Required",
    "NG": "Visa Required",
  },

  // ─── SINGAPORE ───────────────────────────────────────────────────
  "SG": {
    "US": "Visa Free", "GB": "Visa Free", "FR": "Visa Free", "DE": "Visa Free",
    "AU": "Visa Free", "JP": "Visa Free", "MY": "Visa Free", "TH": "Visa Free",
    "ID": "Visa Free", "PH": "Visa Free", "VN": "Visa Free", "KR": "Visa Free",
    "AE": "Visa Free", "QA": "Visa Free", "IN": "Visa Free", "CN": "Visa Free",
    "ZA": "Visa Free", "BR": "Visa Free", "AR": "Visa Free", "MX": "Visa Free",
    "RU": "Visa Required", "NG": "Visa Required", "PK": "Visa Required",
  },

  // ─── UAE ─────────────────────────────────────────────────────────
  "AE": {
    "US": "Visa Free", "GB": "Visa Free", "FR": "Visa Free", "DE": "Visa Free",
    "IT": "Visa Free", "ES": "Visa Free", "AU": "Visa Free", "CA": "Visa Free",
    "JP": "Visa Free", "KR": "Visa Free", "SG": "Visa Free", "MY": "Visa Free",
    "TH": "Visa Free", "TR": "Visa Free", "MA": "Visa Free", "ZA": "Visa Free",
    "BR": "Visa Free", "AR": "Visa Free", "MX": "Visa Free", "RU": "Visa Free",
    "IN": "Visa on Arrival", "ID": "Visa on Arrival", "PH": "Visa on Arrival",
    "CN": "Visa Free", "NG": "Visa Required", "PK": "Visa Required",
  },

  // ─── INDIA ───────────────────────────────────────────────────────
  "IN": {
    "NP": "Visa Free", "BT": "Visa Free", "TH": "Visa Free", "ID": "Visa Free",
    "MY": "Visa Free", "MU": "Visa Free", "FJ": "Visa Free", "KZ": "Visa Free",
    "JM": "Visa Free", "SV": "Visa Free", "BB": "Visa Free", "DM": "Visa Free",
    "GD": "Visa Free", "HT": "Visa Free", "LC": "Visa Free", "VC": "Visa Free",
    "TT": "Visa Free", "VU": "Visa Free", "SN": "Visa Free", "KN": "Visa Free",
    "MV": "Visa on Arrival", "SC": "Visa on Arrival", "ET": "Visa on Arrival",
    "JO": "Visa on Arrival", "KH": "Visa on Arrival", "LA": "Visa on Arrival",
    "MG": "Visa on Arrival", "MR": "Visa on Arrival", "MZ": "Visa on Arrival",
    "RW": "Visa on Arrival", "ZW": "Visa on Arrival",
    "LK": "e-Visa", "VN": "e-Visa", "GE": "e-Visa", "AZ": "e-Visa",
    "TR": "e-Visa", "EG": "e-Visa", "QA": "e-Visa", "AE": "e-Visa",
    "KE": "e-Visa", "TZ": "e-Visa", "UG": "e-Visa", "ZM": "e-Visa",
    "US": "Visa Required", "GB": "Visa Required", "FR": "Visa Required",
    "DE": "Visa Required", "AU": "Visa Required", "CA": "Visa Required",
    "JP": "Visa Required", "CN": "Visa Required", "SG": "Visa Required",
    "NZ": "Visa Required", "IT": "Visa Required", "ES": "Visa Required",
    "CH": "Visa Required", "AT": "Visa Required", "NL": "Visa Required",
    "BE": "Visa Required", "SE": "Visa Required", "NO": "Visa Required",
    "DK": "Visa Required", "FI": "Visa Required", "PL": "Visa Required",
    "KR": "Visa Required", "ZA": "Visa Required", "BR": "Visa Required",
    "AR": "Visa Required", "MX": "Visa Required", "SA": "Visa Required",
    "KW": "Visa Required", "RU": "Visa Required",
  },

  // ─── CHINA ───────────────────────────────────────────────────────
  "CN": {
    "TH": "Visa Free", "MY": "Visa Free", "SG": "Visa Free", "ID": "Visa Free",
    "VN": "Visa Free", "KH": "Visa on Arrival", "LA": "Visa Free",
    "KR": "Visa Free", "RU": "Visa Free", "KZ": "Visa Free",
    "GE": "Visa Free", "AZ": "Visa Free", "AM": "Visa Free",
    "AE": "Visa Free", "QA": "Visa Free", "MA": "Visa Free",
    "ET": "Visa on Arrival", "KE": "e-Visa", "TZ": "e-Visa",
    "BR": "Visa Free", "AR": "Visa Free", "CL": "Visa Free",
    "US": "Visa Required", "GB": "Visa Required", "FR": "Visa Required",
    "DE": "Visa Required", "AU": "Visa Required", "CA": "Visa Required",
    "JP": "Visa Required", "IN": "Visa Required", "NG": "Visa Required",
  },

  // ─── NIGERIA ─────────────────────────────────────────────────────
  "NG": {
    "GH": "Visa Free", "SN": "Visa Free", "BJ": "Visa Free", "TG": "Visa Free",
    "ML": "Visa Free", "BF": "Visa Free", "NE": "Visa Free", "GM": "Visa Free",
    "GN": "Visa Free", "GW": "Visa Free", "SL": "Visa Free", "LR": "Visa Free",
    "CI": "Visa Free", "MA": "Visa Free", "TN": "Visa Free", "MU": "Visa Free",
    "JM": "Visa Free", "BB": "Visa Free", "TT": "Visa Free", "HT": "Visa Free",
    "KE": "Visa on Arrival", "RW": "Visa on Arrival", "UG": "Visa on Arrival",
    "ET": "Visa on Arrival", "CM": "Visa on Arrival", "GA": "Visa on Arrival",
    "MG": "Visa on Arrival", "MZ": "Visa on Arrival", "ZM": "Visa on Arrival",
    "TZ": "e-Visa", "EG": "e-Visa", "ZW": "e-Visa", "TR": "e-Visa",
    "US": "Visa Required", "GB": "Visa Required", "FR": "Visa Required",
    "DE": "Visa Required", "AU": "Visa Required", "CA": "Visa Required",
    "JP": "Visa Required", "CN": "Visa Required", "SG": "Visa Required",
    "AE": "Visa Required", "SA": "Visa Required", "IN": "Visa Required",
    "RU": "Visa Required", "PK": "Visa Required",
  },

  // ─── PAKISTAN ────────────────────────────────────────────────────
  "PK": {
    "MA": "Visa Free", "TN": "Visa Free", "TJ": "Visa Free",
    "MV": "Visa on Arrival", "NP": "Visa on Arrival", "JO": "Visa on Arrival",
    "RW": "Visa on Arrival", "ET": "Visa on Arrival",
    "TR": "e-Visa", "AZ": "e-Visa", "GE": "e-Visa", "EG": "e-Visa",
    "KE": "e-Visa", "TZ": "e-Visa", "UG": "e-Visa", "ZW": "e-Visa",
    "US": "Visa Required", "GB": "Visa Required", "FR": "Visa Required",
    "DE": "Visa Required", "AU": "Visa Required", "CA": "Visa Required",
    "JP": "Visa Required", "CN": "Visa Required", "SG": "Visa Required",
    "AE": "Visa Required", "SA": "Visa Required", "MY": "Visa Required",
    "TH": "Visa Required", "IN": "Visa Required", "NG": "Visa Required",
  },

  // ─── BRAZIL ──────────────────────────────────────────────────────
  "BR": {
    "AR": "Visa Free", "BO": "Visa Free", "CL": "Visa Free", "CO": "Visa Free",
    "EC": "Visa Free", "PY": "Visa Free", "PE": "Visa Free", "UY": "Visa Free",
    "VE": "Visa Free", "MX": "Visa Free", "PA": "Visa Free", "CR": "Visa Free",
    "PT": "Visa Free", "FR": "Visa Free", "DE": "Visa Free", "IT": "Visa Free",
    "ES": "Visa Free", "AT": "Visa Free", "BE": "Visa Free", "NL": "Visa Free",
    "SE": "Visa Free", "CH": "Visa Free", "GB": "Visa Free", "JP": "Visa Free",
    "KR": "Visa Free", "SG": "Visa Free", "MY": "Visa Free", "TH": "Visa Free",
    "ID": "Visa Free", "IL": "Visa Free", "MA": "Visa Free", "ZA": "Visa Free",
    "AE": "Visa Free", "QA": "Visa Free", "TR": "Visa Free",
    "AU": "e-Visa", "NZ": "e-Visa", "EG": "e-Visa", "KE": "e-Visa",
    "IN": "e-Visa", "VN": "e-Visa", "GE": "e-Visa",
    "MV": "Visa on Arrival", "JO": "Visa on Arrival",
    "US": "Visa Required", "CA": "Visa Required", "CN": "Visa Required",
    "RU": "Visa Required", "NG": "Visa Required", "PK": "Visa Required",
  },

  // ─── RUSSIA ──────────────────────────────────────────────────────
  "RU": {
    "BY": "Visa Free", "KZ": "Visa Free", "AM": "Visa Free", "KG": "Visa Free",
    "TJ": "Visa Free", "UZ": "Visa Free", "AZ": "Visa Free", "GE": "Visa Free",
    "TR": "Visa Free", "TH": "Visa Free", "VN": "Visa Free", "CN": "Visa Free",
    "MN": "Visa Free", "EG": "Visa Free", "MA": "Visa Free", "TN": "Visa Free",
    "CU": "Visa Free", "BR": "Visa Free", "AR": "Visa Free",
    "IN": "e-Visa",
    "US": "Visa Required", "GB": "Visa Required", "FR": "Visa Required",
    "DE": "Visa Required", "AU": "Visa Required", "CA": "Visa Required",
    "JP": "Visa Required", "NG": "Visa Required",
  },

  // ─── SOUTH AFRICA ────────────────────────────────────────────────
  "ZA": {
    "ZM": "Visa Free", "ZW": "Visa Free", "NA": "Visa Free", "BW": "Visa Free",
    "LS": "Visa Free", "SZ": "Visa Free", "MZ": "Visa Free", "MW": "Visa Free",
    "TZ": "Visa Free", "KE": "Visa Free", "RW": "Visa Free", "UG": "Visa Free",
    "MU": "Visa Free", "SC": "Visa Free", "GB": "Visa Free", "FR": "Visa Free",
    "DE": "Visa Free", "IT": "Visa Free", "SG": "Visa Free", "MY": "Visa Free",
    "TH": "Visa Free", "ID": "Visa Free", "US": "Visa Free", "CA": "e-Visa",
    "AU": "Visa Free", "NZ": "Visa Free", "JP": "Visa Free", "KR": "Visa Free",
    "AE": "Visa Free", "QA": "Visa Free", "BR": "Visa Free", "AR": "Visa Free",
    "IN": "Visa Required", "CN": "Visa Required", "NG": "Visa Required",
    "PK": "Visa Required", "RU": "Visa Required",
  },

  // ─── MALAYSIA ────────────────────────────────────────────────────
  "MY": {
    "SG": "Visa Free", "TH": "Visa Free", "ID": "Visa Free", "PH": "Visa Free",
    "VN": "Visa Free", "KH": "Visa Free", "LA": "Visa Free", "BN": "Visa Free",
    "JP": "Visa Free", "KR": "Visa Free", "CN": "Visa Free", "IN": "Visa Free",
    "AU": "Visa Free", "NZ": "Visa Free", "GB": "Visa Free", "US": "Visa Free",
    "FR": "Visa Free", "DE": "Visa Free", "AE": "Visa Free", "TR": "Visa Free",
    "ZA": "Visa Free", "BR": "Visa Free", "MX": "Visa Free",
    "NG": "Visa Required", "PK": "Visa Required", "RU": "Visa Required",
  },

  // ─── THAILAND ────────────────────────────────────────────────────
  "TH": {
    "SG": "Visa Free", "MY": "Visa Free", "ID": "Visa Free", "PH": "Visa Free",
    "VN": "Visa Free", "KH": "Visa Free", "LA": "Visa Free", "BN": "Visa Free",
    "JP": "Visa Free", "KR": "Visa Free", "CN": "Visa Free", "IN": "Visa Free",
    "AU": "Visa Free", "NZ": "Visa Free", "GB": "Visa Free", "US": "Visa Free",
    "FR": "Visa Free", "DE": "Visa Free", "AE": "Visa Free", "TR": "Visa Free",
    "BR": "Visa Free", "RU": "Visa Free", "MX": "Visa Free", "ZA": "Visa Free",
    "NG": "Visa Required", "PK": "Visa Required",
  },

  // ─── TURKEY ──────────────────────────────────────────────────────
  "TR": {
    "AZ": "Visa Free", "KZ": "Visa Free", "KG": "Visa Free", "UZ": "Visa Free",
    "GE": "Visa Free", "JP": "Visa Free", "KR": "Visa Free", "SG": "Visa Free",
    "MY": "Visa Free", "TH": "Visa Free", "ID": "Visa Free", "VN": "Visa Free",
    "QA": "Visa Free", "MA": "Visa Free", "TN": "Visa Free", "EG": "Visa Free",
    "BR": "Visa Free", "AR": "Visa Free", "MX": "Visa Free",
    "IN": "e-Visa", "RU": "e-Visa",
    "US": "Visa Required", "GB": "Visa Required", "FR": "Visa Required",
    "DE": "Visa Required", "AU": "Visa Required", "CA": "Visa Required",
    "CN": "Visa Required", "NG": "Visa Required",
  },

  // ─── MEXICO ──────────────────────────────────────────────────────
  "MX": {
    "US": "Visa Free", "CA": "Visa Free", "GB": "Visa Free", "FR": "Visa Free",
    "DE": "Visa Free", "ES": "Visa Free", "IT": "Visa Free", "AU": "e-Visa",
    "JP": "Visa Free", "KR": "Visa Free", "SG": "Visa Free", "TH": "Visa Free",
    "AE": "Visa Free", "TR": "Visa Free", "BR": "Visa Free", "AR": "Visa Free",
    "CO": "Visa Free", "CL": "Visa Free", "PE": "Visa Free",
    "IN": "Visa Required", "CN": "Visa Required", "RU": "Visa Required",
    "NG": "Visa Required",
  },

  // ─── ARGENTINA ───────────────────────────────────────────────────
  "AR": {
    "BR": "Visa Free", "CL": "Visa Free", "CO": "Visa Free", "PE": "Visa Free",
    "UY": "Visa Free", "PY": "Visa Free", "BO": "Visa Free", "EC": "Visa Free",
    "MX": "Visa Free", "US": "Visa Free", "CA": "Visa Free", "GB": "Visa Free",
    "FR": "Visa Free", "DE": "Visa Free", "IT": "Visa Free", "ES": "Visa Free",
    "JP": "Visa Free", "AU": "e-Visa", "TH": "Visa Free", "AE": "Visa Free",
    "TR": "Visa Free", "ZA": "Visa Free",
    "IN": "Visa Required", "CN": "Visa Required", "RU": "Visa Required",
    "NG": "Visa Required",
  },

  // ─── KENYA ───────────────────────────────────────────────────────
  "KE": {
    "UG": "Visa Free", "TZ": "Visa Free", "RW": "Visa Free", "ET": "Visa Free",
    "ZM": "Visa Free", "MU": "Visa Free", "SC": "Visa Free",
    "EG": "Visa on Arrival", "JO": "Visa on Arrival", "MV": "Visa on Arrival",
    "TR": "e-Visa", "AZ": "e-Visa",
    "GB": "Visa Required", "US": "Visa Required", "AU": "Visa Required",
    "IN": "Visa Required", "CN": "Visa Required",
  },

  // ─── GHANA ───────────────────────────────────────────────────────
  "GH": {
    "NG": "Visa Free", "SN": "Visa Free", "CI": "Visa Free", "BJ": "Visa Free",
    "TG": "Visa Free", "ML": "Visa Free", "BF": "Visa Free",
    "MA": "Visa Free", "TN": "Visa Free",
    "KE": "Visa on Arrival", "RW": "Visa on Arrival", "ET": "Visa on Arrival",
    "US": "Visa Required", "GB": "Visa Required", "AU": "Visa Required",
    "IN": "Visa Required", "CN": "Visa Required",
  },

  // ─── INDONESIA ───────────────────────────────────────────────────
  "ID": {
    "SG": "Visa Free", "MY": "Visa Free", "TH": "Visa Free", "PH": "Visa Free",
    "VN": "Visa Free", "BN": "Visa Free", "JP": "Visa Free", "KR": "Visa Free",
    "AU": "Visa Free", "NZ": "Visa Free", "GB": "Visa Free", "US": "Visa Free",
    "FR": "Visa Free", "DE": "Visa Free", "AE": "Visa Free", "MA": "Visa Free",
    "IN": "Visa on Arrival", "CN": "Visa Free", "RU": "Visa Free",
    "NG": "Visa Required", "PK": "Visa Required",
  },

  // ─── PHILIPPINES ─────────────────────────────────────────────────
  "PH": {
    "SG": "Visa Free", "MY": "Visa Free", "TH": "Visa Free", "ID": "Visa Free",
    "VN": "Visa Free", "KH": "Visa Free", "LA": "Visa Free", "BN": "Visa Free",
    "JP": "Visa Free", "KR": "Visa Free", "BR": "Visa Free",
    "MA": "Visa Free", "MU": "Visa Free", "FJ": "Visa Free",
    "MV": "Visa on Arrival", "JO": "Visa on Arrival",
    "TR": "e-Visa", "EG": "e-Visa", "KE": "e-Visa", "IN": "e-Visa",
    "US": "Visa Required", "GB": "Visa Required", "FR": "Visa Required",
    "DE": "Visa Required", "AU": "Visa Required", "CA": "Visa Required",
    "CN": "Visa Required", "RU": "Visa Required", "NG": "Visa Required",
  },

  // ─── EGYPT ───────────────────────────────────────────────────────
  "EG": {
    "JO": "Visa Free", "LB": "Visa Free", "MA": "Visa Free", "TN": "Visa Free",
    "TR": "Visa Free", "KE": "Visa on Arrival", "ET": "Visa on Arrival",
    "MV": "Visa on Arrival", "RW": "Visa on Arrival",
    "US": "Visa Required", "GB": "Visa Required", "AU": "Visa Required",
    "IN": "Visa Required", "CN": "Visa Required",
  },
};

export function getVisaStatus(nationalityCode: string, destinationCode: string): VisaStatus | null {
  if (visaData[nationalityCode] && visaData[nationalityCode][destinationCode]) {
    return visaData[nationalityCode][destinationCode];
  }
  return null;
}
