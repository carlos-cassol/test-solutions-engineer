import { Injectable, OnModuleInit } from '@nestjs/common';
import { Counter, Histogram, register } from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
	private jobsRunsCounter: Counter;
	private jobsSuccessTotal: Counter;
	private jobsFailureTotal: Counter;
	private jobDuration: Histogram;
	private gptRequestCounter: Counter;
	private gptFailureTotal: Counter;

	onModuleInit() {
		this.jobsRunsCounter =
			(register.getSingleMetric('total_web_scraping_runs') as Counter) ??
			new Counter({
				name: 'total_web_scraping_runs',
				help: 'Amount of web-scraping executions',
				labelNames: ['automation'],
			});

		this.jobsSuccessTotal =
			(register.getSingleMetric(
				'total_success_web_scraping_runs',
			) as Counter) ??
			new Counter({
				name: 'total_success_web_scraping_runs',
				help: 'Amount of successful web-scraping executions',
				labelNames: ['automation'],
			});

		this.jobsFailureTotal =
			(register.getSingleMetric(
				'total_failure_web_scraping_runs',
			) as Counter) ??
			new Counter({
				name: 'total_failure_web_scraping_runs',
				help: 'Amount of failed web-scraping executions',
				labelNames: ['automation'],
			});

		this.gptRequestCounter =
			(register.getSingleMetric('gpt_request_total') as Counter) ??
			new Counter({
				name: 'gpt_request_total',
				help: 'Amount of successful GPT requests',
			});

		this.gptFailureTotal =
			(register.getSingleMetric('gpt_request_failure_total') as Counter) ??
			new Counter({
				name: 'gpt_request_failure_total',
				help: 'Amount of failure GPT requests',
			});

		this.jobDuration =
			(register.getSingleMetric('scraper_job_duration_seconds') as Histogram) ??
			new Histogram({
				name: 'scraper_job_duration_seconds',
				help: 'Job duration in seconds',
				labelNames: ['automation'],
				buckets: [30, 50, 80, 100, 200],
			});
	}

	incrementJobRuns(automationName: string) {
		this.jobsRunsCounter.inc({ automation: automationName });
	}

	incrementResultJobRuns(result: boolean, automationName: string) {
		if (result) {
			this.jobsSuccessTotal.inc({ automation: automationName });
		} else {
			this.jobsFailureTotal.inc({ automation: automationName });
		}
	}

	incrementGptRequest() {
		this.gptRequestCounter.inc();
	}

	incrementGptFailureRequest() {
		this.gptFailureTotal.inc();
	}

	startJobTimer(automationName: string) {
		this.incrementJobRuns(automationName);
		return this.jobDuration.startTimer({ automation: automationName });
	}

	async getMetrics(): Promise<string> {
		return await register.metrics();
	}
}
