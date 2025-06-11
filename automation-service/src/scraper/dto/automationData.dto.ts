import { CarrierDataRowDto } from 'src/automation/model/automationReturnType.model';
import { SummaryResponseDto } from './summary-response.dto';

export class AutomationDataDto {
	data: CarrierDataRowDto[];
	summary: SummaryResponseDto;
}
