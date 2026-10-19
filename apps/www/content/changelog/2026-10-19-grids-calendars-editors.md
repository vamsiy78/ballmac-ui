---
title: "Data grid, drag and drop, event calendar, rich text and more"
date: 2026-10-19
seq: 1
tags: [components, docs]
summary: "Nine hard components that most libraries leave to you: a virtualized data grid, sortable lists and boards, an event calendar, a rich text editor, mentions, QR codes, an emoji picker, an image cropper and a native select."
shot: /components/data-grid
imageAlt: "The data grid component page, with an editable table of sprint tasks."
---

### New

- `data-grid` is a spreadsheet-style grid for tens of thousands of rows. Only visible rows are drawn, cells edit in place with validation, headings sort and resize, columns pin, and it follows the ARIA grid keyboard pattern, with undo, redo and paste from a spreadsheet.
- `sortable` reorders lists, grids and boards with columns, by pointer, touch or keyboard. It reads out what moved, in the page's language, and has move buttons for people who cannot drag.
- `event-calendar` has month, week, day and agenda views. Overlapping events sit side by side, multi-day events run as bars, and people drag events to move or resize them and drag across empty time to make one. Alt and the arrow keys do the same from the keyboard.
- `rich-text-editor` is built on Tiptap: headings, bold, lists, checklists, quotes, code and links, a toolbar you drive with the arrow keys, a "/" menu for blocks, a link popover, a character limit and HTML output.
- `mention-input`, `qr-code`, `emoji-picker`, `image-cropper` and `native-select` complete the set. Mentions keep the id of who was mentioned, QR codes come as accessible SVG with shapes and a logo slot, the emoji picker loads its data on first use in any Emojibase language, the cropper exports the result as a file, and the native select keeps the phone's own picker.

### Improved

- `calendar-dates` is a small dependency-free helper for weeks that start where the locale says, month grids and daylight-saving-safe day math.
