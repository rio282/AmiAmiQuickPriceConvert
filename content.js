function doPriceConversion() {
    const priceTagClass = ".newly-added-items__item__price";
    const priceCurrencyTagClass = ".newly-added-items__item__price_state_currency";
    const conversionRates = {
        "jpy-eur": 0.0061965491
    };

    const fromCurrency = "jpy";
    const toCurrency = "eur";

    const firstElement = document.querySelector(priceCurrencyTagClass);
    if (!firstElement || firstElement.innerHTML.includes(toCurrency)) {
        // checks if we already converted so that we dont convert again
        return;
    }

    const priceElements = document.querySelectorAll(priceTagClass);
    for (let priceElement of priceElements) {
        // calculate new price
        const originalPrice = parseFloat(priceElement.innerHTML.split("\n")[0].trim().replaceAll(",", ""));
        const convertedPrice = (originalPrice * conversionRates[`${fromCurrency}-${toCurrency}`]).toFixed(2);

        // create currency tag
        let currencyTag = document.createElement("span");
        currencyTag.classList.add(priceCurrencyTagClass);
        currencyTag.innerHTML = toCurrency.toUpperCase();

        // replace content of priceElement
        priceElement.innerHTML = `${convertedPrice}\n`;
        priceElement.appendChild(currencyTag);
    }
}

function addHistoryTab() {
    if (document.querySelector("#historyTab")) {
        return;
    }

    const topOfPage = document.querySelector(".body");

    // add history to top of page
    const historyTab = document.createElement("div");
    historyTab.id = "historyTab";
    historyTab.classList.add("historyTab");
    topOfPage.prepend(historyTab);

    // create event listeners for each visited item OR read from history
    // TODO
}

function main() {
    doPriceConversion();
    addHistoryTab();
}

main();
