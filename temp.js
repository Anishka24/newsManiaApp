const pup = require("puppeteer");
let fs = require("fs");

async function main() {
    let browser = await pup.launch({
        headless: true, // Headless true for automation
        defaultViewport: false,
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    let headlines = {
        "ET": {},
        "Hindu": {},
        "HT": {},
        "TOI": {},
        "covid": {}
    };

    let pages = await browser.pages();
    let tab = pages[0];

    // Economic Times
    await tab.goto("https://economictimes.indiatimes.com/");
    await tab.waitForSelector(".latestTopstry.flt", { visible: true });
    let ETnews = await tab.$$(".latestTopstry.flt");
    for (let i = 0; i < ETnews.length; i++) {
        let headline = await tab.evaluate(ele => ele.getAttribute("alt"), ETnews[i]);
        headlines["ET"][i] = headline;
    }

    let ETnews2 = await tab.$$(".smallImg.flt");
    let headline = await tab.evaluate(ele => ele.getAttribute("alt"), ETnews2[0]);
    headlines["ET"][ETnews.length] = headline;
    headlines["ET"]["img"] = await tab.evaluate(ele => ele.getAttribute("src"), ETnews[2]);
    headlines["Hindu"]["img"] = await tab.evaluate(ele => ele.getAttribute("src"), ETnews[3]);
    headlines["HT"]["img"] = await tab.evaluate(ele => ele.getAttribute("src"), ETnews[4]);
    headlines["TOI"]["img"] = await tab.evaluate(ele => ele.getAttribute("src"), ETnews[1]);

    // The Hindu
    await tab.goto("https://www.thehindu.com/");
    await tab.waitForSelector(".story-card-news h3", { visible: true });
    let HinduNews1 = await tab.$$(".story-card-news h3");
    await tab.waitForSelector(".story-card-news h2", { visible: true });
    let HinduNews2 = await tab.$$(".story-card-news h2");
    for (let i = 0; i < 7; i++) {
        let ele = i < HinduNews1.length ? HinduNews1[i] : HinduNews2[i - HinduNews1.length];
        let headline = await tab.evaluate(ele => ele.textContent.trim(), ele);
        headlines["Hindu"][i] = headline;
    }

    // Hindustan Times
    await tab.goto("https://www.hindustantimes.com/");
    await tab.waitForSelector(".hdg3 a", { visible: true });
    let HTNews = await tab.$$(".hdg3 a");
    for (let i = 0; i < 7; i++) {
        let headline = await tab.evaluate(ele => ele.textContent.trim(), HTNews[i]);
        headlines["HT"][i] = headline;
    }

    // Times of India
    await tab.goto("https://timesofindia.indiatimes.com/india");
    await tab.waitForSelector("#c_wdt_list_1 .w_tle a", { visible: true });
    let TOINews = await tab.$$("#c_wdt_list_1 .w_tle a");
    for (let i = 0; i < 7; i++) {
        let headline = await tab.evaluate(ele => ele.textContent.trim(), TOINews[i]);
        headlines["TOI"][i] = headline;
    }

    // Covid Data
    await tab.goto("https://www.mygov.in/covid-19");
    let cases = await tab.$$(".icount");
    for (let i = 0; i < 4; i++) {
        let count = await tab.evaluate(ele => ele.textContent.trim(), cases[i]);
        headlines["covid"][i] = count;
    }

    await browser.close();

    // Write to finalData.js
    fs.writeFileSync("finalData.js", "module.exports = " + JSON.stringify([headlines], null, 2));
}

main();
