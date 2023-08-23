module.exports = class Data1692801316162 {
    name = 'Data1692801316162'

    async up(db) {
        await db.query(`CREATE TABLE "transfer" ("id" character varying NOT NULL, "from" text NOT NULL, "to" text NOT NULL, "token_id" numeric NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "block_number" integer NOT NULL, "tx_hash" text NOT NULL, CONSTRAINT "PK_fd9ddbdd49a17afcbe014401295" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_be54ea276e0f665ffc38630fc0" ON "transfer" ("from") `)
        await db.query(`CREATE INDEX "IDX_4cbc37e8c3b47ded161f44c24f" ON "transfer" ("to") `)
        await db.query(`CREATE INDEX "IDX_f605a03972b4f28db27a0ee70d" ON "transfer" ("tx_hash") `)
        await db.query(`CREATE TABLE "user" ("id" character varying NOT NULL, "balance" numeric NOT NULL, "owned_token" integer array NOT NULL, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`)
    }

    async down(db) {
        await db.query(`DROP TABLE "transfer"`)
        await db.query(`DROP INDEX "public"."IDX_be54ea276e0f665ffc38630fc0"`)
        await db.query(`DROP INDEX "public"."IDX_4cbc37e8c3b47ded161f44c24f"`)
        await db.query(`DROP INDEX "public"."IDX_f605a03972b4f28db27a0ee70d"`)
        await db.query(`DROP TABLE "user"`)
    }
}
