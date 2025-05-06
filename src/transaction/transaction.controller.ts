import { Controller } from "@nestjs/common";
import { TransactionService } from "./transaction.service";
import { MessagePattern } from "@nestjs/microservices";
import { ApiResponse } from "src/utils/api-response";
import { DTO_RP_Transaction } from "./transaction.dto";
import { handleError } from "src/utils/error-handler";

@Controller()
export class TransactionController {
    constructor(private readonly transactionService: TransactionService) { }
    
    @MessagePattern('get_transaction_history')
    async getTransactionHistory(): Promise<ApiResponse<DTO_RP_Transaction[]>> {
        try {
            console.log('Fetching transaction history...');
            const response = await this.transactionService.getTransactionHistory();
            return ApiResponse.success(response);
        } catch (error) {
            return ApiResponse.error(handleError(error).message, handleError(error).status);
        }
    }
}