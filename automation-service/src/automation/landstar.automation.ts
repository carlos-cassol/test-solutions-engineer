import puppeteer, { Page, ElementHandle, Browser } from 'puppeteer';
import {
	AutomationReturnTypeDto,
	CarrierDataRowDto,
} from './model/automationReturnType.model';
import { parse } from 'date-fns';
import { clickSelectorAndAwaitLoad } from './common/automation-utils.common';

export async function run(): Promise<AutomationReturnTypeDto> {
	let { page, browser } = await loginToLandstar();
	page = await navigateToCarrierInfoData(page);

	const rows = await page.$$('#Loads > table > tbody > tr.t-master-row');

	const tableData = await extractTableData(rows);

	if (tableData.CarrierData.length === 0)
		tableData.AutomationExecutionSuccess = false;

	await browser.close();
	return tableData;
}

//---------------------------------//

async function loginToLandstar(): Promise<{ page: Page; browser: Browser }> {
	const browser = await puppeteer.launch({ headless: false });
	const page = await browser.newPage();
	const retries = 6;
	for (let i = 0; i < retries; i++) {
		try {
			await page.goto('https://www.landstaronline.com/public/login.aspx#');

			await page.waitForSelector('#LoginForm > div:nth-child(10)', {
				timeout: 5000,
			});

			await page.type('#USER', 'cassol');

			await page.type('#PASSWORD', '1Ba1ck@09c');

			await new Promise((r) => setTimeout(r, 1000));

			await clickSelectorAndAwaitLoad(page, '#Submit');

			await new Promise((r) => setTimeout(r, 2000));

			await page.waitForSelector('#AD7DC706-0D63-4C14-AD1C-93A44999A859', {
				timeout: 5000,
			});
			return { page, browser };
		} catch (err) {
			console.error(
				`Error logging into Landstar. Attempt ${i} of ${retries}:`,
				err,
			);
			continue;
		}
	}

	return { page, browser };
}

async function navigateToCarrierInfoData(page: Page): Promise<Page> {
	const regions =
		'AK;CO;CA;ID;MT;NV;OR;UT;WA;WY;AZ;NM;OK;TX;IL;IN;IA;KS;MI;MN;MO;NE;ND;OH;SD;WI;AL;AR;FL;GA;KY;LA;MS;NC;SC;TN;VA;WV;DE;MD;NJ;NY;PA;DC;CT;ME;MA;NH;RI;VT;AB;BC;MB;NB;NF;NT;NS;NU;ON;PE;QC;SK;YT;';

	await page.goto('https://www.landstaronline.com/loads', {
		waitUntil: 'networkidle0',
	});

	await page.type('#TxtOriginControl', regions);

	await page.type('#TxtDestinationControl', regions);

	await new Promise((r) => setTimeout(r, 500));

	await clickSelectorAndAwaitLoad(page, '#searchButton');
	return page;
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

		const dates = await cells[3]?.evaluate((el) => el.textContent?.trim());
		const miles = await cells[8]?.evaluate((el) => el.textContent?.trim());
		const weight = await cells[9]?.evaluate((el) => el.textContent?.trim());
		const commodity = await cells[10]?.evaluate((el) => el.textContent?.trim());
		const carrierPay = await cells[7]?.evaluate((el) => el.textContent?.trim());
		const originDest = await cells[4]?.evaluate((el) => el.textContent?.trim());

		const originLines = originDest?.split('\n') || [];
		const dateLines = dates?.split(/\r?\n/) || [];
		const weightLine = weight?.split('\n') || [];

		const startDate =
			dateLines[0]?.trim().split(/\s+/).slice(0, 2).join(' ') || '';
		const endDate =
			dateLines[1]?.trim().split(/\s+/).slice(2, 4).join(' ') || '';

		const dtoRow = new CarrierDataRowDto();

		dtoRow.pickupDateTime = parse(startDate, 'MM/dd/yy HH:mm', new Date());
		dtoRow.deliveryDateTime = parse(endDate, 'MM/dd/yy HH:mm', new Date());

		dtoRow.origin = originLines[0].trim() || '';
		dtoRow.destination = originLines[2].trim() || '';
		dtoRow.carrierPay = parseFloat(carrierPay?.replace(/[$,]/g, '') || '0');
		dtoRow.miles = parseInt(miles?.replace(/[,]/g, '') || '0', 10);
		dtoRow.weight = parseInt(weightLine[0]?.replace(/[,]/g, '') || '0', 10);
		dtoRow.commodityCode = commodity || '';

		dto.CarrierData.push(dtoRow);
		index++;
	}

	console.log(dto);
	return dto;
}
