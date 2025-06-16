SELECT TOP (1000) *
FROM [ProgressPlayDBTest].[Games].[Games_PlayedGames] pg (NOLOCK)
INNER JOIN Games.Games g (NOLOCK) ON g.GameID = pg.GameID
INNER JOIN Games.Games_GameTypes gt (NOLOCK) ON gt.ID = g.GameTypeID
INNER JOIN Games.Games_Providers gp (NOLOCK) ON gp.ID = g.ProviderID
INNER JOIN Games.Games_SubProviders gsp (NOLOCK) ON gsp.ID = g.SubProviderID
INNER JOIN accounts.tbl_Account_transactions at (NOLOCK) ON at.ongoing_id = pg.ID
INNER JOIN common.tbl_Players p (NOLOCK) ON p.player_id = pg.PlayerID
INNER JOIN common.tbl_White_labels wl (NOLOCK) ON wl.label_id = p.white_label_id
INNER JOIN common.tbl_Currencies cr (NOLOCK) ON cr.currency_id = p.currency_id
INNER JOIN common.tbl_Countries co (NOLOCK) ON co.country_id = p.country_id
LEFT JOIN accounts.tbl_Account_Info AS ai WITH (NOLOCK) ON ai.player_id = p.player_id 				
LEFT JOIN common.vew_Luts AS lrl WITH (NOLOCK) ON lrl.lut_id = p.risk_level_id
LEFT JOIN common.vew_Luts AS lbt WITH (NOLOCK) ON lbt.lut_id = p.block_type 
LEFT JOIN common.vew_Luts AS lj WITH (NOLOCK) ON lj.lut_id = co.jurisdiction_id
WHERE pg.UpdatedDate >= '2025-04-01'