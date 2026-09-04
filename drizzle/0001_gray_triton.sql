ALTER TABLE "workflows" ALTER COLUMN "created_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "workflows" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "workflows" ALTER COLUMN "updated_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "workflows" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "workflows" ADD COLUMN "org_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "workflows" ADD COLUMN "graph" jsonb;--> statement-breakpoint
ALTER TABLE "workflows" DROP COLUMN "organization_id";