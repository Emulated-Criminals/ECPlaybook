---
title: Vim
date: 2020-11-25
background: bg-[#46933f]
tags:
  - vi
  - text
  - editor
  - terminal
  - shortcut
categories:
  - IDEs
intro: |
  A useful collection of [Vim](http://www.vim.org/) 8.2 quick reference cheat sheets to help you learn vim editor faster.
plugins:
  - copyCode
---

## Getting Started

### Modes

| Shortcut {.shortcut} | Description |
| -------------------- | :------------------ |
| [Esc] | Normal mode (navigate/commands) |
| [i] | Insert before cursor |
| [a] | Insert after cursor |
| [v] | Visual select |

### Movement

| Shortcut {.shortcut} | Description |
| -------------------- | :------------------ |
| [h] _\|_ [j] _\|_ [k] _\|_ [l] | Left/Down/Up/Right |
| [w] _/_ [b] | Next/Previous word |
| [0] _/_ [$] | Start/End of line |
| [g][g] _/_ [G] | First/Last line |
| [<C-u>] _/_ [<C-d>] | Half-page up/down |

### Insert and Edit

| Shortcut {.shortcut} | Description |
| -------------------- | :------------------ |
| [o] _/_ [O] | New line below/above |
| [x] | Delete character |
| [d][d] | Delete line |
| [d][w] | Delete word |
| [c][w] | Change word |
| [r] | Replace one character |

### Copy and Paste

| Shortcut {.shortcut} | Description |
| -------------------- | :------------------ |
| [y][y] | Copy line |
| [y][w] | Copy word |
| [p] _/_ [P] | Paste after/before |

### Undo and Redo

| Shortcut {.shortcut} | Description |
| -------------------- | :------------------ |
| [u] | Undo |
| [<C-r>] | Redo |

### Search

| Shortcut {.shortcut} | Description |
| -------------------- | :------------------ |
| [/]text | Search forward |
| [?]text | Search backward |
| [n] _/_ [N] | Next/Previous match |
| [*] | Search word under cursor |

### Save and Exit

| Shortcut {.shortcut} | Description |
| -------------------- | :------------------ |
| [:][w] | Save |
| [:][q] | Quit |
| [:][w][q] _\|_ [:][x] | Save and quit |
| [:][q][!] | Quit without saving |

### Basic File Actions

| Shortcut {.shortcut} | Description |
| -------------------- | :------------------ |
| [:][e] [f][i][l][e] | Open file |
| [:][w] [f][i][l][e] | Save as file |
