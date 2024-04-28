-- CreateTable
CREATE TABLE "access_connection" (
    "chat_id" VARCHAR(14) NOT NULL,
    "allow_connect_to_chat" BOOLEAN,

    CONSTRAINT "access_connection_pkey" PRIMARY KEY ("chat_id")
);

-- CreateTable
CREATE TABLE "afk_users" (
    "user_id" BIGSERIAL NOT NULL,
    "is_afk" BOOLEAN,
    "reason" TEXT,
    "time" TIMESTAMP(6),

    CONSTRAINT "afk_users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "antiflood" (
    "chat_id" VARCHAR(14) NOT NULL,
    "user_id" BIGINT,
    "count" INTEGER,
    "limit" INTEGER,

    CONSTRAINT "antiflood_pkey" PRIMARY KEY ("chat_id")
);

-- CreateTable
CREATE TABLE "antiflood_settings" (
    "chat_id" VARCHAR(14) NOT NULL,
    "flood_type" INTEGER,
    "value" TEXT,

    CONSTRAINT "antiflood_settings_pkey" PRIMARY KEY ("chat_id")
);

-- CreateTable
CREATE TABLE "approval" (
    "chat_id" VARCHAR(14) NOT NULL,
    "user_id" BIGINT NOT NULL,

    CONSTRAINT "approval_pkey" PRIMARY KEY ("chat_id","user_id")
);

-- CreateTable
CREATE TABLE "bans_feds" (
    "fed_id" TEXT NOT NULL,
    "user_id" VARCHAR(14) NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT,
    "user_name" TEXT,
    "reason" TEXT,
    "time" INTEGER,

    CONSTRAINT "bans_feds_pkey" PRIMARY KEY ("fed_id","user_id")
);

-- CreateTable
CREATE TABLE "blacklist" (
    "chat_id" VARCHAR(14) NOT NULL,
    "trigger" TEXT NOT NULL,

    CONSTRAINT "blacklist_pkey" PRIMARY KEY ("chat_id","trigger")
);

-- CreateTable
CREATE TABLE "blacklist_settings" (
    "chat_id" VARCHAR(14) NOT NULL,
    "blacklist_type" INTEGER,
    "value" TEXT,

    CONSTRAINT "blacklist_settings_pkey" PRIMARY KEY ("chat_id")
);

-- CreateTable
CREATE TABLE "blacklist_stickers" (
    "chat_id" VARCHAR(14) NOT NULL,
    "trigger" TEXT NOT NULL,

    CONSTRAINT "blacklist_stickers_pkey" PRIMARY KEY ("chat_id","trigger")
);

-- CreateTable
CREATE TABLE "blsticker_settings" (
    "chat_id" VARCHAR(14) NOT NULL,
    "blacklist_type" INTEGER,
    "value" TEXT,

    CONSTRAINT "blsticker_settings_pkey" PRIMARY KEY ("chat_id")
);

-- CreateTable
CREATE TABLE "chat_feds" (
    "chat_id" VARCHAR(14) NOT NULL,
    "chat_name" TEXT,
    "fed_id" TEXT,

    CONSTRAINT "chat_feds_pkey" PRIMARY KEY ("chat_id")
);

-- CreateTable
CREATE TABLE "chat_members" (
    "priv_chat_id" SERIAL NOT NULL,
    "chat" VARCHAR(14) NOT NULL,
    "user" BIGINT NOT NULL,

    CONSTRAINT "chat_members_pkey" PRIMARY KEY ("priv_chat_id")
);

-- CreateTable
CREATE TABLE "chats" (
    "chat_id" VARCHAR(14) NOT NULL,
    "chat_name" TEXT NOT NULL,

    CONSTRAINT "chats_pkey" PRIMARY KEY ("chat_id")
);

-- CreateTable
CREATE TABLE "clean_service" (
    "chat_id" VARCHAR(14) NOT NULL,
    "clean_service" BOOLEAN,

    CONSTRAINT "clean_service_pkey" PRIMARY KEY ("chat_id")
);

-- CreateTable
CREATE TABLE "connection" (
    "user_id" BIGSERIAL NOT NULL,
    "chat_id" VARCHAR(14),

    CONSTRAINT "connection_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "connection_history" (
    "user_id" BIGINT NOT NULL,
    "chat_id" VARCHAR(14) NOT NULL,
    "chat_name" TEXT,
    "conn_time" BIGINT,

    CONSTRAINT "connection_history_pkey" PRIMARY KEY ("user_id","chat_id")
);

-- CreateTable
CREATE TABLE "cust_filter_urls" (
    "id" SERIAL NOT NULL,
    "chat_id" VARCHAR(14) NOT NULL,
    "keyword" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "same_line" BOOLEAN,

    CONSTRAINT "cust_filter_urls_pkey" PRIMARY KEY ("id","chat_id","keyword")
);

-- CreateTable
CREATE TABLE "cust_filters" (
    "chat_id" VARCHAR(14) NOT NULL,
    "keyword" TEXT NOT NULL,
    "reply" TEXT NOT NULL,
    "reply_text" TEXT,
    "file_type" INTEGER NOT NULL,
    "file_id" TEXT,
    "has_buttons" BOOLEAN NOT NULL,
    "has_media_spoiler" BOOLEAN NOT NULL,

    CONSTRAINT "cust_filters_pkey" PRIMARY KEY ("chat_id","keyword")
);

-- CreateTable
CREATE TABLE "disabled_commands" (
    "chat_id" VARCHAR(14) NOT NULL,
    "command" TEXT NOT NULL,

    CONSTRAINT "disabled_commands_pkey" PRIMARY KEY ("chat_id","command")
);

-- CreateTable
CREATE TABLE "feds" (
    "owner_id" VARCHAR(14),
    "fed_name" TEXT,
    "fed_id" TEXT NOT NULL,
    "fed_rules" TEXT,
    "fed_log" TEXT,
    "fed_users" TEXT,

    CONSTRAINT "feds_pkey" PRIMARY KEY ("fed_id")
);

-- CreateTable
CREATE TABLE "feds_settings" (
    "user_id" BIGSERIAL NOT NULL,
    "should_report" BOOLEAN,

    CONSTRAINT "feds_settings_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "feds_subs" (
    "fed_id" TEXT NOT NULL,
    "fed_subs" TEXT NOT NULL,

    CONSTRAINT "feds_subs_pkey" PRIMARY KEY ("fed_id","fed_subs")
);

-- CreateTable
CREATE TABLE "gban_settings" (
    "chat_id" VARCHAR(14) NOT NULL,
    "setting" BOOLEAN NOT NULL,

    CONSTRAINT "gban_settings_pkey" PRIMARY KEY ("chat_id")
);

-- CreateTable
CREATE TABLE "gbans" (
    "user_id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "reason" TEXT,

    CONSTRAINT "gbans_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "human_checks" (
    "user_id" BIGINT NOT NULL,
    "chat_id" VARCHAR(14) NOT NULL,
    "human_check" BOOLEAN,

    CONSTRAINT "human_checks_pkey" PRIMARY KEY ("user_id","chat_id")
);

-- CreateTable
CREATE TABLE "kuki_chats" (
    "chat_id" VARCHAR(14) NOT NULL,

    CONSTRAINT "kuki_chats_pkey" PRIMARY KEY ("chat_id")
);

-- CreateTable
CREATE TABLE "leave_urls" (
    "id" SERIAL NOT NULL,
    "chat_id" VARCHAR(14) NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "same_line" BOOLEAN,

    CONSTRAINT "leave_urls_pkey" PRIMARY KEY ("id","chat_id")
);

-- CreateTable
CREATE TABLE "log_channel_setting" (
    "chat_id" BIGSERIAL NOT NULL,
    "log_joins" BOOLEAN,
    "log_leave" BOOLEAN,
    "log_warn" BOOLEAN,
    "log_action" BOOLEAN,
    "log_report" BOOLEAN,

    CONSTRAINT "log_channel_setting_pkey" PRIMARY KEY ("chat_id")
);

-- CreateTable
CREATE TABLE "log_channels" (
    "chat_id" VARCHAR(14) NOT NULL,
    "log_channel" VARCHAR(14) NOT NULL,

    CONSTRAINT "log_channels_pkey" PRIMARY KEY ("chat_id")
);

-- CreateTable
CREATE TABLE "note_urls" (
    "id" SERIAL NOT NULL,
    "chat_id" VARCHAR(14) NOT NULL,
    "note_name" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "same_line" BOOLEAN,

    CONSTRAINT "note_urls_pkey" PRIMARY KEY ("id","chat_id","note_name")
);

-- CreateTable
CREATE TABLE "notes" (
    "chat_id" VARCHAR(14) NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "file" TEXT,
    "is_reply" BOOLEAN,
    "has_buttons" BOOLEAN,
    "msgtype" INTEGER,

    CONSTRAINT "notes_pkey" PRIMARY KEY ("chat_id","name")
);

-- CreateTable
CREATE TABLE "rules" (
    "chat_id" VARCHAR(14) NOT NULL,
    "rules" TEXT,

    CONSTRAINT "rules_pkey" PRIMARY KEY ("chat_id")
);

-- CreateTable
CREATE TABLE "users" (
    "user_id" BIGSERIAL NOT NULL,
    "username" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "warn_filters" (
    "chat_id" VARCHAR(14) NOT NULL,
    "keyword" TEXT NOT NULL,
    "reply" TEXT NOT NULL,

    CONSTRAINT "warn_filters_pkey" PRIMARY KEY ("chat_id","keyword")
);

-- CreateTable
CREATE TABLE "warn_settings" (
    "chat_id" VARCHAR(14) NOT NULL,
    "warn_limit" INTEGER,
    "soft_warn" BOOLEAN,

    CONSTRAINT "warn_settings_pkey" PRIMARY KEY ("chat_id")
);

-- CreateTable
CREATE TABLE "warns" (
    "user_id" BIGINT NOT NULL,
    "chat_id" VARCHAR(14) NOT NULL,
    "num_warns" INTEGER,
    "reasons" TEXT[],

    CONSTRAINT "warns_pkey" PRIMARY KEY ("user_id","chat_id")
);

-- CreateTable
CREATE TABLE "welcome_mutes" (
    "chat_id" VARCHAR(14) NOT NULL,
    "welcomemutes" TEXT,

    CONSTRAINT "welcome_mutes_pkey" PRIMARY KEY ("chat_id")
);

-- CreateTable
CREATE TABLE "welcome_pref" (
    "chat_id" VARCHAR(14) NOT NULL,
    "should_welcome" BOOLEAN,
    "should_goodbye" BOOLEAN,
    "custom_content" TEXT,
    "custom_welcome" TEXT,
    "welcome_type" INTEGER,
    "custom_leave" TEXT,
    "leave_type" INTEGER,
    "clean_welcome" BIGINT,

    CONSTRAINT "welcome_pref_pkey" PRIMARY KEY ("chat_id")
);

-- CreateTable
CREATE TABLE "welcome_urls" (
    "id" SERIAL NOT NULL,
    "chat_id" VARCHAR(14) NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "same_line" BOOLEAN,

    CONSTRAINT "welcome_urls_pkey" PRIMARY KEY ("id","chat_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "_chat_members_uc" ON "chat_members"("chat", "user");
