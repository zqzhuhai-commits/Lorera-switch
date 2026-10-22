/* config.h -- Lorera Switch wrapper configuration
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

#ifndef __CONFIG_H__
#define __CONFIG_H__

// Memory reserved for the two .so load images. The rest of the heap backs both
// engine malloc and mesa GPU textures (field maps need the bulk) -- see
// __libnx_initheap in main.c.
#define SO_HEAP_RESERVE_MB 96

// The engine (libchrono.so) and its C++ runtime (libc++_shared.so). The Java-side
// The wrapper drives the GameMaker JNI entry points directly.
// entry points directly.
#define SO_NAME    "libyoyo.so"
#define SOCPP_NAME "libc++_shared.so"

// Loose game assets (the APK's assets/ folder), served via the fake AAssetManager.
// The default base is the CWD's assets/ (SD card mode). In single-file NSP
// mode the loader mounts its own RomFS and switches this to "romfs:/assets".
#define ASSETS_DIR "assets"

extern const char *g_asset_dir; // runtime asset base (ASSETS_DIR or "romfs:/assets")
extern int g_romfs_mode;        // 1 = game data served from the NSP's embedded RomFS

#define CONFIG_NAME "config.txt"
#define LOG_NAME    "debug.log"
#define CRASH_NAME  "crash.log"

#define DEBUG_LOG 1

extern int screen_width;
extern int screen_height;

// Default UI language (see lang_index in main.c for the supported codes).
#define LANG_DEFAULT "en"

typedef struct {
  int screen_width;
  int screen_height;
  char language[8];
} Config;

extern Config config;

int read_config(const char *file);
int write_config(const char *file);

#endif
