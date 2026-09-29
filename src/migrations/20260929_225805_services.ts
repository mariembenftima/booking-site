import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_business_hours_weekly_hours_weekday" AS ENUM('1', '2', '3', '4', '5', '6', '7');
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"business_name" varchar NOT NULL,
  	"owner_name" varchar,
  	"phone" varchar,
  	"email" varchar,
  	"address" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "site_settings_locales" (
  	"tagline" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "business_hours_weekly_hours" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"weekday" "enum_business_hours_weekly_hours_weekday" NOT NULL,
  	"opens" varchar NOT NULL,
  	"closes" varchar NOT NULL
  );
  
  CREATE TABLE "business_hours_closed_dates" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"date" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "business_hours_closed_dates_locales" (
  	"reason" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "business_hours" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slot_interval_minutes" numeric DEFAULT 30 NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "site_settings_locales" ADD CONSTRAINT "site_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "business_hours_weekly_hours" ADD CONSTRAINT "business_hours_weekly_hours_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."business_hours"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "business_hours_closed_dates" ADD CONSTRAINT "business_hours_closed_dates_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."business_hours"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "business_hours_closed_dates_locales" ADD CONSTRAINT "business_hours_closed_dates_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."business_hours_closed_dates"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "site_settings_locales_locale_parent_id_unique" ON "site_settings_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "business_hours_weekly_hours_order_idx" ON "business_hours_weekly_hours" USING btree ("_order");
  CREATE INDEX "business_hours_weekly_hours_parent_id_idx" ON "business_hours_weekly_hours" USING btree ("_parent_id");
  CREATE INDEX "business_hours_closed_dates_order_idx" ON "business_hours_closed_dates" USING btree ("_order");
  CREATE INDEX "business_hours_closed_dates_parent_id_idx" ON "business_hours_closed_dates" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "business_hours_closed_dates_locales_locale_parent_id_unique" ON "business_hours_closed_dates_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "site_settings" CASCADE;
  DROP TABLE "site_settings_locales" CASCADE;
  DROP TABLE "business_hours_weekly_hours" CASCADE;
  DROP TABLE "business_hours_closed_dates" CASCADE;
  DROP TABLE "business_hours_closed_dates_locales" CASCADE;
  DROP TABLE "business_hours" CASCADE;
  DROP TYPE "public"."enum_business_hours_weekly_hours_weekday";`)
}
