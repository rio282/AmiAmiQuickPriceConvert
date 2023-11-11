async function handleState(tab, state) {
    if (state === "ON") {
        chrome.scripting.insertCSS({
            target: { tabId: tab.id },
            files: ["../../css/content.css"]
        });
    } else if (state === "OFF") {
        chrome.scripting.removeCSS({
            target: { tabId: tab.id },
            files: ["../../css/content.css"]
        });
    } else {
        console.error(`Incorrect state: ${state}`);
        return;
    }

    // set badge text
    await chrome.action.setBadgeText({
        tabId: tab.id,
        text: nextState,
    });

    // send message to content script
    chrome.tabs.sendMessage({
        tabId: tab.id,
        message: state,
    });
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
        await handleState(tab, nextState);
    });
}

prepareBadge();
