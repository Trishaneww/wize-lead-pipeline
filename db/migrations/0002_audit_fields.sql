ALTER TABLE "audits" ADD COLUMN "reachable" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "audits" ADD COLUMN "signals" jsonb;--> statement-breakpoint
ALTER TABLE "audits" ADD COLUMN "site_summary" text;--> statement-breakpoint
ALTER TABLE "audits" ADD COLUMN "visible_text" text;--> statement-breakpoint
ALTER TABLE "audits" ADD COLUMN "screenshot_base64" text;