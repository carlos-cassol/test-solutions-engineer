import { Body, Controller, Post } from '@nestjs/common';
import { GptService } from './gpt.service';
import { AutomationReturnTypeDto } from './dto/carrierLoad.dto';

@Controller('summarize-loads')
export class GptController {
	constructor(private readonly gptService: GptService) {}

	@Post()
	async analyzeFreightData(
		@Body() body: AutomationReturnTypeDto,
	): Promise<any> {
		const result = await this.gptService.analyzeFreightData(body);
		return result;
	}
}
