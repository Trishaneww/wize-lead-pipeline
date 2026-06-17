CREATE TYPE "public"."lead_channel" AS ENUM('web_design', 'custom_software');--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "channel" "lead_channel" DEFAULT 'web_design' NOT NULL;