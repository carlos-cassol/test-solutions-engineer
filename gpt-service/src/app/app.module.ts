import { Module } from '@nestjs/common';
import { GptModule } from 'src/gpt/gpt.module';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from 'src/health/health.controller';
@Module({
	imports: [
		GptModule,
		ConfigModule.forRoot({
			isGlobal: true,
		}),
	],
	controllers: [HealthController],
})
export class AppModule {}
