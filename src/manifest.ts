import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest({
    manifest_version: 3,
    version: "1.0",
    name: "Echo Extension Template",
    description: "Template to start an echo chrome extension with the proper auth to use AI resources like OpenAI, Anthropic, and more.",
    host_permissions: ["<all_urls>"],
    background: {
        service_worker: "src/background.ts",
        type: "module",
    },
    action: {
        default_popup: "src/echo-popup/index.html",
    },
    permissions: ["identity", "storage"],
})