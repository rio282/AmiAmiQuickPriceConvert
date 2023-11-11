function handleState(tab, state) {
    if (state === "ON") {
        chrome.tabs.insertCSS({
            target: { tabId: tab.id },
            files: ["historyTab.css"]
        });
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["content.js"]
        });
    } else if (state === "OFF") {
        chrome.tabs.removeCSS({
            target: { tabId: tab.id },
            files: ["historyTab.css"]
        });
    } else {
        console.error(`Incorrect state: ${state}`);
    }
}

function prepareBadge() {
    const amiamiUrl = "https://www.amiami.com/";

    // set default badge to OFF
    chrome.runtime.onInstalled.addListener(() => {
        chrome.action.setBadgeText({
            text: "OFF",
        });
    });

    // on badge click
    chrome.action.onClicked.addListener(async (tab) => {
        if (!tab.url.startsWith(amiamiUrl)) {
            // if not ami ami we cant do anything
            return;
        }

        const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
        const nextState = (prevState === "ON") ? "OFF" : "ON";
        await chrome.action.setBadgeText({
            tabId: tab.id,
            text: nextState,
        });

        handleState(tab, nextState);
    });
}

prepareBadge();
