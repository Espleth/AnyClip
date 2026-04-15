# AnyClip

Chrome extension for quick URL copy/paste/cut via keyboard shortcuts.

## Features

| Shortcut         | Action                                     |
| ---------------- | ------------------------------------------ |
| `Ctrl+Shift+C` | Copy current tab URL to clipboard          |
| `Ctrl+Shift+V` | Open clipboard content as URL in a new tab |
| `Ctrl+Shift+X` | Copy current tab URL and close the tab     |

On macOS use `Cmd` instead of `Ctrl`.

## Installation

1. Open `chrome://extensions/`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `AnyClip` folder

## Shortcut setup

`Ctrl+Shift+C` conflicts with Chrome's built-in DevTools shortcut (Inspect Element). Because of this, it may not work on some pages.

To fix this:

1. Go to chrome://extensions/shortcuts 
2. Find **AnyClip → Copy current tab URL to clipboard**
3. Click the pencil icon and re-assign `Ctrl+Shift+C` (or choose a different shortcut)
4. In the dropdown next to it, change **In Chrome** to **Global**

Setting a shortcut to **Global** makes it work system-wide — even when Chrome is not focused, and on internal `chrome://` pages where extensions normally can't intercept keys.

You can do the same for the other two shortcuts if needed.
