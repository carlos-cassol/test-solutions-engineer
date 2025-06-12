import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app/app.module';

describe('Health check', () => {
	let app: INestApplication;

	beforeAll(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleRef.createNestApplication();
		await app.init();
	});

	it('/health (GET) should return 200', async () => {
		const res = await request(app.getHttpServer()).get('/health');
		expect(res.status).toBe(200);
	});

	afterAll(async () => {
		await app.close();
	});
});
