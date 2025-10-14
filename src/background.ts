import { authenticate, refreshTokens } from "@/lib/echoAuth";

// These are the actions necessary to maintain a proper authenticated connection with Echo.
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    console.log("Message received:", message);
    switch (message.action) {
        case "AUTHENTICATE":
            console.log("Authentication request");
            authenticate(message, async (response) => {
                if (response.success && response.echoUser && response.tokenData) {
                  // Store authentication data in chrome storage
                  await chrome.storage.local.set({
                    echo_user: response.echoUser,
                    echo_access_token: response.tokenData.accessToken,
                    echo_refresh_token: response.tokenData.refreshToken,
                    echo_access_token_expires_at:
                      response.tokenData.accessTokenExpiresAt,
                    echo_refresh_token_expires_at:
                      response.tokenData.refreshTokenExpiresAt,
                  });
                }
                console.log("Successfully authenticated");
                sendResponse(response);
              });
            break;
        case "GET_TOKEN":
            console.log("Getting token");
            chrome.storage.local.get(
                [
                  "echo_access_token",
                  "echo_access_token_expires_at",
                  "echo_refresh_token",
                  "echo_refresh_token_expires_at",
                ],
                (result) => {
                  const now = Date.now();
                  if (
                    result.echo_access_token &&
                    result.echo_access_token_expires_at &&
                    now < result.echo_access_token_expires_at
                  ) {
                    sendResponse({ token: result.echo_access_token });
                  } else {
                    refreshTokens(
                      result.echo_refresh_token,
                      message.params.echoBaseUrl,
                      message.params.echoClientId,
                      async (response) => {
                        if (response.success && response.tokenData) {
                          chrome.storage.local.set({
                            echo_access_token: response.tokenData.accessToken,
                            echo_access_token_expires_at:
                              response.tokenData.accessTokenExpiresAt,
                            echo_refresh_token: response.tokenData.refreshToken,
                            echo_refresh_token_expires_at:
                              response.tokenData.refreshTokenExpiresAt,
                          });
                          sendResponse({ token: response.tokenData.accessToken });
                        } else {
                          console.error("Error refreshing tokens:", response.error);
                          sendResponse({ token: null });
                        }
                      },
                    );
                  }
                },
              );
            break;
        case "REFRESH_TOKEN":
            console.log("Refreshing token");
            chrome.storage.local.get(
                [
                  "echo_access_token",
                  "echo_access_token_expires_at",
                  "echo_refresh_token",
                  "echo_refresh_token_expires_at",
                ],
                (result) => {
                  const now = Date.now();
                  if (
                    result.echo_access_token &&
                    result.echo_access_token_expires_at &&
                    now < result.echo_access_token_expires_at
                  ) {
                    sendResponse({ token: result.echo_access_token });
                  } else {
                    refreshTokens(
                      result.echo_refresh_token,
                      message.params.echoBaseUrl,
                      message.params.echoClientId,
                      async (response) => {
                        if (response.success && response.tokenData) {
                          chrome.storage.local.set({
                            echo_access_token: response.tokenData.accessToken,
                            echo_access_token_expires_at:
                              response.tokenData.accessTokenExpiresAt,
                            echo_refresh_token: response.tokenData.refreshToken,
                            echo_refresh_token_expires_at:
                              response.tokenData.refreshTokenExpiresAt,
                          });
                          sendResponse({
                            success: true,
                            token: response.tokenData.accessToken,
                          });
                        } else {
                          console.error("Error refreshing tokens:", response.error);
                          sendResponse({ token: null });
                        }
                      },
                    );
                  }
                },
              );
              break;
        case "CEHCK_AUTH":
            console.log("Checking auth");
            chrome.storage.local.get(
                ["echo_user", "echo_refresh_token", "echo_refresh_token_expires_at"],
                (result) => {
                  const now = Date.now();
                  const isAuthenticated =
                    result.echo_user &&
                    result.echo_refresh_token &&
                    result.echo_refresh_token_expires_at &&
                    now < result.echo_refresh_token_expires_at;
        
                  sendResponse({
                    isAuthenticated,
                    user: isAuthenticated ? result.echo_user : null,
                    token: isAuthenticated ? result.echo_access_token : null,
                  });
                },
              );
            break;
        case "SIGN_OUT":
            console.log("Signing out");
            chrome.storage.local.remove(
                [
                  "echo_user",
                  "echo_access_token",
                  "echo_refresh_token",
                  "echo_access_token_expires_at",
                  "echo_refresh_token_expires_at",
                ],
                () => {
                  sendResponse({ success: true });
                },
              );
            break;
        default:
            console.log("Unknown action");
    }
})