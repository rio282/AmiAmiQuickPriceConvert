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

    doPriceConversion(undo = false) {
        const priceTagClass = "newly-added-items__item__price";
        const priceCurrencyTagClass = "newly-added-items__item__price_state_currency";

        if (!undo) {
            const priceElements = document.querySelectorAll(`.${priceTagClass}`);
            for (let priceElement of priceElements) {
                // calculate new price
                const toCurrency = "eur";
                const fromCurrency = priceElement.querySelector(`.${priceCurrencyTagClass}`).innerHTML.toLowerCase();
                const originalPrice = parseFloat(priceElement.innerHTML.split("\n")[0].trim().replaceAll(",", ""));
                const convertedPrice = (originalPrice * this.#currencyTable[`${fromCurrency}-${toCurrency}`]).toFixed(2);

                // create new price element
                let newPriceElement = document.createElement("p");
                newPriceElement.classList.add(priceTagClass);

                // create currency tag
                let currencyTag = document.createElement("span");
                currencyTag.classList.add(priceCurrencyTagClass);
                currencyTag.innerHTML = toCurrency.toUpperCase();

                // replace content of newPriceElement
                newPriceElement.innerHTML = `${convertedPrice}\n`;
                newPriceElement.appendChild(currencyTag);

                // add new element into text div and hide the old one
                priceElement.parentNode.appendChild(newPriceElement);
                priceElement.classList.add("hidden");
            }
        } else {
            // TODO
            return;
        }
    }

    displayHistoryTab(show = true) {
        if (show) {
            // add history to top of page
            const historyTab = document.createElement("div");
            historyTab.id = "historyTab";
            historyTab.classList.add("historyTab");

            const topOfPage = document.querySelector(".body");
            topOfPage.prepend(historyTab);
        } else {

        }
    }
}

// --------------------------------------------------------------------------------------------------------------------
async function run(on = true) {
    const currency = new Currency();
    const dailyConversionTable = await currency.collectConversionTable();

    const manager = new ContentManager(dailyConversionTable);
    manager.doPriceConversion(on);
    manager.displayHistoryTab(on);

    console.log(`Set AmiAmiQuickPriceConvert to: '${new String(on).toUpperCase()}'`);
}

function init() {
    chrome.runtime.onMessage.addListener(
        
    );

    console.log("Initialized content script!")
}

document.addEventListener("DOMContentLoaded", init);