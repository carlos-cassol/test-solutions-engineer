import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AutomationDataDto } from './dto/automationData.dto';
import { automationRegistry } from '../automation/registry.automation';
import { AutomationReturnTypeDto } from 'src/automation/model/automationReturnType.model';
import { MetricsService } from 'src/metrics/metrics.service';
import axios from 'axios';
import { SummaryResponseDto } from './dto/summary-response.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { error } from 'console';

@Injectable()
export class ScraperService {
	constructor(
		private metricsService: MetricsService,
		private readonly prismaService: PrismaService,
	) {}
	private readonly logger = new Logger(ScraperService.name);
	isRunning: boolean = false;

	@Cron('* * * * *')
	async handleAutomations() {
		if (this.isRunning) {
			this.logger.warn('Job ignorado: execução anterior ainda em andamento.');
			return;
		}

		this.isRunning = true;
		try {
			const allData = await this.runAllAutomations();
			if (
				(allData.CarrierData.length === 0 || !allData.CarrierData) &&
				!allData.AutomationExecutionSuccess
			) {
				const errorMessage =
					'No data returned from automations or execution failed.';
				this.logger.error(errorMessage);
				throw new Error(errorMessage);
			} else if (
				allData.CarrierData.length > 0 &&
				!allData.AutomationExecutionSuccess
			) {
				this.logger.warn('One or more automations were unsuccessful.');
			}
			const summary = await this.sendToGpt(allData);
			if (
				!summary ||
				!summary.summary ||
				summary.summary.includes('Unable to generate summary due to API error')
			) {
				throw new error(
					'Invalid response from GPT. Summary or insights are missing.',
				);
			}

			const dto = new AutomationDataDto();
			dto.data = allData.CarrierData;
			dto.summary = summary;

			await this.saveToDatabase(dto);
		} catch (err) {
			this.logger.warn(`Execution error at automation routine. ${err}`);
		} finally {
			this.isRunning = false;
		}
	}

	private async runAllAutomations(): Promise<AutomationReturnTypeDto> {
		const allData = new AutomationReturnTypeDto();

		for (const [name, automation] of Object.entries(automationRegistry)) {
			try {
				const endTimer = this.metricsService.startJobTimer(name);

				//Suggestion to a real scenario: Try by endpoints. If it fails, try by automation.
				const data = await automation.run();
				endTimer();

				this.metricsService.incrementResultJobRuns(
					data.AutomationExecutionSuccess,
					name,
				);

				allData.CarrierData.push(...data.CarrierData);
				if (
					!data.AutomationExecutionSuccess &&
					allData.AutomationExecutionSuccess
				) {
					allData.AutomationExecutionSuccess = data.AutomationExecutionSuccess;
				}
			} catch (err) {
				this.metricsService.incrementResultJobRuns(false, name);
				this.logger.warn(`Erro ao executar ${name}: ${err.message}`);
			}
		}

		return allData;
	}

	private async sendToGpt(
		data: AutomationReturnTypeDto,
	): Promise<SummaryResponseDto> {
		try {
			const response = await axios.post<SummaryResponseDto>(
				'http://localhost:3000/summarize-loads',
				data,
			);
			if (
				!response.data ||
				!response.data.summary ||
				response.data.summary.includes(
					'Unable to generate summary due to API error',
				)
			) {
				this.metricsService.incrementGptFailureRequest();
				throw new Error(
					'Invalid response from GPT. Summary or insights are missing.',
				);
			}
			this.metricsService.incrementGptRequest();
			return response.data;
		} catch (error) {
			this.logger.warn(`Erro ao enviar dados para o GPT: ${error.message}`);
			return new SummaryResponseDto();
		}
	}

	private async saveToDatabase(dto: AutomationDataDto) {
		if (!dto || !dto.data)
			throw new Error(
				'An error occurred while saving data to the database. Data is undefined.',
			);
		await this.prismaService.insight.create({
			data: {
				summary: dto.summary.summary,
				carriers: {
					create: dto.data.map((c) => ({
						pickupDateTime: new Date(c.pickupDateTime),
						deliveryDateTime: new Date(c.deliveryDateTime),
						origin: c.origin ?? '',
						destination: c.destination ?? '',
						carrierPay: c.carrierPay ?? 0,
						miles: c.miles ?? 0,
						weight: c.weight ?? 0,
						commodityCode: c.commodityCode,
					})),
				},
			},
		});
	}
}
