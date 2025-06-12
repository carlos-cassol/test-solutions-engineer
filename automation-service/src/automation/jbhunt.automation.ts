import puppeteer, { Browser, ElementHandle, Page } from 'puppeteer';
import {
	AutomationReturnTypeDto,
	CarrierDataRowDto,
} from './model/automationReturnType.model';
import { parse } from 'date-fns';
import { usaStates } from './constants/automation-constants.constants';

//API URL alternative: https://scm.jbhunt.com/carrier/public/rest/loadboard/graphql/external
//Faster. If does not work, then use the automation.

export async function run(): Promise<AutomationReturnTypeDto> {
	let { page, browser } = await accessJbHunt();
	const result = await searchCarriersByState(page);
	page = result.page;
	const table = result.table;
	if (table.CarrierData.length === 0) table.AutomationExecutionSuccess = false;
	await browser.close();

	return table;
}

async function searchCarriersByState(
	page: Page,
): Promise<{ page: Page; table: AutomationReturnTypeDto }> {
	//Clear state input, and then type each state that is assigned to the foreach const state.
	const carrierDataTable = new AutomationReturnTypeDto();
	for (const state of usaStates) {
		const inputSelector =
			'body > app-root > div > app-load-board > div > ucl-load-board-search > div > form > div:nth-child(1) > div > p-autocomplete > span > input';

		await page.evaluate((selector) => {
			this.document.querySelector(selector).value = '';
		}, inputSelector);

		await page.type(inputSelector, state);
		await new Promise((r) => setTimeout(r, 1150));

		await page.keyboard.press('Enter');

		await new Promise((r) => setTimeout(r, 800));
		await waitUntilSpinnerDisappears(
			page,
			'body > app-root > div > app-load-board > div > ucl-loading-spinner',
		);
		try {
			await page.$eval(
				'#pr_id_4 > div.p-datatable-header.ng-star-inserted > div > div.jds-flex-grow-1.jds-align-items-center.jds-justify-content-between.jds-d-flex > div.jds-d-flex.jds-justify-content-center.jds-justify-content-md-start.jds-flex-grow-1.h2 > span.grey.ng-star-inserted',
				(el) => el.textContent,
			);
		} catch {
			continue;
		}

		const rows = await page.$$(
			'#pr_id_4 > div.p-datatable-wrapper > table > tbody > tr',
		);

		if (rows.length === 0) {
			continue;
		}

		const extractedData = await extractTableData(rows);
		carrierDataTable.CarrierData.push(...extractedData.CarrierData);
		console.log(
			`existe informação no site para o estado e essa quantidade de linhas: ${rows.length} para o estado ${state}`,
		);
	}

	return { page, table: carrierDataTable };
}

async function extractTableData(
	rows: ElementHandle<HTMLTableRowElement>[],
): Promise<AutomationReturnTypeDto> {
	const dto = new AutomationReturnTypeDto();
	const top = 20;
	let index = 0;
	for (const row of rows) {
		if (index >= top) break;
		const cells = await row.$$('td');

		const pickup = await cells[0]?.evaluate((el) => el.innerText?.trim());
		const delivery = await cells[1]?.evaluate((el) => el.innerText?.trim());
		const weight = await cells[3]?.evaluate((el) => el.innerText?.trim());

		const pickupCity = pickup?.split('\n')[0]?.trim() || '';
		const pickupDate = pickup?.split('\n')[1]?.trim() || '';
		let pickupTime = pickup?.split('\n')[2]?.trim() || '';

		if (pickupTime === 'Not Confirmed') {
			pickupTime = '12:00 PM';
		} else if (pickupTime.includes('-')) {
			pickupTime = pickupTime.split('-')[0].trim();
		}

		const pickupDateTime = parse(
			`${pickupDate} ${pickupTime}`,
			'MMM d, yyyy h:mm a',
			new Date(),
		);

		const deliveryCity = delivery?.split('\n')[0]?.trim() || '';
		const deliveryDate = delivery?.split('\n')[1]?.trim() || '';
		let deliveryTime = delivery?.split('\n')[2]?.trim() || '';

		if (deliveryTime === 'Not Confirmed') {
			deliveryTime = '12:00 PM';
		} else if (deliveryTime.includes('-')) {
			deliveryTime = deliveryTime.split('-')[0].trim();
		}

		const deliveryDateTime = parse(
			`${deliveryDate} ${deliveryTime}`,
			'MMM d, yyyy h:mm a',
			new Date(),
		);

		const weightValue = weight?.replace(/./g, '') || '0';

		const dtoRow = new CarrierDataRowDto();
		dtoRow.pickupDateTime = pickupDateTime;
		dtoRow.deliveryDateTime = deliveryDateTime;
		dtoRow.origin = pickupCity;
		dtoRow.destination = deliveryCity;
		dtoRow.weight = parseInt(weightValue, 10);
		dtoRow.carrierPay = 0; // J.B. Hunt does not show carrier pay in the table
		dtoRow.miles = 0; // J.B. Hunt does not show miles in the table
		dtoRow.commodityCode = ''; // J.B. Hunt does not show commodity code in the table
		dto.CarrierData.push(dtoRow);
		index++;
	}

	return dto;
}

async function waitUntilSpinnerDisappears(
	page: Page,
	selectorPath: string,
): Promise<void> {
	for (let i = 0; i < 10; i++) {
		const display = await page.evaluate((selector) => {
			return this.document.querySelector(selector).style.display;
		}, selectorPath);
		await new Promise((r) => setTimeout(r, 1000));
		if (display === 'none') {
			return;
		}
	}
}

async function accessJbHunt(): Promise<{ page: Page; browser: Browser }> {
	const browser = await puppeteer.launch({ headless: false });
	const page = await browser.newPage();
	const retries = 6;
	for (let i = 0; i < retries; i++) {
		try {
			await page.goto('https://www.jbhunt.com/loadboard/load-board/grid', {
				waitUntil: 'networkidle2',
			});

			await page.waitForSelector(
				'#navigationContainer > div.cmp-headerv3__desktop-logo-container > a > img',
				{
					timeout: 5000,
				},
			);

			await new Promise((r) => setTimeout(r, 1000));

			return { page, browser };
		} catch (err) {
			console.error(
				`Error logging into J.B. Hunt. Attempt ${i} of ${retries}:`,
				err,
			);
			continue;
		}
	}

	return { page, browser };
}
