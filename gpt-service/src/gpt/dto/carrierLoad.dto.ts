export class AutomationReturnTypeDto {
	CarrierData: CarrierDataRowDto[] = [];
}

export class CarrierDataRowDto {
	pickupDateTime: string;
	deliveryDateTime: string;
	origin: string;
	destination: string;
	carrierPay: string;
	miles: string;
	weight: string;
	commodityCode: string;
}
