import { Module } from '@nestjs/common';
import { GptModule } from 'src/gpt/gpt.module';
import { ConfigModule } from '@nestjs/config';
@Module({
	imports: [
		GptModule,
		ConfigModule.forRoot({
			isGlobal: true,
		}),
	],
})
export class AppModule {}
