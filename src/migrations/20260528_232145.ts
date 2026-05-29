import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`brands\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`slug\` text NOT NULL,
  	\`description\` text,
  	\`logo_id\` integer,
  	\`bootloader_unlock_difficulty\` text,
  	\`bootloader_unlock_notes\` text,
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`brands_slug_idx\` ON \`brands\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`brands_logo_idx\` ON \`brands\` (\`logo_id\`);`)
  await db.run(sql`CREATE INDEX \`brands_updated_at_idx\` ON \`brands\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`brands_created_at_idx\` ON \`brands\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`guides_steps\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`content\` text NOT NULL,
  	\`warning\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`guides\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`guides_steps_order_idx\` ON \`guides_steps\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`guides_steps_parent_id_idx\` ON \`guides_steps\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`guides_faq\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`question\` text NOT NULL,
  	\`answer\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`guides\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`guides_faq_order_idx\` ON \`guides_faq\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`guides_faq_parent_id_idx\` ON \`guides_faq\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`guides_download_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`url\` text NOT NULL,
  	\`version\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`guides\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`guides_download_links_order_idx\` ON \`guides_download_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`guides_download_links_parent_id_idx\` ON \`guides_download_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`guides_target_keywords\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`keyword\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`guides\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`guides_target_keywords_order_idx\` ON \`guides_target_keywords\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`guides_target_keywords_parent_id_idx\` ON \`guides_target_keywords\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`guides\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`slug\` text NOT NULL,
  	\`category\` text,
  	\`hero_image_id\` integer,
  	\`excerpt\` text NOT NULL,
  	\`content\` text NOT NULL,
  	\`compatibility_note\` text,
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`guides_slug_idx\` ON \`guides\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`guides_hero_image_idx\` ON \`guides\` (\`hero_image_id\`);`)
  await db.run(sql`CREATE INDEX \`guides_updated_at_idx\` ON \`guides\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`guides_created_at_idx\` ON \`guides\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`guides_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`guides_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`guides\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`guides_id\`) REFERENCES \`guides\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`guides_rels_order_idx\` ON \`guides_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`guides_rels_parent_idx\` ON \`guides_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`guides_rels_path_idx\` ON \`guides_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`guides_rels_guides_id_idx\` ON \`guides_rels\` (\`guides_id\`);`)
  await db.run(sql`CREATE TABLE \`devices_prerequisites\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`devices\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`devices_prerequisites_order_idx\` ON \`devices_prerequisites\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`devices_prerequisites_parent_id_idx\` ON \`devices_prerequisites\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`devices_steps\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`content\` text NOT NULL,
  	\`warning\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`devices\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`devices_steps_order_idx\` ON \`devices_steps\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`devices_steps_parent_id_idx\` ON \`devices_steps\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`devices_warnings\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text NOT NULL,
  	\`severity\` text DEFAULT 'warning',
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`devices\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`devices_warnings_order_idx\` ON \`devices_warnings\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`devices_warnings_parent_id_idx\` ON \`devices_warnings\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`devices_faq\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`question\` text NOT NULL,
  	\`answer\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`devices\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`devices_faq_order_idx\` ON \`devices_faq\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`devices_faq_parent_id_idx\` ON \`devices_faq\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`devices_target_keywords\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`keyword\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`devices\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`devices_target_keywords_order_idx\` ON \`devices_target_keywords\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`devices_target_keywords_parent_id_idx\` ON \`devices_target_keywords\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`devices\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`slug\` text NOT NULL,
  	\`brand_id\` integer NOT NULL,
  	\`model_number\` text,
  	\`image_id\` integer,
  	\`android_version\` text,
  	\`chipset\` text,
  	\`release_year\` numeric,
  	\`status\` text DEFAULT 'unknown',
  	\`bootloader_unlockable\` text DEFAULT 'unknown',
  	\`root_method\` text,
  	\`twrp_available\` integer DEFAULT false,
  	\`custom_rom_support\` integer DEFAULT false,
  	\`difficulty\` text,
  	\`intro_override\` text,
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`brand_id\`) REFERENCES \`brands\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`devices_slug_idx\` ON \`devices\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`devices_brand_idx\` ON \`devices\` (\`brand_id\`);`)
  await db.run(sql`CREATE INDEX \`devices_image_idx\` ON \`devices\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`devices_updated_at_idx\` ON \`devices\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`devices_created_at_idx\` ON \`devices\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`devices_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`guides_id\` integer,
  	\`devices_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`devices\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`guides_id\`) REFERENCES \`guides\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`devices_id\`) REFERENCES \`devices\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`devices_rels_order_idx\` ON \`devices_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`devices_rels_parent_idx\` ON \`devices_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`devices_rels_path_idx\` ON \`devices_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`devices_rels_guides_id_idx\` ON \`devices_rels\` (\`guides_id\`);`)
  await db.run(sql`CREATE INDEX \`devices_rels_devices_id_idx\` ON \`devices_rels\` (\`devices_id\`);`)
  await db.run(sql`CREATE TABLE \`learn_faq\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`question\` text NOT NULL,
  	\`answer\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`learn\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`learn_faq_order_idx\` ON \`learn_faq\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`learn_faq_parent_id_idx\` ON \`learn_faq\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`learn_target_keywords\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`keyword\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`learn\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`learn_target_keywords_order_idx\` ON \`learn_target_keywords\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`learn_target_keywords_parent_id_idx\` ON \`learn_target_keywords\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`learn\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`slug\` text NOT NULL,
  	\`excerpt\` text NOT NULL,
  	\`hero_image_id\` integer,
  	\`content\` text NOT NULL,
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`learn_slug_idx\` ON \`learn\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`learn_hero_image_idx\` ON \`learn\` (\`hero_image_id\`);`)
  await db.run(sql`CREATE INDEX \`learn_updated_at_idx\` ON \`learn\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`learn_created_at_idx\` ON \`learn\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`learn_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`guides_id\` integer,
  	\`learn_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`learn\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`guides_id\`) REFERENCES \`guides\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`learn_id\`) REFERENCES \`learn\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`learn_rels_order_idx\` ON \`learn_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`learn_rels_parent_idx\` ON \`learn_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`learn_rels_path_idx\` ON \`learn_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`learn_rels_guides_id_idx\` ON \`learn_rels\` (\`guides_id\`);`)
  await db.run(sql`CREATE INDEX \`learn_rels_learn_id_idx\` ON \`learn_rels\` (\`learn_id\`);`)
  await db.run(sql`CREATE TABLE \`pages\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`slug\` text NOT NULL,
  	\`content\` text,
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_slug_idx\` ON \`pages\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`pages_updated_at_idx\` ON \`pages\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`pages_created_at_idx\` ON \`pages\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_kv\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text NOT NULL,
  	\`data\` text NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`payload_kv_key_idx\` ON \`payload_kv\` (\`key\`);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`brands_id\` integer REFERENCES brands(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`guides_id\` integer REFERENCES guides(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`devices_id\` integer REFERENCES devices(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`learn_id\` integer REFERENCES learn(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`pages_id\` integer REFERENCES pages(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_brands_id_idx\` ON \`payload_locked_documents_rels\` (\`brands_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_guides_id_idx\` ON \`payload_locked_documents_rels\` (\`guides_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_devices_id_idx\` ON \`payload_locked_documents_rels\` (\`devices_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_learn_id_idx\` ON \`payload_locked_documents_rels\` (\`learn_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_pages_id_idx\` ON \`payload_locked_documents_rels\` (\`pages_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`brands\`;`)
  await db.run(sql`DROP TABLE \`guides_steps\`;`)
  await db.run(sql`DROP TABLE \`guides_faq\`;`)
  await db.run(sql`DROP TABLE \`guides_download_links\`;`)
  await db.run(sql`DROP TABLE \`guides_target_keywords\`;`)
  await db.run(sql`DROP TABLE \`guides\`;`)
  await db.run(sql`DROP TABLE \`guides_rels\`;`)
  await db.run(sql`DROP TABLE \`devices_prerequisites\`;`)
  await db.run(sql`DROP TABLE \`devices_steps\`;`)
  await db.run(sql`DROP TABLE \`devices_warnings\`;`)
  await db.run(sql`DROP TABLE \`devices_faq\`;`)
  await db.run(sql`DROP TABLE \`devices_target_keywords\`;`)
  await db.run(sql`DROP TABLE \`devices\`;`)
  await db.run(sql`DROP TABLE \`devices_rels\`;`)
  await db.run(sql`DROP TABLE \`learn_faq\`;`)
  await db.run(sql`DROP TABLE \`learn_target_keywords\`;`)
  await db.run(sql`DROP TABLE \`learn\`;`)
  await db.run(sql`DROP TABLE \`learn_rels\`;`)
  await db.run(sql`DROP TABLE \`pages\`;`)
  await db.run(sql`DROP TABLE \`payload_kv\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`media_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "users_id", "media_id") SELECT "id", "order", "parent_id", "path", "users_id", "media_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
}
