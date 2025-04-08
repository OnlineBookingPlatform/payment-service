import { Column, Entity, ObjectId, ObjectIdColumn } from 'typeorm';

@Entity()
export class Payment {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  amount: number;

  @Column()
  userId: string;

  @Column()
  status: string;

  @Column()
  createdAt: Date;
}
