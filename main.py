import json
import os

import decky

SETTINGS_FILE = os.path.join(decky.DECKY_PLUGIN_SETTINGS_DIR, "settings.json")


class Plugin:
    async def get_settings(self) -> dict:
        try:
            with open(SETTINGS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except FileNotFoundError:
            return {}
        except Exception as e:
            decky.logger.error(f"Could not read settings: {e}")
            return {}

    async def set_settings(self, settings: dict) -> bool:
        try:
            os.makedirs(decky.DECKY_PLUGIN_SETTINGS_DIR, exist_ok=True)
            tmp = SETTINGS_FILE + ".tmp"
            with open(tmp, "w", encoding="utf-8") as f:
                json.dump(settings, f, indent=2)
            os.replace(tmp, SETTINGS_FILE)
            return True
        except Exception as e:
            decky.logger.error(f"Could not save settings: {e}")
            return False

    async def _main(self):
        decky.logger.info("Xbox Dashboard loaded")

    async def _unload(self):
        decky.logger.info("Xbox Dashboard unloaded")
