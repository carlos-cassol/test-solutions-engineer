import puppeteer, { Browser, Page } from 'puppeteer';
import { AutomationReturnTypeDto } from './model/automationReturnType.model';
import {
	clickSelectorAndAwaitLoad,
	clickXPathAndAwaitLoad,
} from './common/automation-utils.common';

export async function run(): Promise<AutomationReturnTypeDto> {
	let { page, browser } = await accessJbHunt();

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
				//fazer logica pra poder aguardar a tela de carregamento. Tem um loader que fica girando e nn é do navegador, e sim da pagina
				await new Promise((r) => setTimeout(r, 1000));

				await clickXPathAndAwaitLoad(
					page,
					'/html/body/app-root/div/app-load-board/div/ucl-load-board-search/div/form/div[5]/button',
				);

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
	const retorno = new AutomationReturnTypeDto();
	return retorno;
}
