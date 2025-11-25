import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm";

@Entity()
export class Link {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true, length: 8 })
  code!: string;

  @Column("text")
  originalUrl!: string;

  @Column({ default: 0 })
  clicks!: number;

  @Column({ type: "timestamp", nullable: true, default: null })
  lastClicked!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;
}
