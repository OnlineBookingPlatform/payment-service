import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tbl_transaction_history')
export class TransactionHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  order_id: string;

  @Column()
  amount: number;

  @Column()
  status: string;

  @Column()
  account_id: string;

  @Column()
  company_id: number;
}
