CREATE TABLE "yjs_updates" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"doc_name" text NOT NULL,
	"update" "bytea" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "yjs_updates_doc_name_id_idx" ON "yjs_updates" USING btree ("doc_name","id");