USE [ProgressPlayDBTest]
GO

/****** Object:  Table [common].[tbl_Players]    Script Date: 6/13/2025 8:34:49 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [common].[tbl_Players](
	[player_id] [bigint] IDENTITY(1,1) NOT NULL,
	[first_name] [nvarchar](64) NULL,
	[last_name] [nvarchar](64) NULL,
	[white_label_id] [smallint] NOT NULL,
	[tracker_id] [int] NOT NULL,
	[dynamic_parameter] [varchar](500) NULL,
	[currency_id] [tinyint] NOT NULL,
	[email] [varchar](256) NOT NULL,
	[gender_id] [int] NULL,
	[birthday] [smalldatetime] NULL,
	[phone_number] [varchar](64) NULL,
	[cellphone_number] [varchar](64) NULL,
	[country_id] [int] NULL,
	[state_id] [int] NULL,
	[city] [nvarchar](64) NULL,
	[address] [nvarchar](256) NULL,
	[zipcode] [nvarchar](50) NULL,
	[status_id] [smallint] NOT NULL,
	[registration_date] [datetime] NOT NULL,
	[password_masked] [varchar](500) NULL,
	[risk_level_id] [int] NOT NULL,
	[risk_reason] [varchar](100) NULL,
	[id_receive_method_id] [int] NULL,
	[add_info] [nvarchar](50) NULL,
	[lucky_charm_image] [varchar](100) NULL,
	[sms_notifications_enabled] [bit] NOT NULL,
	[mail_notifications_enabled] [bit] NOT NULL,
	[promotional_mail_enabled] [bit] NOT NULL,
	[cc_deposit_enabled] [bit] NULL,
	[bonuses_enabled] [bit] NOT NULL,
	[chat_enabled] [bit] NOT NULL,
	[has_played_lotto] [bit] NULL,
	[has_played_advanced] [bit] NULL,
	[comments] [nvarchar](50) NULL,
	[language_id] [int] NOT NULL,
	[updated_dt] [smalldatetime] NOT NULL,
	[last_ip] [nvarchar](50) NULL,
	[activation_code] [varchar](50) NULL,
	[token] [varchar](50) NULL,
	[token_expire] [smalldatetime] NULL,
	[withdrawal_limit] [decimal](10, 2) NULL,
	[deposit_limit] [decimal](10, 2) NULL,
	[uses_adv_bets] [bit] NOT NULL,
	[promotion_code] [nvarchar](100) NULL,
	[password] [varchar](500) NULL,
	[is_internal] [bit] NOT NULL,
	[registration_ip] [nvarchar](50) NULL,
	[last_login_date] [datetime] NULL,
	[original_tracker_code] [varchar](50) NULL,
	[logged_in] [bit] NULL,
	[ftd_date] [datetime] NULL,
	[ftda_date] [datetime] NULL,
	[block_date] [datetime] NULL,
	[block_reason] [nvarchar](1000) NULL,
	[bo_comment] [nvarchar](max) NULL,
	[block_release_date] [datetime] NULL,
	[migration_message] [bit] NULL,
	[forgot_password_guid] [nvarchar](50) NULL,
	[game_limit_encountered] [nvarchar](50) NULL,
	[activation_due_date] [datetime] NULL,
	[bo_agent] [int] NULL,
	[last_deposit_date] [datetime] NULL,
	[freegame_offer] [nvarchar](500) NULL,
	[deposits_count] [int] NULL,
	[free_money_bonus] [money] NULL,
	[free_money_balance] [money] NULL,
	[vip_invitation_status] [int] NULL,
	[vip_level] [int] NULL,
	[click_id] [nvarchar](500) NULL,
	[game_token] [varchar](50) NULL,
	[funds_approve] [bit] NULL,
	[welcome_bonus_desc] [nvarchar](500) NULL,
	[disable_wager_check] [bit] NULL,
	[cellphone_validation] [nvarchar](10) NULL,
	[block_type] [int] NULL,
	[session_limit] [int] NULL,
	[id3_status] [int] NULL,
	[PlayerTokenBytes] [varbinary](36) NULL,
	[platform_registered_in] [nvarchar](50) NULL,
	[platform_last_login] [nvarchar](500) NULL,
	[phone_notifications_enabled] [bit] NULL,
	[post_notifications_enabled] [bit] NULL,
	[promotional_sms_enabled] [bit] NULL,
	[promotional_phone_enabled] [bit] NULL,
	[promotional_post_enabled] [bit] NULL,
	[promotional_partner_enabled] [bit] NULL,
	[casino_enabled] [bit] NULL,
	[sport_enabled] [bit] NULL,
	[registration_play_mode] [int] NOT NULL,
	[welcome_bonus_desc_sport] [nvarchar](500) NULL,
	[deposits_count_casino] [int] NULL,
	[deposits_count_sport] [int] NULL,
	[last_login_play_mode] [int] NULL,
	[edd_required] [bit] NULL,
	[risk_level_last_verified] [datetime] NULL,
	[show_push_notifications_prompt] [bit] NULL,
	[sof_required] [bit] NULL,
	[do_not_call] [bit] NULL,
	[bonus_disables_player_request] [bit] NULL,
	[bonus_abuser] [bit] NULL,
	[fraud_checked] [bit] NULL,
	[fraud_comment] [varchar](1000) NULL,
	[edd_status] [int] NULL,
	[cdd_status] [int] NULL,
	[sof_status] [int] NULL,
	[is_push_enabled] [bit] NULL,
	[promotional_push_enabled] [bit] NULL,
	[risk_comments] [nvarchar](max) NULL,
	[rg_event_id] [int] NULL,
	[facebook_token] [nvarchar](max) NULL,
	[google_token] [nvarchar](max) NULL,
	[last_update] [datetime] NULL,
	[last_login_platform] [int] NULL,
	[aff_status] [int] NULL,
	[aff_treshold] [money] NULL,
	[profession_id] [int] NULL,
	[withdrawals_process_type] [int] NULL,
	[aff_comments] [nvarchar](max) NULL,
	[amlsof_comments] [nvarchar](max) NULL,
	[rg_comments] [nvarchar](max) NULL,
	[rg_event_date] [datetime] NULL,
	[id3_last_check_date] [datetime] NULL,
	[sow_status] [int] NULL,
	[risk_alert_date] [smalldatetime] NULL,
	[aml_level] [varchar](1) NULL,
	[vip_offer_agent] [int] NULL,
	[vip_attempts] [int] NULL,
	[affordability_attempts] [int] NULL,
	[documents_attempts] [int] NULL,
	[address2] [nvarchar](256) NULL,
	[affordability_last_update] [datetime] NULL,
	[aff_income_range_avg] [money] NULL,
	[winnings_restriction] [money] NULL,
	[platform_login_in] [nvarchar](50) NULL,
	[auto_withdrawal] [bit] NULL,
	[cellphone_number_validation] [nvarchar](20) NULL,
	[Aml_score] [int] NULL,
	[Risk_category] [int] NULL,
	[Interactions_score] [int] NULL,
	[pep_status] [bit] NULL,
	[last_approved_withdrawal_dt] [datetime] NULL,
	[cant_change_deposit_limits] [bit] NULL,
	[interactions_alert_level] [int] NULL,
	[aml_category] [varchar](1) NULL,
	[citizenship_id] [int] NULL,
	[future_soft_block_date] [datetime] NULL,
	[future_soft_block_reason] [nvarchar](500) NULL,
	[aml_category_score] [int] NULL,
	[is_softblock_only_in_brand] [bit] NULL,
	[aml_category_id] [int] NULL,
	[inactivation_date] [datetime] NULL,
	[aff_income_range_id] [int] NULL,
	[fonix_kyc_passed] [bit] NULL,
	[kyc6_status] [int] NULL,
	[winnings_restriction_set] [bit] NULL,
	[has_horse_racing_bet] [bit] NULL,
	[game_limit_encountered_release_date] [datetime] NULL,
	[frictionless_check_status] [int] NULL,
	[frictionless_check_last_update] [datetime] NULL,
	[bingo_enabled] [bit] NULL,
	[live_enabled] [bit] NULL,
	[deposits_count_bingo] [int] NULL,
	[deposits_count_live] [int] NULL,
	[welcome_bonus_desc_bingo] [nvarchar](500) NULL,
	[welcome_bonus_desc_live] [nvarchar](500) NULL,
 CONSTRAINT [PK_tbl_Players] PRIMARY KEY CLUSTERED 
(
	[player_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE [common].[tbl_Players] ADD  CONSTRAINT [DF_tbl_Players_registration_date]  DEFAULT (getutcdate()) FOR [registration_date]
GO

ALTER TABLE [common].[tbl_Players] ADD  CONSTRAINT [DF_tbl_Players_risk_level_id]  DEFAULT ((236)) FOR [risk_level_id]
GO

ALTER TABLE [common].[tbl_Players] ADD  CONSTRAINT [DF_tbl_Players_bonuses_enabled]  DEFAULT ((1)) FOR [bonuses_enabled]
GO

ALTER TABLE [common].[tbl_Players] ADD  CONSTRAINT [DF__tbl_Playe__updat__3F466844]  DEFAULT (getutcdate()) FOR [updated_dt]
GO

ALTER TABLE [common].[tbl_Players] ADD  CONSTRAINT [DF__tbl_Playe__withd__29214517]  DEFAULT ((10000)) FOR [withdrawal_limit]
GO

ALTER TABLE [common].[tbl_Players] ADD  CONSTRAINT [DF__tbl_Playe__depos__2A156950]  DEFAULT ((10000)) FOR [deposit_limit]
GO

ALTER TABLE [common].[tbl_Players] ADD  CONSTRAINT [DF__tbl_Playe__uses___1BDF81BF]  DEFAULT ((1)) FOR [uses_adv_bets]
GO

ALTER TABLE [common].[tbl_Players] ADD  CONSTRAINT [DF_tbl_Players_is_push_enabled]  DEFAULT (NULL) FOR [is_push_enabled]
GO

ALTER TABLE [common].[tbl_Players] ADD  CONSTRAINT [DF_tbl_Players_pep_status]  DEFAULT ((0)) FOR [pep_status]
GO


USE [ProgressPlayDBTest]
GO

/****** Object:  Table [common].[tbl_White_labels]    Script Date: 6/13/2025 8:35:00 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [common].[tbl_White_labels](
	[label_id] [smallint] IDENTITY(1,1) NOT NULL,
	[label_name] [nvarchar](50) NOT NULL,
	[label_url_name] [varchar](50) NULL,
	[label_url] [varchar](100) NOT NULL,
	[label_support_mail] [varchar](50) NOT NULL,
	[label_support_mail_display_name] [varchar](50) NULL,
	[label_slogan] [nvarchar](1000) NOT NULL,
	[updated_dt] [smalldatetime] NOT NULL,
	[url_deposit] [varchar](200) NULL,
	[url_play] [varchar](200) NULL,
	[url_contact] [varchar](200) NULL,
	[url_bpolicy] [varchar](200) NULL,
	[url_ppolicy] [varchar](200) NULL,
	[url_twitter] [varchar](200) NULL,
	[url_facebook] [varchar](200) NULL,
	[url_images] [varchar](200) NULL,
	[url_vip] [varchar](200) NULL,
	[url_promotions] [varchar](200) NULL,
	[url_paymentmethods] [varchar](200) NULL,
	[url_subscription] [varchar](200) NULL,
	[url_multidraw] [varchar](200) NULL,
	[url_cashout] [varchar](200) NULL,
	[url_mobile] [varchar](200) NULL,
	[system_name] [varchar](50) NULL,
	[default_language] [nvarchar](50) NULL,
	[default_country] [int] NULL,
	[default_currency] [int] NULL,
	[url_terms] [varchar](200) NULL,
	[url_faq] [varchar](200) NULL,
	[url_responsible] [varchar](200) NULL,
	[lexicon_tabs_names] [nvarchar](50) NULL,
	[lexicon_registration_text] [nvarchar](500) NULL,
	[welcome_bonus_desc] [nvarchar](500) NULL,
	[restricted_countries] [nvarchar](max) NULL,
	[founded_year] [nvarchar](10) NULL,
	[url_cashoutpolicy] [nvarchar](200) NULL,
	[ga_code_web] [nvarchar](50) NULL,
	[ga_code_mobile] [nvarchar](50) NULL,
	[lp_code] [nvarchar](50) NULL,
	[url_blockcountry] [nvarchar](200) NULL,
	[swf_file] [nvarchar](50) NULL,
	[netent_enabled] [bit] NULL,
	[chat_code] [nvarchar](50) NULL,
	[sport_enabled] [bit] NOT NULL,
	[meta_keywords] [nvarchar](1000) NULL,
	[meta_description] [nvarchar](1000) NULL,
	[label_title] [nvarchar](100) NULL,
	[label_content] [nvarchar](4000) NULL,
	[promotions_enabled] [bit] NULL,
	[welcome_bonus_desc_sport] [nvarchar](500) NULL,
	[default_playmode] [int] NULL,
	[is_last_click_tracking] [bit] NULL,
	[is_active] [bit] NOT NULL,
	[integration_id] [int] NULL,
	[integration_data] [nvarchar](50) NULL,
	[sport_provider_id] [int] NULL,
	[excluded_jurisdictions] [nvarchar](50) NULL,
	[crm_code_web] [nvarchar](50) NULL,
	[allowed_countries] [nvarchar](500) NULL,
	[LandingPagesUrl] [nvarchar](2000) NULL,
	[LicenseeID] [int] NULL,
	[urban_crm] [bit] NULL,
	[no_withdrawal_fee] [bit] NULL,
	[age_verification_after_registration] [bit] NULL,
	[MerchantSiteID] [int] NULL,
	[block_uk_players] [bit] NULL,
	[is_new_site] [bit] NULL,
	[crm_events_endpoint] [nvarchar](500) NULL,
	[is_sportsbook_new_iframe] [bit] NULL,
	[account_activation_popup_timer] [int] NULL,
	[bingo_enabled] [bit] NULL,
	[live_enabled] [bit] NULL,
	[welcome_bonus_desc_bingo] [nvarchar](500) NULL,
	[welcome_bonus_desc_live] [nvarchar](500) NULL,
	[AffordabilityMonthlyEnabled] [bit] NULL,
 CONSTRAINT [PK_tbl_White_labels] PRIMARY KEY CLUSTERED 
(
	[label_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE [common].[tbl_White_labels] ADD  CONSTRAINT [DF_tbl_White_labels_label_slogan]  DEFAULT ('') FOR [label_slogan]
GO

ALTER TABLE [common].[tbl_White_labels] ADD  CONSTRAINT [DF__tbl_White__updat__4183B671]  DEFAULT (getutcdate()) FOR [updated_dt]
GO

ALTER TABLE [common].[tbl_White_labels] ADD  CONSTRAINT [DF_tbl_White_labels_is_new_site]  DEFAULT ((1)) FOR [is_new_site]
GO

ALTER TABLE [common].[tbl_White_labels] ADD  CONSTRAINT [DF_tbl_White_labels_is_sportsbook_new_iframe]  DEFAULT ((1)) FOR [is_sportsbook_new_iframe]
GO

ALTER TABLE [common].[tbl_White_labels] ADD  CONSTRAINT [DF_tbl_White_labels_AffordabilityMonthlyEnabled]  DEFAULT ((1)) FOR [AffordabilityMonthlyEnabled]
GO


USE [ProgressPlayDBTest]
GO

/****** Object:  Table [common].[tbl_Currencies]    Script Date: 6/13/2025 8:34:31 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [common].[tbl_Currencies](
	[currency_id] [tinyint] IDENTITY(1,1) NOT NULL,
	[currency_name] [varchar](30) NOT NULL,
	[currency_symbol] [nvarchar](5) NULL,
	[currency_code] [varchar](3) NOT NULL,
	[rate_in_EUR] [money] NULL,
	[updated_dt] [smalldatetime] NOT NULL,
	[sys_name] [varchar](30) NULL,
	[order_by] [tinyint] NULL,
	[rate_in_USD] [money] NULL,
	[rate_in_GBP] [money] NULL,
	[multiplier] [int] NULL,
	[for_language_id] [int] NULL,
	[for_languages] [nvarchar](50) NULL,
	[is_universal] [bit] NULL,
	[iso_code] [nvarchar](10) NULL,
 CONSTRAINT [Currencies_PK] PRIMARY KEY CLUSTERED 
(
	[currency_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [unique_currency_name] UNIQUE NONCLUSTERED 
(
	[currency_name] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [common].[tbl_Currencies] ADD  CONSTRAINT [DF__TBL_Curre__updat__59C55456]  DEFAULT (getutcdate()) FOR [updated_dt]
GO


USE [ProgressPlayDBTest]
GO

/****** Object:  Table [common].[tbl_Countries]    Script Date: 6/13/2025 8:34:25 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [common].[tbl_Countries](
	[country_id] [int] NOT NULL,
	[country_name] [varchar](50) NOT NULL,
	[default_language_id] [int] NOT NULL,
	[default_currency_id] [tinyint] NOT NULL,
	[country_intl_code] [varchar](2) NULL,
	[updated_dt] [smalldatetime] NOT NULL,
	[is_active] [bit] NOT NULL,
	[phone_code] [nvarchar](50) NULL,
	[iso_code] [varchar](3) NULL,
	[jurisdiction_code] [nvarchar](10) NULL,
	[jurisdiction_id] [int] NOT NULL,
	[cc_processor_group_id] [smallint] NULL,
	[locales_group_id] [int] NOT NULL,
	[culture] [varchar](10) NULL,
	[is_high_risk] [bit] NULL,
 CONSTRAINT [country_PK] PRIMARY KEY CLUSTERED 
(
	[country_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [common].[tbl_Countries] ADD  CONSTRAINT [DF__tbl_Count__updat__70FDBF69]  DEFAULT (getutcdate()) FOR [updated_dt]
GO

ALTER TABLE [common].[tbl_Countries]  WITH CHECK ADD  CONSTRAINT [Currencies_tbl_Countries_FK1] FOREIGN KEY([default_currency_id])
REFERENCES [common].[tbl_Currencies] ([currency_id])
GO

ALTER TABLE [common].[tbl_Countries] CHECK CONSTRAINT [Currencies_tbl_Countries_FK1]
GO

ALTER TABLE [common].[tbl_Countries]  WITH CHECK ADD  CONSTRAINT [Luts_tbl_Countries_FK1] FOREIGN KEY([default_language_id])
REFERENCES [common].[tbl_Luts] ([lut_id])
GO

ALTER TABLE [common].[tbl_Countries] CHECK CONSTRAINT [Luts_tbl_Countries_FK1]
GO


USE [ProgressPlayDBTest]
GO

/****** Object:  Table [accounts].[tbl_Account_info]    Script Date: 6/13/2025 8:34:14 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [accounts].[tbl_Account_info](
	[account_info_id] [bigint] IDENTITY(1,1) NOT NULL,
	[player_id] [bigint] NOT NULL,
	[account_balance] [money] NOT NULL,
	[bonus_balance] [money] NOT NULL,
	[customer_club_points] [decimal](10, 2) NOT NULL,
	[total_deposits] [money] NOT NULL,
	[total_chargebacks] [money] NOT NULL,
	[total_chargeback_reverses] [money] NOT NULL,
	[total_voids] [money] NOT NULL,
	[total_returns] [money] NOT NULL,
	[total_return_reverses] [money] NOT NULL,
	[total_bonuses] [money] NOT NULL,
	[total_customer_club_points] [decimal](10, 2) NOT NULL,
	[total_withdrawals] [money] NOT NULL,
	[max_balance] [money] NOT NULL,
	[net_gaming_lotto] [money] NOT NULL,
	[net_gaming_advanced] [money] NOT NULL,
	[net_gaming_sidegames] [money] NOT NULL,
	[net_gaming_total] [money] NOT NULL,
	[updated_dt] [datetime] NOT NULL,
	[rank_id] [smallint] NULL,
	[ranking] [smallint] NULL,
	[wager_reset_dt] [datetime] NULL,
	[wagered] [money] NULL,
	[ftd_amount] [money] NULL,
	[ftd_settlement_company_id] [int] NULL,
	[CashableBalance] [money] NULL,
	[LimitedBalance] [money] NULL,
	[WagerLeft] [money] NULL,
	[total_bonus_released] [money] NULL,
	[bonus_balance_sport] [money] NULL,
	[total_bonuses_sport] [money] NULL,
	[total_bets] [money] NULL,
	[total_bets_sport] [money] NULL,
	[last_bet_source] [int] NULL,
	[bet_source_changed_to] [int] NULL,
	[total_wins] [money] NULL,
	[total_wins_sport] [money] NULL,
	[affordability_balance] [money] NULL,
	[affordability_treshold] [money] NULL,
	[revenue_euro] [money] NULL,
	[total_bets_bingo] [money] NULL,
	[total_wins_bingo] [money] NULL,
	[total_bonuses_bingo] [money] NULL,
	[total_bets_live] [money] NULL,
	[total_wins_live] [money] NULL,
	[total_bonuses_live] [money] NULL,
 CONSTRAINT [PK_tbl_Player_account_info] PRIMARY KEY CLUSTERED 
(
	[player_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [accounts].[tbl_Account_info] ADD  CONSTRAINT [DF__tbl_Playe__updat__0C1BC9F9]  DEFAULT (getutcdate()) FOR [updated_dt]
GO


