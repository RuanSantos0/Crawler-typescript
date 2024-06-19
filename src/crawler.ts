import puppeteer from "puppeteer";

const url = "https://lista.mercadolivre.com.br";

interface IProduct {
  url: string | null;
  title: string | null;
  price: string | null;
}

async function main(): Promise<void> {
  const products: IProduct[] = [];
  const browser = await puppeteer.launch({
    headless: false,
  });

  const page = await browser.newPage();

  await page.goto(url, { waitUntil: "networkidle0" });

  await page.type("#cb1-edit", "kart");

  await Promise.all([page.waitForNavigation(), page.click(".nav-search-btn")]);

  await page.waitForNetworkIdle();

  while (await page.$(".andes-pagination__button--next")) {
    const data = await page.$$(".ui-search-result__wrapper");

    for (const item of data) {
      const product: IProduct = {
        url: await item.$eval(".ui-search-item__group__element.ui-search-link__title-card.ui-search-link", el => el.getAttribute("href")),
        title: await item.$eval(".ui-search-item__title", el => el.textContent),
        price: await item.$eval(".andes-money-amount__fraction", el => el.textContent),
      };
      products.push(product);
    }

    if (
      !(await page.$(
        ".andes-pagination__button--next.andes-pagination__button--disabled"
      ))
    ) {
      await Promise.all([
        page.waitForNavigation(),
        page.click(".andes-pagination__button--next"),
      ]);
      await page.waitForNetworkIdle();
    } else {
      break;
    }
  }

  await browser.close();
  console.log(products)
}

main();
