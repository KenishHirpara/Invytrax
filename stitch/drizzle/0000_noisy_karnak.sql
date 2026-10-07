CREATE TYPE "public"."document_status" AS ENUM('draft', 'waiting', 'ready', 'done', 'canceled');--> statement-breakpoint
CREATE TYPE "public"."operation_type" AS ENUM('receipt', 'delivery', 'transfer', 'adjustment');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('manager', 'staff');--> statement-breakpoint
CREATE TYPE "public"."stock_ledger_status" AS ENUM('completed', 'pending', 'in_transit', 'flagged');--> statement-breakpoint
CREATE TYPE "public"."stock_status" AS ENUM('in_stock', 'low_stock', 'out_of_stock');--> statement-breakpoint
CREATE TABLE "adjustment_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"adjustment_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"system_quantity" integer NOT NULL,
	"counted_quantity" integer NOT NULL,
	"delta" integer NOT NULL,
	"uom" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "adjustments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference" varchar(50) NOT NULL,
	"location_id" uuid NOT NULL,
	"status" "document_status" DEFAULT 'draft' NOT NULL,
	"notes" text,
	"reason" text,
	"created_by_id" uuid NOT NULL,
	"validated_at" timestamp,
	"validated_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "adjustments_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "deliveries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference" varchar(50) NOT NULL,
	"customer_name" varchar(255),
	"delivery_address" text,
	"source_location_id" uuid,
	"destination_info" text,
	"scheduled_date" timestamp,
	"status" "document_status" DEFAULT 'draft' NOT NULL,
	"responsible_id" uuid,
	"notes" text,
	"created_by_id" uuid NOT NULL,
	"validated_at" timestamp,
	"validated_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "deliveries_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE "delivery_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"delivery_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"demand_quantity" integer NOT NULL,
	"done_quantity" integer DEFAULT 0 NOT NULL,
	"uom" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"warehouse_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(50),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "otp_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" varchar(10) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"sku" varchar(100) NOT NULL,
	"category_id" uuid,
	"uom" varchar(50) DEFAULT 'Units' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "products_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "receipt_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"receipt_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"uom" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "receipts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference" varchar(50) NOT NULL,
	"supplier_id" text,
	"supplier_name" varchar(255),
	"source_location_id" uuid,
	"destination_location_id" uuid,
	"scheduled_date" timestamp,
	"deadline" timestamp,
	"status" "document_status" DEFAULT 'draft' NOT NULL,
	"responsible_id" uuid,
	"notes" text,
	"created_by_id" uuid NOT NULL,
	"validated_at" timestamp,
	"validated_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "receipts_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE "reorder_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"min_quantity" integer DEFAULT 0 NOT NULL,
	"max_quantity" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_ledger" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"location_id" uuid NOT NULL,
	"quantity_delta" integer NOT NULL,
	"operation_type" "operation_type" NOT NULL,
	"document_id" uuid NOT NULL,
	"document_reference" varchar(50) NOT NULL,
	"user_id" uuid NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_per_location" (
	"product_id" uuid NOT NULL,
	"location_id" uuid NOT NULL,
	"quantity_on_hand" integer DEFAULT 0 NOT NULL,
	"quantity_reserved" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "stock_per_location_product_id_location_id_unique" UNIQUE("product_id","location_id")
);
--> statement-breakpoint
CREATE TABLE "transfer_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transfer_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"uom" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transfers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference" varchar(50) NOT NULL,
	"source_location_id" uuid NOT NULL,
	"destination_location_id" uuid NOT NULL,
	"scheduled_date" timestamp,
	"status" "document_status" DEFAULT 'draft' NOT NULL,
	"responsible_id" uuid,
	"notes" text,
	"created_by_id" uuid NOT NULL,
	"validated_at" timestamp,
	"validated_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "transfers_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE "user_warehouse_assignments" (
	"user_id" uuid NOT NULL,
	"warehouse_id" uuid NOT NULL,
	CONSTRAINT "user_warehouse_assignments_user_id_warehouse_id_unique" UNIQUE("user_id","warehouse_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"role" "role" DEFAULT 'staff' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "warehouses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"short_code" varchar(20) NOT NULL,
	"address" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "warehouses_short_code_unique" UNIQUE("short_code")
);
--> statement-breakpoint
ALTER TABLE "adjustment_lines" ADD CONSTRAINT "adjustment_lines_adjustment_id_adjustments_id_fk" FOREIGN KEY ("adjustment_id") REFERENCES "public"."adjustments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adjustment_lines" ADD CONSTRAINT "adjustment_lines_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adjustments" ADD CONSTRAINT "adjustments_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adjustments" ADD CONSTRAINT "adjustments_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adjustments" ADD CONSTRAINT "adjustments_validated_by_id_users_id_fk" FOREIGN KEY ("validated_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_source_location_id_locations_id_fk" FOREIGN KEY ("source_location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_responsible_id_users_id_fk" FOREIGN KEY ("responsible_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_validated_by_id_users_id_fk" FOREIGN KEY ("validated_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_lines" ADD CONSTRAINT "delivery_lines_delivery_id_deliveries_id_fk" FOREIGN KEY ("delivery_id") REFERENCES "public"."deliveries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_lines" ADD CONSTRAINT "delivery_lines_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "locations" ADD CONSTRAINT "locations_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "otp_tokens" ADD CONSTRAINT "otp_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "receipt_lines" ADD CONSTRAINT "receipt_lines_receipt_id_receipts_id_fk" FOREIGN KEY ("receipt_id") REFERENCES "public"."receipts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "receipt_lines" ADD CONSTRAINT "receipt_lines_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_source_location_id_locations_id_fk" FOREIGN KEY ("source_location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_destination_location_id_locations_id_fk" FOREIGN KEY ("destination_location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_responsible_id_users_id_fk" FOREIGN KEY ("responsible_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_validated_by_id_users_id_fk" FOREIGN KEY ("validated_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reorder_rules" ADD CONSTRAINT "reorder_rules_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_ledger" ADD CONSTRAINT "stock_ledger_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_ledger" ADD CONSTRAINT "stock_ledger_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_ledger" ADD CONSTRAINT "stock_ledger_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_per_location" ADD CONSTRAINT "stock_per_location_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_per_location" ADD CONSTRAINT "stock_per_location_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfer_lines" ADD CONSTRAINT "transfer_lines_transfer_id_transfers_id_fk" FOREIGN KEY ("transfer_id") REFERENCES "public"."transfers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfer_lines" ADD CONSTRAINT "transfer_lines_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_source_location_id_locations_id_fk" FOREIGN KEY ("source_location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_destination_location_id_locations_id_fk" FOREIGN KEY ("destination_location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_responsible_id_users_id_fk" FOREIGN KEY ("responsible_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_validated_by_id_users_id_fk" FOREIGN KEY ("validated_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_warehouse_assignments" ADD CONSTRAINT "user_warehouse_assignments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_warehouse_assignments" ADD CONSTRAINT "user_warehouse_assignments_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ledger_product_idx" ON "stock_ledger" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "ledger_location_idx" ON "stock_ledger" USING btree ("location_id");--> statement-breakpoint
CREATE INDEX "ledger_created_idx" ON "stock_ledger" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "ledger_op_type_idx" ON "stock_ledger" USING btree ("operation_type");