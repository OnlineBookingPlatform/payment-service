import { Injectable } from "@nestjs/common";
import { TransactionHistory } from "./transaction_history.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { DTO_RP_Transaction } from "./transaction.dto";

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(TransactionHistory)
    private readonly transactionRepository: Repository<TransactionHistory>,
  ) {}

  async getTransactionHistory(): Promise<DTO_RP_Transaction[]> {
    const transactions = await this.transactionRepository.find({
      order: {
        created_at: "DESC",
      },
    });
    if (!transactions || transactions.length === 0) {
      return [];
    }

    return transactions.map(transaction => ({
      id: transaction.id,
      amount: transaction.amount,
      created_at: transaction.created_at.toString(),
      email: transaction.email,
      phone: transaction.phone,
      order_id: transaction.order_id,
      status: transaction.status, 
      description: transaction.description, 
    }));
  }
}