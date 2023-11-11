class Currency {

    #requestUrl = `https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml`;
    #ratesToday = {};

    constructor() {
        this.#ratesToday["jpy-eur"] = 0.0061965491;
    }

    async collectConversionTable() {
        if (this.#ratesToday == {}) {
            const url = "http://www.bing.com/HPImageArchive.aspx?format=xml&idx=0&n=1";
            const http = new XMLHttpRequest();
            http.open("GET", url);
            http.send();
            http.onreadystatechange = (e) => console.log(http.responseText);
        }

        return this.#ratesToday;
    }
}
// --------------------------------------------------------------------------------------------------------------------
class ContentManager {

    #currencyTable = {};

    constructor(currencyTable = {}) {
        this.#currencyTable = currencyTable;
    }

    doPriceConversion(toCurrency = "eur") {
        const priceTagClass = "newly-added-items__item__price";
        const currencyTagClass = "newly-added-items__item__price_state_currency";

        const priceElements = document.querySelectorAll(`.${priceTagClass}`);
        for (let priceElement of priceElements) {
            // check if already converted
            const fromCurrency = priceElement.querySelector(`.${currencyTagClass}`).innerHTML.toLowerCase();
            if (fromCurrency === toCurrency) {
                break;
            }

            // calculate new price
            const originalPrice = parseFloat(priceElement.innerHTML.split("\n")[0].trim().replaceAll(",", ""));
            const convertedPrice = (originalPrice * this.#currencyTable[`${fromCurrency}-${toCurrency}`]).toFixed(2);

            // create currency tag
            let currencyTag = document.createElement("span");
            currencyTag.classList.add(currencyTagClass);
            currencyTag.innerHTML = toCurrency.toUpperCase();

            // replace content of newPriceElement
            priceElement.innerHTML = `${convertedPrice}\n`;
            priceElement.appendChild(currencyTag);
        }
    }

    displayHistoryTab(show = true) {
        const id = "historyTab";

        if (show) {
            // add history to top of page
            const historyTab = document.createElement("div");
            historyTab.id = id;
            historyTab.classList.add("historyTab");

            const topOfPage = document.querySelector(".body");
            topOfPage.prepend(historyTab);
        } else {
            const historyTab = document.getElementById(id);
            historyTab.remove();
        }
    }
}

// --------------------------------------------------------------------------------------------------------------------
async function run(on = true) {
    const currency = new Currency();
    const dailyConversionTable = await currency.collectConversionTable();

    const manager = new ContentManager(dailyConversionTable);
    manager.doPriceConversion("eur");
    manager.displayHistoryTab(on);
}

function init() {
    chrome.runtime.onMessage.addListener(async (message, sender) => await run(message === "ON"));
    console.log("Initialized content script!")
}

document.addEventListener("DOMContentLoaded", init);