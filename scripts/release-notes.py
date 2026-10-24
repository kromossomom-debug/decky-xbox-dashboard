#!/usr/bin/env python3
"""Prints the release notes for one version: its CHANGELOG.md section plus install steps.

Usage: scripts/release-notes.py 0.0.5-alpha   (a leading "v" is fine)
Exits with status 1 if CHANGELOG.md has no section for that version.
"""

import re
import sys
from pathlib import Path

INSTALL = """
## Install
1. Download **xbox-dashboard.zip** below.
2. On the Deck: Quick Access (`…`) → **Decky** → ⚙️ → **General** → turn on **Developer mode**.
3. **Developer → Install Plugin from ZIP** and pick the file.

Requires [Decky Loader](https://github.com/SteamDeckHomebrew/decky-loader) 3.x.
"""


def main() -> int:
    version = sys.argv[1].removeprefix("v")
    changelog = (Path(__file__).resolve().parent.parent / "CHANGELOG.md").read_text(encoding="utf-8")
    match = re.search(
        rf"^## \[{re.escape(version)}\][^\n]*\n(.*?)(?=^## \[|^\[[^\]]+\]: |\Z)",
        changelog,
        flags=re.S | re.M,
    )
    if not match:
        print(f"No CHANGELOG.md section for {version}", file=sys.stderr)
        return 1
    # GitHub turns every newline in release notes into a line break, so join the wrapped lines of
    # each paragraph and list item back together.
    body = re.sub(r"\n[ \t]+(?=\S)", " ", match.group(1).strip())
    print(body)
    print(INSTALL)
    return 0


if __name__ == "__main__":
    sys.exit(main())
