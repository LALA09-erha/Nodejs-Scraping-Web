const puppeteer = require("puppeteer");
const writeXlsxFile = require("write-excel-file/node");

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto("https://dramakoreaindo.top", {
    waitUntil: ["domcontentloaded", "load"],
  });

  // ambil semua pagination
  const pagination = await page.$$eval(".page-numbers", (links) =>
    links.map((link) => link.innerText)
  );

  // ambil angka ke 2 dari belakang pagination
  const lastPage = pagination[pagination.length - 2];
  console.log(lastPage);

  temp_data = [];
  // lakukan perulangan untuk mengambil data
  for (let i = 1; i <= 1; i++) {
    await page.goto(`https://dramakoreaindo.top/page/${i}`, {
      waitUntil: ["domcontentloaded", "load"],
    });

    // get data dari title
    const data = await page.$$eval(".entry-title", (links) =>
      // get link
      links.map((link) => link.querySelector("a").href)
    );
    // insert data ke temp_data
    temp_data.push(...data);
  }

  console.log(temp_data);

  // looping untuk mengambil data dari link
  let data = {};

  for (let i = 0; i < temp_data.length; i++) {
    await page.goto(temp_data[i], {
      waitUntil: ["domcontentloaded", "load"],
    });
    // get title
    const title = await page.$eval(".entry-title", (title) => title.innerText);

    // get sinopsis
    let sinopsis = await page.$eval(
      ".entry-content",
      // mengambil tag p pertama
      (sinopsis) => sinopsis.querySelector("p").innerText
    );

    if (!sinopsis.includes("Sinopsis")) {
      sinopsis = "-";
    }

    // get genre
    // ambil semua tag p yang ada di dalam class entry-content
    const detail = await page.$$eval(".entry-content p", (detail) =>
      // ambil text dari tag p yang ada detail didalamnya
      detail.map((det) => det.innerText)
    );
    console.log(detail);
  }

  // console.log(data);
  await browser.close();
})();
