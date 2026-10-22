/* error.c -- error handler
 *
 * Copyright (C) 2021 fgsfds, Andy Nguyen
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

#include <switch.h>
#include <stdlib.h>
#include <stdio.h>
#include <stdarg.h>
#include <string.h>
#include <signal.h>
#include <fcntl.h>
#include <unistd.h>

#include "util.h"
#include "error.h"
#include "config.h"

// ---------------------------------------------------------------------------
// Crash handler: records which signal killed the process into crash.log
// (CWD = game directory) so it can be correlated with the last debug.log line
// (loader phase). devkitA64's newlib only exposes BSD-style signal(), so no
// register dump here; the faulting PC comes from the Atmosphère crash report
// (sdmc:/atmosphere/crash_reports/). Only async-signal-safe calls are used.
// Install after chdir() in main().
// ---------------------------------------------------------------------------

static int s_crash_fd = -1;

static void crash_handler(int sig) {
  const char *name =
      sig == SIGSEGV ? "SIGSEGV" : sig == SIGBUS ? "SIGBUS" : sig == SIGABRT ? "SIGABRT" : "?";
  char buf[96];
  int n = snprintf(buf, sizeof buf, "crash: signal %d (%s)\n", sig, name);
  if (s_crash_fd >= 0) {
    write(s_crash_fd, buf, (size_t)n);
    fsync(s_crash_fd);
  }
}

void install_crash_handler(void) {
  s_crash_fd = open(CRASH_NAME, O_CREAT | O_WRONLY | O_TRUNC, 0644);
  signal(SIGSEGV, crash_handler);
  signal(SIGBUS, crash_handler);
  signal(SIGABRT, crash_handler);
}

void fatal_error(const char *fmt, ...) {
  char msg[512];
  va_list list;
  va_start(list, fmt);
  vsnprintf(msg, sizeof msg, fmt, list);
  va_end(list);
  debugPrintf("yoyo_nx: FATAL: %s\n", msg);

  PadState pad;
  padConfigureInput(1, HidNpadStyleSet_NpadStandard);
  padInitializeDefault(&pad);

  consoleInit(NULL);

  printf("%s", msg);
  printf("\n\nPress A to exit.");

  consoleUpdate(NULL);

  while (appletMainLoop()) {
    padUpdate(&pad);
    const u64 keys = padGetButtonsDown(&pad);
    if (keys & HidNpadButton_A) break;
  }

  consoleExit(NULL);
  exit(1);
}
