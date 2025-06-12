import { Injectable } from '@nestjs/common';
import { SummaryResponseDto } from './dto/summary-response.dto';
import { AutomationReturnTypeDto } from './dto/carrierLoad.dto';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GptService {
	private openai: OpenAI;

	constructor(config: ConfigService) {
		this.openai = new OpenAI({
			apiKey: config.get<string>('OPENAI_API_KEY'),
		});
	}

	async analyzeFreightData(
		input: AutomationReturnTypeDto,
	): Promise<SummaryResponseDto> {
		const prompt = this.createPrompt(input);
		const maxAttempts = 4;
		for (let attempt = 0; attempt < maxAttempts; attempt++) {
			try {
				const response = await this.openai.chat.completions.create({
					model: 'gpt-4o-mini',
					temperature: 0.7,
					messages: [{ role: 'user', content: prompt }],
					max_tokens: 4500,
				});

				const summary = response.choices[0].message.content || '';

				return { summary };
			} catch (error: any) {
				const isLast = attempt === maxAttempts - 1;
				const wait = Math.pow(4, attempt) * 1000;

				if (error?.code === '429') break;

				if (!isLast) await new Promise((r) => setTimeout(r, wait));
			}
		}

		const mock = new SummaryResponseDto();
		mock.summary = 'Unable to generate summary due to API errors.';
		return mock;
	}

	createPrompt(input: AutomationReturnTypeDto): string {
		const prompt = `
			Analyze the following freight load data with the goal of uncovering optimization opportunities and identifying market trends. For each load, consider:

			- Pickup and delivery regions (state or city-level)
			- Estimated drive time and total mileage
			- Load weight and commodity type
			- Carrier pay value

			Based on this, provide:

			1. A structured written summary in 2 to 3 paragraphs, describing:
			- Common patterns across routes, distances, and load types
			- General market behavior and notable trends
			- Optimization observations and recurring regions

			2. Then, list 5 to 7 bullet-point insights separately and clearly. Each should be actionable, focused, and derived from the dataset, focusing on potential improvements or strategic observations. Use concise language and avoid generic statements. For example, insights using dollar/mile ratios, weight considerations, or regional patterns like heatzones.

			Respond using the following JSON format:
			{
			"summary": "<Your multi-paragraph summary here>"
			}

			Here is the load data:
			${JSON.stringify(input.CarrierData, null, 2)}
			`;
		return prompt;
	}

	extractInsights(summary: string): string[] {
		const lines = summary.split('\n');

		return lines
			.filter(
				(line) => line.trim().startsWith('-') || line.trim().startsWith('•'),
			)
			.map((line) => line.replace(/^[-•]\s*/, '').trim());
	}
}
