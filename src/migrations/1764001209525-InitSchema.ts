import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1764001209525 implements MigrationInterface {
    name = 'InitSchema1764001209525'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "link" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying(8) NOT NULL, "originalUrl" text NOT NULL, "clicks" integer NOT NULL DEFAULT '0', "lastClicked" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_b118b8ec43546712aafecb95bd1" UNIQUE ("code"), CONSTRAINT "PK_26206fb7186da72fbb9eaa3fac9" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "link"`);
    }

}
