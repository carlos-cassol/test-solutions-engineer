import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { HealthController } from 'src/health/health.controller';

@Module({
	providers: [PrismaService],
	exports: [PrismaService],
	controllers: [HealthController],
})
export class PrismaModule {}
