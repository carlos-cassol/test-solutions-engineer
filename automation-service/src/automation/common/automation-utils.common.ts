import { Page } from 'puppeteer';

export async function clickSelectorAndAwaitLoad(page: Page, selector: string) {
	await Promise.all([
		page.waitForNavigation({ waitUntil: 'networkidle0' }),
		await page.click(`${selector}`),
	]);
}

export async function clickXPathAndAwaitLoad(page: Page, xpath: string) {
	await Promise.all([
		page.waitForNavigation({ waitUntil: 'networkidle0' }),
		await page.click(`::-p-xpath(${xpath})`),
	]);
}
