import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
// import { readFileSync } from 'fs';
// import { join } from 'path';

@Injectable()
export class PrismaService
	extends PrismaClient
	implements OnModuleInit, OnModuleDestroy
{
	async onModuleInit() {
		await this.$connect();

		//Had a problem with the materialized view, so I commented it out
		// const sqlPath = join(
		// 	process.cwd(),
		// 	'src',
		// 	'prisma',
		// 	'helper',
		// 	'materialized.helper.sql',
		// );
		// const content = readFileSync(sqlPath, 'utf-8');

		// const queries = content
		// 	.split(';')
		// 	.map((q) => q.trim())
		// 	.filter((q) => q.length > 0);

		// for (const query of queries) {
		// 	await this.$executeRawUnsafe(query);
		// }
	}

	async onModuleDestroy() {
		await this.$disconnect();
	}
}
