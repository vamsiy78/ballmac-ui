import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "i18n",
  type: "registry:lib",
  title: "i18n Utilities",
  description: "Translate every built-in string and set the locale in one place: I18nProvider takes a messages object, useMessages looks text up, useLocale feeds Intl formatting.",
  category: "foundation",
  tags: ["i18n", "translation", "locale", "internationalization", "arabic", "labels", "plural"],
  files: [{ path: "lib/i18n.tsx" }],
  ai: {
    summary: "Wrap the app in <I18nProvider locale messages>. Every Ballmac component looks its built-in text up by key with the English text as the default, so nothing breaks when a key is missing. The key list is at /i18n/en.json.",
    whenToUse: ["Localising an app that uses Ballmac components", "Setting one locale for dates, numbers and sorting"],
    whenNotToUse: ["Your own app copy: use your i18n library (next-intl, i18next, Lingui) and pass its output in through props or messages"],
    customization: ["messages: a flat key to text object, with {name} placeholders and _one/_few/_many/_other plural suffixes", "locale: a BCP 47 tag such as ar, he, fa-IR, de-DE"],
  },
  version: "1.0.0",
  updated: "2026-10-02",
})
