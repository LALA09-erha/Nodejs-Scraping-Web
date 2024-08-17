const puppeteer = require("puppeteer");
var fs = require("fs");
const writeXlsxFile = require("write-excel-file/node");

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(0);
  await page.goto("https://oppadrama.art/series/?status=&type=&order=update", {
    waitUntil: ["load"],
  });

  temp_data = [];

  let ind = 0;
  let next = "";
  while (true) {
    // get url data dari title
    const data = await page.$$eval(".bs", (links) =>
      links.map((link) => link.querySelector("a").href)
    );
    // masukkan data ke temp_data
    temp_data.push(...data);

    // tambahkan index
    console.log(ind);
    ind++;

    // check apakah ada class hpage
    const nextPage = await page.$$eval(".hpage a.r", (links) =>
      links.map((link) => link.href)
    );

    // jika next page sama dengan next atau tidak ada next page maka break
    if (nextPage[nextPage.length - 1] === next || !nextPage) {
      break;
    } else {
      next = nextPage[nextPage.length - 1];
    }

    // jika tidak ada class hpage maka break
    try {
      // jika ada class hpage maka click next page
      await page.goto(nextPage[nextPage.length - 1]);
    } catch (error) {
      break;
    }
  }

  var datas = JSON.stringify(temp_data);

  fs.writeFile("Data/data.json", datas, function (err) {
    if (err) {
      console.log(err);
    }
  });

  console.log(temp_data);

  await browser.close();
})();
