USE [ProgressPlayDBTest]
GO

/****** Object:  Table [Games].[Games]    Script Date: 6/13/2025 8:35:11 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [Games].[Games](
	[GameID] [int] IDENTITY(1,1) NOT NULL,
	[ProviderID] [int] NOT NULL,
	[SubProviderID] [int] NULL,
	[ServerGameID] [varchar](50) NOT NULL,
	[ServerGameIDChecksum] [varbinary](50) NULL,
	[ProviderTitle] [varchar](100) NOT NULL,
	[GameName] [varchar](50) NOT NULL,
	[GameTypeID] [int] NULL,
	[GameOrder] [int] NOT NULL,
	[IsActive] [bit] NOT NULL,
	[DemoEnabled] [bit] NOT NULL,
	[WagerPercent] [float] NOT NULL,
	[CreatedDate] [datetime] NOT NULL,
	[ReleaseDate] [datetime] NULL,
	[UpdatedDate] [datetime] NOT NULL,
	[PayoutLow] [float] NOT NULL,
	[PayoutHigh] [float] NOT NULL,
	[VolatilityID] [int] NOT NULL,
	[ThemeID] [int] NULL,
	[UKCompliant] [bit] NOT NULL,
	[IsMobile] [bit] NOT NULL,
	[IsDesktop] [bit] NOT NULL,
	[JackpotContribution] [float] NULL,
	[MobileServerGameID] [varchar](50) NULL,
	[MobileServerGameIDChecksum] [varbinary](50) NULL,
	[IsDesktopFlash] [bit] NOT NULL,
	[MobileProviderTitle] [varchar](100) NULL,
	[ProviderAdditionalInfo] [varchar](50) NULL,
	[Notes] [varchar](1000) NULL,
	[BonusBetDisabled] [bit] NULL,
	[HideInLobby] [bit] NULL,
	[OpenDesktopAsMobile] [bit] NULL,
	[ExcludedTrackers] [nvarchar](1000) NULL,
	[ShowJackpotCounter] [bit] NULL,
	[IsLargeImage] [bit] NULL,
	[LargeImageGameTypeID] [int] NULL,
	[MinBetAmount] [money] NULL,
 CONSTRAINT [PK_Games_1] PRIMARY KEY CLUSTERED 
(
	[GameID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [Games].[Games] ADD  CONSTRAINT [DF_Games_IsDesktopFlash]  DEFAULT ((0)) FOR [IsDesktopFlash]
GO


USE [ProgressPlayDBTest]
GO

/****** Object:  Table [Games].[Games_GameTypes]    Script Date: 6/13/2025 8:35:20 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [Games].[Games_GameTypes](
	[ID] [bigint] IDENTITY(1,1) NOT NULL,
	[Name] [nvarchar](50) NOT NULL,
	[Key] [nvarchar](50) NOT NULL,
	[Order] [int] NOT NULL,
	[Status] [int] NOT NULL,
	[ParentID] [int] NULL,
	[Details] [nvarchar](50) NULL,
	[UpdatedDate] [datetime] NOT NULL,
 CONSTRAINT [PK_Games_GameTypes] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO


USE [ProgressPlayDBTest]
GO

/****** Object:  Table [Games].[Games_PlayedGames]    Script Date: 6/13/2025 8:35:31 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [Games].[Games_PlayedGames](
	[ID] [bigint] NOT NULL,
	[GameID] [bigint] NOT NULL,
	[PlayerID] [bigint] NOT NULL,
	[TotalBet] [money] NOT NULL,
	[TotalBetRealMoney] [money] NOT NULL,
	[TotalBetBonus] [money] NOT NULL,
	[TotalWin] [money] NOT NULL,
	[TotalWinRealMoney] [money] NOT NULL,
	[TotalWinBonus] [money] NOT NULL,
	[GameStatus] [int] NOT NULL,
	[CurrencyID] [int] NOT NULL,
	[CreationDate] [datetime] NOT NULL,
	[UpdatedDate] [datetime] NOT NULL,
	[PlayerFreeGameID] [bigint] NULL,
	[RealMoneyBalance] [money] NOT NULL,
	[BonusBalance] [money] NOT NULL,
	[RoundID] [bigint] NOT NULL,
	[ArchivedDate] [datetime] NOT NULL,
	[ProviderRoundID] [nvarchar](100) NULL,
 CONSTRAINT [PK_tblPlayedGame] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO


USE [ProgressPlayDBTest]
GO

/****** Object:  Table [Games].[Games_Providers]    Script Date: 6/13/2025 8:35:46 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [Games].[Games_Providers](
	[ID] [bigint] NOT NULL,
	[Name] [nvarchar](50) NOT NULL,
	[Key] [nvarchar](50) NOT NULL,
	[Order] [int] NOT NULL,
	[Status] [int] NOT NULL,
	[ParentID] [int] NULL,
	[Details] [nvarchar](50) NULL,
	[UpdatedDate] [datetime] NOT NULL,
	[Assembly] [varchar](250) NULL,
 CONSTRAINT [PK_Games_Providers] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
USE [ProgressPlayDBTest]
GO

/****** Object:  Table [Games].[Games_SubProviders]    Script Date: 6/13/2025 8:35:52 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [Games].[Games_SubProviders](
	[ID] [bigint] IDENTITY(1,1) NOT NULL,
	[Name] [nvarchar](50) NOT NULL,
	[Key] [nvarchar](50) NOT NULL,
	[Order] [int] NOT NULL,
	[Status] [int] NOT NULL,
	[ParentID] [int] NULL,
	[Details] [nvarchar](50) NULL,
	[UpdatedDate] [datetime] NOT NULL,
 CONSTRAINT [PK_Games_SubProviders] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

USE [ProgressPlayDBTest]
GO

/****** Object:  Table [accounts].[tbl_Account_transactions]    Script Date: 6/13/2025 8:40:43 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [accounts].[tbl_Account_transactions](
	[transaction_id] [bigint] IDENTITY(1,1) NOT NULL,
	[player_id] [bigint] NOT NULL,
	[is_added_funds] [bit] NOT NULL,
	[transaction_type_id] [int] NOT NULL,
	[account_payment_method_id] [bigint] NULL,
	[amount] [money] NOT NULL,
	[currency_id] [tinyint] NOT NULL,
	[back_office_user_id] [int] NULL,
	[comments] [nvarchar](max) NULL,
	[internal_reference] [bigint] NULL,
	[is_done] [bit] NOT NULL,
	[creation_dt] [datetime] NOT NULL,
	[updated_dt] [datetime] NOT NULL,
	[bet_id] [bigint] NULL,
	[subscription_id] [bigint] NULL,
	[draw_id] [bigint] NULL,
	[SideGamesPlayedGameID] [bigint] NULL,
	[parity_amount] [money] NOT NULL,
	[range_amount] [money] NOT NULL,
	[adjustment_amount] [money] NULL,
	[balance] [money] NULL,
	[ongoing_id] [bigint] NULL,
	[bonus_balance] [money] NULL,
	[verification_code] [nvarchar](10) NULL,
	[verification_expiry] [datetime] NULL,
 CONSTRAINT [PK_tbl_Account_transactions] PRIMARY KEY CLUSTERED 
(
	[transaction_id] DESC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE [accounts].[tbl_Account_transactions] ADD  CONSTRAINT [DF_tbl_Account_transactions_is_done]  DEFAULT ((1)) FOR [is_done]
GO

ALTER TABLE [accounts].[tbl_Account_transactions] ADD  CONSTRAINT [DF_tbl_Account_transactions_creation_dt]  DEFAULT (getutcdate()) FOR [creation_dt]
GO

ALTER TABLE [accounts].[tbl_Account_transactions] ADD  CONSTRAINT [DF_tbl_Account_transactions_updated_dt]  DEFAULT (getutcdate()) FOR [updated_dt]
GO

ALTER TABLE [accounts].[tbl_Account_transactions] ADD  CONSTRAINT [DF__tbl_Accou__parit__6F54ED3C]  DEFAULT ((0)) FOR [parity_amount]
GO

ALTER TABLE [accounts].[tbl_Account_transactions] ADD  CONSTRAINT [DF__tbl_Accou__range__70491175]  DEFAULT ((0)) FOR [range_amount]
GO

ALTER TABLE [accounts].[tbl_Account_transactions]  WITH CHECK ADD  CONSTRAINT [FK_tbl_Account_transactions_tbl_Account_payment_methods] FOREIGN KEY([account_payment_method_id])
REFERENCES [accounts].[tbl_Account_payment_methods] ([account_payment_method_id])
GO

ALTER TABLE [accounts].[tbl_Account_transactions] CHECK CONSTRAINT [FK_tbl_Account_transactions_tbl_Account_payment_methods]
GO

ALTER TABLE [accounts].[tbl_Account_transactions]  WITH CHECK ADD  CONSTRAINT [FK_tbl_Account_transactions_tbl_Back_office_users] FOREIGN KEY([back_office_user_id])
REFERENCES [common].[tbl_Back_office_users] ([user_id])
GO

ALTER TABLE [accounts].[tbl_Account_transactions] CHECK CONSTRAINT [FK_tbl_Account_transactions_tbl_Back_office_users]
GO

ALTER TABLE [accounts].[tbl_Account_transactions]  WITH CHECK ADD  CONSTRAINT [FK_tbl_Account_transactions_tbl_Currencies] FOREIGN KEY([currency_id])
REFERENCES [common].[tbl_Currencies] ([currency_id])
GO

ALTER TABLE [accounts].[tbl_Account_transactions] CHECK CONSTRAINT [FK_tbl_Account_transactions_tbl_Currencies]
GO

ALTER TABLE [accounts].[tbl_Account_transactions]  WITH CHECK ADD  CONSTRAINT [FK_tbl_Account_transactions_tbl_Luts] FOREIGN KEY([transaction_type_id])
REFERENCES [common].[tbl_Luts] ([lut_id])
GO

ALTER TABLE [accounts].[tbl_Account_transactions] CHECK CONSTRAINT [FK_tbl_Account_transactions_tbl_Luts]
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'References gaming.tbl_Draw_player_bets if bet or prize' , @level0type=N'SCHEMA',@level0name=N'accounts', @level1type=N'TABLE',@level1name=N'tbl_Account_transactions', @level2type=N'COLUMN',@level2name=N'internal_reference'
GO





