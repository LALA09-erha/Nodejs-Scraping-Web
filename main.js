const puppeteer = require("puppeteer");
var fs = require("fs");
const writeXlsxFile = require("write-excel-file/node");
const ObjectsToCsv = require("objects-to-csv");
const { connected } = require("process");

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(0);

  // ambil data dari data/data.json
  let data = fs.readFileSync("Data/data.json");
  let temp_data = JSON.parse(data);

  const header = [
    { value: "No", fontWeight: "bold" },
    { value: "Title", fontWeight: "bold" },
    { value: "Sinopsis", fontWeight: "bold" },
    { value: "Genre", fontWeight: "bold" },
    { value: "Thumb", fontWeight: "bold" },
    { value: "Status", fontWeight: "bold" },
    { value: "Released", fontWeight: "bold" },
    { value: "Duration", fontWeight: "bold" },
    { value: "Country", fontWeight: "bold" },
    { value: "Type", fontWeight: "bold" },
    { value: "Director", fontWeight: "bold" },
    { value: "Casts", fontWeight: "bold" },
    { value: "Episodes", fontWeight: "bold" },
  ];

  // inisialisasi dataXlsx
  const dataXlsx = [];

  // push header ke dataXlsx
  dataXlsx.push(header);

  // looping untuk mengambil data dari link

  for (let i = 0; i < temp_data.length; i++) {
    // for (let i = 10; i < 15; i++) {
    // inisialisasi data_film
    const data_film = [];

    // push no ke data_film
    // data_film["No"] = i + 1;
    data_film.push({ value: i + 1, type: Number });

    await page.goto(temp_data[i], {
      waitUntil: ["load"],
    });

    // get title
    let title;
    try {
      title = await page.$eval(".entry-title", (title) => title.innerText);
    } catch (error) {
      title = "-";
    }

    // push title ke data_film
    // data_film["Title"] = title;
    data_film.push({ value: title, type: String });

    // get sinopsis

    let sinopsis;
    try {
      sinopsis = await page.$eval(
        ".entry-content",
        (sinopsis) => sinopsis.querySelector("p").innerText || "-"
      );
    } catch (error) {
      sinopsis = "-";
    }

    // push sinopsis ke data_film
    // data_film["Sinopsis"] = sinopsis;
    data_film.push({ value: sinopsis, type: String });

    // get genre
    let genre = await page.$$eval(".genxed", (links) =>
      links.map((link) => link.innerText)
    );
    try {
      genre = genre[0].split(" ").toString();
    } catch (error) {
      console.log("Error: ", error);
    }

    // push genre ke data_film
    // data_film["Genre"] = genre;
    data_film.push({ value: genre, type: String });

    let thumb;
    try {
      // get thumb image
      thumb = await page.$eval(".thumb img", (thumb) => thumb.src);
    } catch (error) {
      thumb = "-";
    }

    // push thumb ke data_film
    // data_film["Thumb"] = thumb;
    data_film.push({ value: thumb, type: String });

    let status = "-";
    let released = "-";
    let duration = "-";
    let country = "-";
    let type = "-";
    let director = "-";
    let casts = "-";
    let episodes = "-";

    // get spe
    let spe = await page.$$eval(".spe", (links) =>
      links.map((link) => link.innerText)
    );

    try {
      spe = spe[0].split("\n");

      for (let i = 0; i < spe.length; i++) {
        // get Status
        if (spe[i].includes("Status")) {
          try {
            spe[i] = spe[i].split(":");
            status = spe[i][1];
          } catch (error) {
            continue;
          }
        }

        // get Released
        if (spe[i].includes("Released")) {
          try {
            spe[i] = spe[i].split(":");
            released = spe[i][1];
          } catch (error) {
            continue;
          }
        }

        // get Duration
        if (spe[i].includes("Duration")) {
          try {
            spe[i] = spe[i].split(":");
            duration = spe[i][1];
          } catch (error) {
            continue;
          }
        }

        // get Country
        if (spe[i].includes("Country")) {
          try {
            spe[i] = spe[i].split(":");
            country = spe[i][1];
          } catch (error) {
            continue;
          }
        }

        // get Type
        if (spe[i].includes("Type")) {
          try {
            spe[i] = spe[i].split(":");
            type = spe[i][1];
          } catch (error) {
            continue;
          }
        }

        // get Director
        if (spe[i].includes("Director")) {
          try {
            spe[i] = spe[i].split(":");
            director = spe[i][1];
          } catch (error) {
            continue;
          }
        }

        // get Casts
        if (spe[i].includes("Casts")) {
          try {
            spe[i] = spe[i].split(":");
            casts = spe[i][1];
          } catch (error) {
            continue;
          }
        }

        // get Episodes
        if (spe[i].includes("Episodes")) {
          try {
            spe[i] = spe[i].split(":");
            episodes = spe[i][1];
          } catch (error) {
            continue;
          }
        }
      }

      // push status ke data_film
      // data_film["Status"] = status;
      data_film.push({ value: status, type: String });
      // push released ke data_film
      // data_film["Released"] = released;
      data_film.push({ value: released, type: String });
      // push duration ke data_film
      // data_film["Duration"] = duration;
      data_film.push({ value: duration, type: String });
      // push country ke data_film
      // data_film["Country"] = country;
      data_film.push({ value: country, type: String });
      // push type ke data_film
      // data_film["Type"] = type;
      data_film.push({ value: type, type: String });
      // push director ke data_film
      // data_film["Director"] = director;
      data_film.push({ value: director, type: String });
      // push casts ke data_film
      // data_film["Casts"] = casts;
      data_film.push({ value: casts, type: String });
      // push episodes ke data_film
      // data_film["Episodes"] = episodes;
      data_film.push({ value: episodes, type: String });

      // ambil data link_detail jika type == "Movie" ambil dari class .eplister ul li a
      if (type.includes("Movie") == true) {
        let link_detail = await page.$eval(
          ".eplister ul li a",
          (links) =>
            // get link_detail link first
            links.href
        );
        // goto link_detail untuk mengambil data download link
        await page.goto(link_detail, {
          waitUntil: ["load"],
        });

        // get download link
        let download_link = await page.$$eval(".soraddlx div a", (links) =>
          links.map((link) => link.href)
        );

        // ambil tulisan , ambil link lalu pisah satu persatu
        let download_word = await page.$$eval(".soraddlx div", (links) =>
          links.map((link) => link.innerText)
        );

        try {
          // inisialisasi index_link
          let index_link = 0;
          // looping untuk mengambil data word pada download link
          download_word.slice(1).forEach((words, i) => {
            let [kualitas, ...temp_words] = words.split(" ");
            temp_words.forEach((word, j) => {
              // push data_film
              data_film.push({
                value: word + " " + kualitas,
                type: String,
              });

              data_film.push({
                value: download_link[index_link],
                type: String,
              });
              // temp_obj[word + " " + kualitas] = download_link[index_link];
              // data_film[temp_obj] = download_link[index_link];
              index_link++;
            });
          });
        } catch (error) {
          console.log("Error: ", error);
        }
      }
      dataXlsx.push(data_film);
    } catch (error) {
      console.log("Error: ", error);
    }
  }
  // console.log(dataXlsx);
  // const csv = new ObjectsToCsv(dataXlsx);

  // ubah dataXlsx menjadi file xlsx
  await writeXlsxFile(dataXlsx, { filePath: "Data/data.xlsx" });
  // await csv.toDisk("Data/data.csv");
  console.log("Data berhasil diambil");

  await browser.close();
})();
