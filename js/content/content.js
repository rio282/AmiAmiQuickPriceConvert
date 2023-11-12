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

    #priceTagClass = "newly-added-items__item__price";
    #currencyTagClass = "newly-added-items__item__price_state_currency";
    #currencyTable = {};

    constructor(currencyTable = {}) {
        this.#currencyTable = currencyTable;
    }

    #addItemsInto(master, items = []) {
        for (const item of items) {
            const strippedTitle = `${item.thumb_title.substring(0, 50)}...`;
            const itemLink = `https://www.amiami.com/eng/detail/?scode=${item.key}`;
            const itemTemplate = `
                <div class="card">
                    <div>
                        <p class="card-title">${strippedTitle}</p>
                        <button type="button" role="button" onclick="window.open('${itemLink}', '_blank')">Open</button>
                    </div>
                    <img src="https://img.amiami.com/${item.thumb_url}" alt="${item.thumb_alt}" width="150">
                </div>`;

            master.innerHTML += itemTemplate;
        }
    }

    #changePriceOfElement(element, value, currency) {
        // create currency tag
        let currencyTag = document.createElement("span");
        currencyTag.classList.add(this.#currencyTagClass);
        currencyTag.innerHTML = currency.toUpperCase();

        element.innerHTML = `${value}\n`;
        element.appendChild(currencyTag);
    }

    doPriceConversion(toCurrency = "eur", revert = false) {
        const priceElements = document.querySelectorAll(`.${this.#priceTagClass}`);

        if (revert) {
            for (let priceElement of priceElements) {
                if (!priceElement.originalPrice || !priceElement.originalCurrency) {
                    return;
                }

                this.#changePriceOfElement(priceElement, priceElement.originalPrice, priceElement.originalCurrency);
                priceElement.originalPrice = "";
                priceElement.originalCurrency = "";
            }
        } else {
            for (let priceElement of priceElements) {
                // check if already converted
                const fromCurrency = priceElement.querySelector(`.${this.#currencyTagClass}`).innerHTML.toLowerCase();
                if (fromCurrency === toCurrency) {
                    break;
                }

                // calculate new price
                const originalPrice = parseFloat(priceElement.innerHTML.split("\n")[0].trim().replaceAll(",", ""));
                const convertedPrice = (originalPrice * this.#currencyTable[`${fromCurrency}-${toCurrency}`]).toFixed(2);

                this.#changePriceOfElement(priceElement, convertedPrice, toCurrency);
                priceElement.originalPrice = originalPrice;
                priceElement.originalCurrency = fromCurrency;
            }
        }
    }

    displayHistoryTab(show = true) {
        const id = "historyTab";

        if (show) {
            // create history tab
            const historyTab = document.createElement("div");
            historyTab.id = id;
            historyTab.classList.add("row");
            historyTab.innerHTML = `
            <h1 class="title">Product Viewing History</h1>
            <div id="roller">
            </div>`;

            // add historyTab to top of page
            const topOfPage = document.querySelector(".body");
            topOfPage.prepend(historyTab);

            // filter logic
            const filter = ["FIGURE", "GOODS"];
            const items = Local.getItemsFromLocalStorage(filter);
            const roller = historyTab.querySelector("#roller");
            this.#addItemsInto(roller, items);
        } else {
            const historyTab = document.getElementById(id);
            historyTab.remove();
        }
    }
}
// --------------------------------------------------------------------------------------------------------------------
class Local {
    static #getKeysFromLocalStorage(filter = []) {
        const allowedKeyTypes = filter;

        let keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const keyType = key.split("-")[0];

            // check if the type of the key is valid (a.k.a. an item on amiami)
            if (allowedKeyTypes.includes(keyType)) {
                keys.push(key);
            }
        }

        return keys;
    }

    static getItemsFromLocalStorage(filter = ["FIGURE", "GOODS"]) {
        let items = [];

        const keys = this.#getKeysFromLocalStorage(filter);
        for (const key of keys) {
            let item = JSON.parse(localStorage.getItem(key));
            item.key = key;

            items.push(item);
        }

        return items;
    }
}

// --------------------------------------------------------------------------------------------------------------------
async function run(on = true) {
    const currency = new Currency();
    const dailyConversionTable = await currency.collectConversionTable();

    const manager = new ContentManager(dailyConversionTable);
    manager.doPriceConversion("eur", !on);
    manager.displayHistoryTab(on);
}

function init() {
    chrome.runtime.onMessage.addListener(async (message, sender) => await run(message === "ON"));
    console.log("Initialized content script!")
}

document.addEventListener("DOMContentLoaded", init);