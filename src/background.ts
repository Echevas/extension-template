import { authenticate, refreshTokens } from "@/lib/echoAuth";

// These are the actions necessary to maintain a proper authenticated connection with Echo.
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    switch (message.action) {
        case "AUTHENTICATE":
            console.log("Authentication request");
            break;
        case "GET_USER":
            console.log("Getting user");
            break;
        case "GET_TOKEN":
            console.log("Getting token");
            break;
        case "REFRESH_TOKEN":
            console.log("Refreshing token");
            break;
        case "CEHCK_AUTH":
            console.log("Checking auth");
            break;
        case "SIGN_OUT":
            console.log("Signing out");
            break;
        default:
            console.log("Unknown action");
    }
})