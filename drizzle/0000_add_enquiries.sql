CREATE TABLE "admin_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "admin_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"excerpt" text DEFAULT '' NOT NULL,
	"content" text,
	"sections" jsonb,
	"category" text DEFAULT 'Property' NOT NULL,
	"image" text DEFAULT '' NOT NULL,
	"author" text DEFAULT '' NOT NULL,
	"date" text DEFAULT '' NOT NULL,
	"read_time" text DEFAULT '' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"is_hero" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "articles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "enquiries" (
	"id" serial PRIMARY KEY NOT NULL,
	"enquiry_about" text NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"contact_number" text DEFAULT '',
	"company" text DEFAULT '',
	"inquiry_context" text DEFAULT '',
	"looking_to_achieve" text DEFAULT '',
	"project_timeline" text DEFAULT '',
	"estimated_budget" text DEFAULT '',
	"stage" text DEFAULT '',
	"property_type" text DEFAULT '',
	"describe_situation" text DEFAULT '',
	"status" text DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "home_tour_series" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"excerpt" text DEFAULT '' NOT NULL,
	"image" text DEFAULT '' NOT NULL,
	"category" text DEFAULT 'Condo' NOT NULL,
	"read_time" text DEFAULT '' NOT NULL,
	"is_hero" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "home_tour_series_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "new_launch_series" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"excerpt" text DEFAULT '' NOT NULL,
	"image" text DEFAULT '' NOT NULL,
	"category" text DEFAULT 'Most Viewed' NOT NULL,
	"read_time" text DEFAULT '' NOT NULL,
	"is_hero" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "new_launch_series_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "reels" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"thumbnail" text DEFAULT '' NOT NULL,
	"duration" text DEFAULT '' NOT NULL,
	"category" text DEFAULT 'Most Viewed' NOT NULL,
	"video_url" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "reels_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text DEFAULT '' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now()
);
