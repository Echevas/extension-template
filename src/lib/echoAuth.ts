import type { EchoUser, AuthenticateUserResponse } from "@/types/echo";

export const authenticate = async (
  message: { params: { echoClientId: string; echoBaseUrl: string } },
  sendResponse: (response: {
    success: boolean;
    error?: string;
    echoUser?: EchoUser;
    tokenData?: AuthenticateUserResponse;
  }) => void,
) => {
  const redirectUrl = chrome.identity.getRedirectURL();
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  const echoClientId = message.params.echoClientId;
  const echoBaseUrl = message.params.echoBaseUrl;

  const authUrl =
    `${echoBaseUrl}/api/oauth/authorize` +
    `?response_type=code&client_id=${echoClientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUrl + "echo/callback")}` +
    `&code_challenge=${codeChallenge}&code_challenge_method=S256` +
    `&state=${crypto.randomUUID()}`;

  console.log("redirectUrl:", redirectUrl);
  console.log("authUrl:", authUrl);

  chrome.identity.launchWebAuthFlow(
    {
      url: authUrl,
      interactive: true,
    },
    async (redirectUrl) => {
      if (chrome.runtime.lastError) {
        console.error(
          "Error launching web auth flow:",
          chrome.runtime.lastError.message,
        );
        sendResponse({
          success: false,
          error: chrome.runtime.lastError.message,
        });
        return;
      }
      if (!redirectUrl || redirectUrl.includes("error")) {
        console.log("Error in web auth flow:", redirectUrl);
        sendResponse({ success: false, error: "Authentication failed" });
        return;
      }

      const url = new URL(redirectUrl);
      const queryParams = new URLSearchParams(url.search);
      const authorizationCode = queryParams.get("code");

      const error = queryParams.get("error");

      if (error) {
        console.log("Error in web auth flow:", error);
        sendResponse({ success: false, error });
        return;
      }

      if (authorizationCode) {
        const data = await exchangeCodeForToken(
          authorizationCode,
          codeVerifier,
          echoBaseUrl,
          echoClientId,
        );
        sendResponse({
          success: true,
          echoUser: data.tokenData.user,
          tokenData: data.tokenData,
        });
      } else {
        console.log("No authorization code found in redirect URL");
        sendResponse({ success: false, error: "No authorization code found" });
      }
    },
  );
};

export const refreshTokens = async (
  refreshToken: string,
  echoBaseUrl: string,
  echoClientId: string,
  sendResponse: (response: {
    success: boolean;
    error?: string;
    tokenData?: AuthenticateUserResponse;
  }) => void,
) => {
  try {
    const redirectUrl = chrome.identity.getRedirectURL();
    const response = await fetch(`${echoBaseUrl}/api/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: echoClientId,
        refresh_token: refreshToken,
        redirect_uri: redirectUrl + "echo/callback",
      }),
    });
    console.log("token exchange reponse status:", response.status);

    if (!response.ok) {
      const data = await response.json();
      console.log("token exchange error:", data);
      throw new Error(data.error || "Token exchange failed");
    }

    const tokenData = await response.json();
    const userData: AuthenticateUserResponse = {
      user: tokenData.user,
      accessToken: tokenData.access_token,
      accessTokenExpiresAt: Date.now() + tokenData.expires_in * 1000,
      refreshToken: tokenData.refresh_token,
      refreshTokenExpiresAt:
        Date.now() + tokenData.refresh_token_expires_in * 1000,
    };
    sendResponse({
      success: true,
      tokenData: userData,
    });
  } catch (error) {
    console.error("Error refreshing tokens:", error);
    throw error;
  }
};

const exchangeCodeForToken = async (
  authorizationCode: string,
  codeVerifier: string,
  echoBaseUrl: string,
  echoClientId: string,
) => {
  try {
    const redirectUrl = chrome.identity.getRedirectURL();
    const response = await fetch(`${echoBaseUrl}/api/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: echoClientId,
        code_verifier: codeVerifier,
        code: authorizationCode,
        redirect_uri: redirectUrl + "echo/callback",
      }),
    });

    console.log("token exchange reponse status:", response.status);

    if (!response.ok) {
      const data = await response.json();
      console.log("token exchange error:", data);
      throw new Error(data.error || "Token exchange failed");
    }

    const tokenData = await response.json();
    const userData: AuthenticateUserResponse = {
      user: tokenData.user,
      accessToken: tokenData.access_token,
      accessTokenExpiresAt: Date.now() + tokenData.expires_in * 1000,
      refreshToken: tokenData.refresh_token,
      refreshTokenExpiresAt:
        Date.now() + tokenData.refresh_token_expires_in * 1000,
    };
    return {
      success: true,
      tokenData: userData,
    };
  } catch (error) {
    console.error("Error exchanging code for token:", error);
    throw error;
  }
};

// Generate a PKCE-compliant code verifier
const generateCodeVerifier = (): string => {
  // Generate a random string between 43-128 characters
  const length = Math.floor(Math.random() * (128 - 43 + 1)) + 43;

  // Characters allowed in PKCE code verifier (unreserved set)
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";

  let result = "";
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);

  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }

  // Validate the generated verifier
  if (result.length < 43 || result.length > 128) {
    throw new Error(
      `Generated code verifier length (${result.length}) is outside the required range (43-128)`,
    );
  }

  // Validate characters (should only contain unreserved characters)
  const validChars = /^[A-Za-z0-9\-._~]+$/;
  if (!validChars.test(result)) {
    throw new Error("Generated code verifier contains invalid characters");
  }

  console.log(`Generated PKCE code verifier with length: ${result.length}`);
  return result;
};

const generateCodeChallenge = async (codeVerifier: string): Promise<string> => {
  return base64url(
    await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(codeVerifier),
    ),
  );
};

const base64url = (buffer: ArrayBuffer): string => {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
};
