import { Module } from '@nestjs/common';
import { ScraperModule } from '../scraper/scraper.module';
import { MetricsService } from '../metrics/metrics.service';

@Module({
	imports: [ScraperModule],
	providers: [MetricsService],
})
export class AppModule {}
