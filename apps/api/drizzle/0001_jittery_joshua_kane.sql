CREATE TYPE "public"."monitored_service_operational_state" AS ENUM('unknown', 'operational', 'degraded', 'unavailable');--> statement-breakpoint
CREATE TABLE "monitored_services" (
	"id" uuid PRIMARY KEY NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"operational_state" "monitored_service_operational_state" DEFAULT 'unknown' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "monitored_services" ADD CONSTRAINT "monitored_services_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "monitored_services_organization_idx" ON "monitored_services" USING btree ("organization_id");