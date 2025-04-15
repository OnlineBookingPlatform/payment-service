export class DTO_RQ_ZaloPay {
    account_id: string;
    service_provider_id: number;
    service_provider_name: string;
    ticket: DTO_RQ_Ticket[];
}
export class DTO_RQ_Ticket {
    id: number;
    seat_name: string;
    price: number;
}