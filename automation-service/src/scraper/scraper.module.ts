import { Module } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { ScheduleModule } from '@nestjs/schedule';
import { MetricsModule } from 'src/metrics/metrics.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
	exports: [ScraperService],
	imports: [ScheduleModule.forRoot(), MetricsModule, PrismaModule],
	providers: [ScraperService, PrismaService],
})
export class ScraperModule {}
