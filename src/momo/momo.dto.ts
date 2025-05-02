export class DTO_RQ_Momo {
    account_id: string;
    service_provider_id: number;
    service_provider_name: string;
    ticket: DTO_RQ_Ticket[];

    passenger_name: string;
    passenger_phone: string;
    point_up: string;
    point_down: string;
    ticket_note: string;
    email: string;
    gender: number;
    creator_by_id: string;
}
export class DTO_RQ_Ticket {
    id: number;
    seat_name: string;
    price: number;
}
export class DTO_RQ_CheckMomoPayment {
    orderId: string;
    requestId: string;
    ticket: DTO_RQ_Ticket[];
}