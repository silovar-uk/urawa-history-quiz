// URAWA HISTORY — Q1.5 claim-level provenance vertical slice
// Only claims that are explicitly backed by the listed source may pass the Quiz Trust Gate.
window.URAWA_CLAIM_PROVENANCE = Object.freeze({
  version: 'q1.5-2026-09-07',
  claims: [
    // 2006 — official season R-File gives both shirt number and position.
    { entityType: 'player_season', entityId: 'ps_2006_tulio', fields: { shirt_number: { value: 4, sourceIds: ['SRC_URAWA_RFILE_2006_J1'] }, position: { value: 'DF', sourceIds: ['SRC_URAWA_RFILE_2006_J1'] } } },
    { entityType: 'player_season', entityId: 'ps_2006_hasebe', fields: { shirt_number: { value: 17, sourceIds: ['SRC_URAWA_RFILE_2006_J1'] }, position: { value: 'MF', sourceIds: ['SRC_URAWA_RFILE_2006_J1'] } } },
    { entityType: 'player_season', entityId: 'ps_2006_ono', fields: { shirt_number: { value: 18, sourceIds: ['SRC_URAWA_RFILE_2006_J1'] }, position: { value: 'MF', sourceIds: ['SRC_URAWA_RFILE_2006_J1'] } } },
    { entityType: 'player_season', entityId: 'ps_2006_ponte', fields: { shirt_number: { value: 10, sourceIds: ['SRC_URAWA_RFILE_2006_J1'] }, position: { value: 'MF', sourceIds: ['SRC_URAWA_RFILE_2006_J1'] } } },
    { entityType: 'player_season', entityId: 'ps_2006_tanaka', fields: { shirt_number: { value: 11, sourceIds: ['SRC_URAWA_RFILE_2006_J1'] }, position: { value: 'FW', sourceIds: ['SRC_URAWA_RFILE_2006_J1'] } } },
    { entityType: 'player_season', entityId: 'ps_2006_suzuki', fields: { shirt_number: { value: 13, sourceIds: ['SRC_URAWA_RFILE_2006_J1'] }, position: { value: 'MF', sourceIds: ['SRC_URAWA_RFILE_2006_J1'] } } },
    { entityType: 'player_season', entityId: 'ps_2006_tsuboi', fields: { shirt_number: { value: 2, sourceIds: ['SRC_URAWA_RFILE_2006_J1'] }, position: { value: 'DF', sourceIds: ['SRC_URAWA_RFILE_2006_J1'] } } },

    // 2017 — current sampled DB only contains two relations, enough for position questions but not number distractors.
    { entityType: 'player_season', entityId: 'ps_2017_rafael', fields: { shirt_number: { value: 8, sourceIds: ['SRC_URAWA_SQUAD_2017'] }, position: { value: 'FW', sourceIds: ['SRC_URAWA_SQUAD_2017'] } } },
    { entityType: 'player_season', entityId: 'ps_2017_abe', fields: { shirt_number: { value: 22, sourceIds: ['SRC_URAWA_SQUAD_2017'] }, position: { value: 'MF', sourceIds: ['SRC_URAWA_SQUAD_2017'] } } },

    // 2023 — official squad archive gives both shirt number and registered position.
    { entityType: 'player_season', entityId: 'ps_2023_scholz', fields: { shirt_number: { value: 28, sourceIds: ['SRC_URAWA_SQUAD_2023'] }, position: { value: 'DF', sourceIds: ['SRC_URAWA_SQUAD_2023'] } } },
    { entityType: 'player_season', entityId: 'ps_2023_hoibraten', fields: { shirt_number: { value: 5, sourceIds: ['SRC_URAWA_SQUAD_2023'] }, position: { value: 'DF', sourceIds: ['SRC_URAWA_SQUAD_2023'] } } },
    { entityType: 'player_season', entityId: 'ps_2023_ito', fields: { shirt_number: { value: 3, sourceIds: ['SRC_URAWA_SQUAD_2023'] }, position: { value: 'MF', sourceIds: ['SRC_URAWA_SQUAD_2023'] } } },
    { entityType: 'player_season', entityId: 'ps_2023_kante', fields: { shirt_number: { value: 11, sourceIds: ['SRC_URAWA_SQUAD_2023'] }, position: { value: 'FW', sourceIds: ['SRC_URAWA_SQUAD_2023'] } } },

    // Kit claims: verified values that match the current base record.
    { entityType: 'uniform', entityId: 'kit_2005', fields: { chest_sponsor: { value: 'Vodafone', sourceIds: ['SRC_URAWA_KIT_2005_VODAFONE'] } } },
    { entityType: 'uniform', entityId: 'kit_2013', fields: { chest_sponsor: { value: 'POLUS', sourceIds: ['SRC_URAWA_KIT_2013_POLUS'] } } }
  ],

  // Provenance research also surfaced base-data contradictions. They remain blocked, not silently corrected here.
  issues: [
    { entityType: 'player_season', entityId: 'ps_2006_washington', field: 'shirt_number', currentValue: 30, expectedValue: 21, sourceIds: ['SRC_URAWA_SQUAD_2006', 'SRC_URAWA_RFILE_2006_J1'] },
    { entityType: 'player_season', entityId: 'ps_2006_yamada', field: 'position', currentValue: 'DF', expectedValue: 'MF', sourceIds: ['SRC_URAWA_RFILE_2006_J1'] },
    { entityType: 'player_season', entityId: 'ps_2006_tsuzuki', field: 'shirt_number', currentValue: 21, expectedValue: 23, sourceIds: ['SRC_URAWA_SQUAD_2006', 'SRC_URAWA_RFILE_2006_J1'] },
    { entityType: 'player_season', entityId: 'ps_2006_okano', field: 'shirt_number', currentValue: 32, expectedValue: 30, sourceIds: ['SRC_URAWA_SQUAD_2006'] },
    { entityType: 'uniform', entityId: 'kit_2007', field: 'chest_sponsor', currentValue: 'DHL', expectedValue: 'SAVAS', context: 'domestic J.League / cup HOME kit', sourceIds: ['SRC_URAWA_KIT_2007_SAVAS_DHL'] },
    { entityType: 'uniform', entityId: 'kit_2004', field: 'chest_sponsor', currentValue: 'Vodafone', expectedValue: 'MITSUBISHI MOTORS', context: 'requires base-data repair before confirmation; 2005 official announcement establishes Vodafone as the new 2005 chest partner', sourceIds: ['SRC_URAWA_KIT_2005_VODAFONE'] }
  ]
});