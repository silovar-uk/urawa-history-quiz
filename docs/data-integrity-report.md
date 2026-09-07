# Data Integrity Report

Updated: 2026-09-07

Status: **PASS**

## Census

```json
{
  "seasons": {
    "total": 34,
    "confirmed": 34,
    "broadSourceOnly": 31
  },
  "players": {
    "total": 38
  },
  "playerSeasons": {
    "total": 79,
    "withShirtNumber": 62,
    "claimBackedEntities": 17,
    "claimBackedNumberRelations": 17
  },
  "managers": {
    "total": 21,
    "tenures": 37,
    "seasonsWithMultipleTenures": 2
  },
  "uniforms": {
    "legacyRecords": 34,
    "verifiedContexts": 8,
    "seasonsWithVerifiedContext": 5
  },
  "sources": {
    "total": 19
  },
  "issues": {
    "total": 11,
    "open": 4,
    "fixed": 7
  }
}
```

## Errors

- None

## Warnings / Known Gaps

- **BROAD_SOURCE_ONLY_SEASONS** — 31 seasons rely only on broad root sources: 1992, 1993, 1994, 1997, 1998, 1999, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025
- **SPARSE_PLAYER_SEASONS** — 1992:2, 1993:2, 1994:3, 1996:3, 1997:2, 1998:2, 1999:2, 2000:2, 2001:2, 2002:2, 2003:2, 2004:2, 2005:2, 2007:3, 2008:1, 2009:1, 2010:2, 2011:1, 2012:2, 2013:1, 2014:2, 2015:1, 2016:2, 2017:2, 2018:1, 2019:1, 2020:1, 2021:2, 2022:2, 2024:2, 2025:2
- **UNIFORM_CONTEXT_GAPS** — 29 seasons lack a verified competition-aware uniform context
- **MANAGER_CHANGE_ONLY_IN_NOTES** — 1997, 1999, 2000, 2001, 2008, 2017

## Interpretation

- ERRORは修正Gateを止める。
- WARNINGは推測で埋めず、既知のResearch / Coverage Debtとして残す。
- 34 seasons covered は、各領域がclaim-levelにverifiedであることを意味しない。
