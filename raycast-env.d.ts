/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Provider - Choice API Provider */
  "provider": "openai" | "raycast" | "azure" | "palm2",
  /** API Key - Enter your API Key for your provider,  Type 'none' if your entrypoint do not require an API key */
  "apikey": string,
  /** API Entrypoint - Enter your provider entrypoint, If your provider does not require an entrypoint, it will be ignored. */
  "entrypoint": string,
  /** API Model - Choose an OpenAI API model, which is only available when using the OpenAI provider */
  "apiModel"?: "gpt-3.5-turbo" | "gpt-3.5-turbo-0301" | "gpt-4" | "gpt-4-0314" | "gpt-4-32k" | "gpt-4-32k-0314",
  /** Translate to - Choice First language */
  "toLang": "en" | "zh-Hans" | "zh-Hant" | "yue" | "lzh" | "jdbhw" | "xdbhw" | "ja" | "ko" | "fr" | "de" | "es" | "it" | "ru" | "pt" | "nl" | "pl" | "ar" | "af" | "am" | "az" | "be" | "bg" | "bn" | "bs" | "ca" | "ceb" | "co" | "cs" | "cy" | "da" | "el" | "eo" | "et" | "eu" | "fa" | "fi" | "fj" | "fy" | "ga" | "gd" | "gl" | "gu" | "ha" | "haw" | "he" | "hi" | "hmn" | "hr" | "ht" | "hu" | "hy" | "id" | "ig" | "is" | "jw" | "ka" | "kk",
  /** Auto-load Selected - Load selected text from your frontmost application to the search bar automatically */
  "isAutoLoadSelected"?: boolean,
  /**  - Load selected text from your frontmost application to the search bar automatically */
  "isAutoLoadClipboard"?: boolean,
  /**  - Auto start translation if search bar auto-fill. for selected or clipboard prefer using "Query XXX" commands. */
  "isAutoStart"?: boolean,
  /** Max History Size - Enter a *number* as max history size */
  "maxHistorySize"?: string,
  /** Use Proxy - Each request will be passed through the proxy */
  "useProxy"?: boolean,
  /** Socks5 Proxy Host - Sever address of the proxy */
  "proxyHost"?: string,
  /** Socks5 Proxy Port - Server port of the proxy */
  "proxyPort"?: string,
  /** Socks5 Proxy Username - Leave empty if doesn't have */
  "proxyUsername"?: string,
  /** Socks5 Proxy Password - Leave empty if doesn't have */
  "proxyPassword"?: string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `translate` command */
  export type Translate = ExtensionPreferences & {}
  /** Preferences accessible in the `polishing` command */
  export type Polishing = ExtensionPreferences & {}
  /** Preferences accessible in the `summarize` command */
  export type Summarize = ExtensionPreferences & {}
  /** Preferences accessible in the `what` command */
  export type What = ExtensionPreferences & {}
  /** Preferences accessible in the `selected` command */
  export type Selected = ExtensionPreferences & {
  /** Query Mode - Choice a mode to query using this command */
  "mode"?: "translate" | "polishing" | "summarize" | "what"
}
  /** Preferences accessible in the `clipboard` command */
  export type Clipboard = ExtensionPreferences & {
  /** Query Mode - Choice a mode to query using this command */
  "mode"?: "translate" | "polishing" | "summarize" | "what"
}
  /** Preferences accessible in the `ocr` command */
  export type Ocr = ExtensionPreferences & {
  /** Query Mode - Choice a mode to query using this command */
  "mode"?: "translate" | "polishing" | "summarize" | "what",
  /** Prefer Language - Prefer language to detect */
  "language"?: "en-US" | "fr-FR" | "it-IT" | "de-DE" | "pt-BR" | "zh-Hans" | "zh-Hant",
  /** Level - A value that determines whether the request prioritizes accuracy or speed in text recognition. */
  "level"?: "accurate" | "fast",
  /** Custom Words - An array of strings to supplement the recognized languages at the word-recognition stage. */
  "customWords"?: string
}
}

declare namespace Arguments {
  /** Arguments passed to the `translate` command */
  export type Translate = {}
  /** Arguments passed to the `polishing` command */
  export type Polishing = {}
  /** Arguments passed to the `summarize` command */
  export type Summarize = {}
  /** Arguments passed to the `what` command */
  export type What = {}
  /** Arguments passed to the `selected` command */
  export type Selected = {}
  /** Arguments passed to the `clipboard` command */
  export type Clipboard = {}
  /** Arguments passed to the `ocr` command */
  export type Ocr = {}
}
