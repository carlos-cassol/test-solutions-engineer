export class AutomationReturnTypeDto {
	CarrierData: CarrierDataRowDto[] = [];
	AutomationExecutionSuccess: boolean = true;
}

export class CarrierDataRowDto {
	pickupDateTime: Date;
	deliveryDateTime: Date;
	origin: string;
	destination: string;
	carrierPay: number;
	miles: number;
	weight: number;
	commodityCode: string;
}
