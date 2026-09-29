import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_resources_kind" AS ENUM('person', 'place');
  CREATE TABLE "resources" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"kind" "enum_resources_kind" DEFAULT 'person' NOT NULL,
  	"name" varchar NOT NULL,
  	"photo_id" integer,
  	"active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "resources_locales" (
  	"role" varchar,
  	"bio" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "resources_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"services_id" integer
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "resources_id" integer;
  ALTER TABLE "resources" ADD CONSTRAINT "resources_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "resources_locales" ADD CONSTRAINT "resources_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "resources_rels" ADD CONSTRAINT "resources_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "resources_rels" ADD CONSTRAINT "resources_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "resources_photo_idx" ON "resources" USING btree ("photo_id");
  CREATE INDEX "resources_updated_at_idx" ON "resources" USING btree ("updated_at");
  CREATE INDEX "resources_created_at_idx" ON "resources" USING btree ("created_at");
  CREATE UNIQUE INDEX "resources_locales_locale_parent_id_unique" ON "resources_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "resources_rels_order_idx" ON "resources_rels" USING btree ("order");
  CREATE INDEX "resources_rels_parent_idx" ON "resources_rels" USING btree ("parent_id");
  CREATE INDEX "resources_rels_path_idx" ON "resources_rels" USING btree ("path");
  CREATE INDEX "resources_rels_services_id_idx" ON "resources_rels" USING btree ("services_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_resources_fk" FOREIGN KEY ("resources_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_resources_id_idx" ON "payload_locked_documents_rels" USING btree ("resources_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "resources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "resources_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "resources_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "resources" CASCADE;
  DROP TABLE "resources_locales" CASCADE;
  DROP TABLE "resources_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_resources_fk";
  
  DROP INDEX "payload_locked_documents_rels_resources_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "resources_id";
  DROP TYPE "public"."enum_resources_kind";`)
}
