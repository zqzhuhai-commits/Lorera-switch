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

// ---------------------------------------------------------------------------
// Crash handler: dumps signal + PC/LR/SP/FP and a frame-pointer walk to
// crash.log (CWD = game directory). Only async-signal-safe calls are used, so
// the dump survives the faulting process. Install after chdir() in main().
// ---------------------------------------------------------------------------

static int s_crash_fd = -1;

static uint64_t safe_read64(uint64_t addr) {
  if (addr == 0 || (addr & 7) != 0) return 0;
  MemoryInfo mi;
  u32 page_info;
  if (R_FAILED(svcQueryMemory(&mi, &page_info, addr))) return 0;
  if (mi.type == 0 || (mi.perm & Perm_R) == 0) return 0;
  if (addr + 8 > mi.addr + mi.size) return 0;
  return *(volatile uint64_t *)addr;
}

static void crash_handler(int sig, siginfo_t *si, void *uctx_raw) {
  ucontext_t *uc = (ucontext_t *)uctx_raw;
  const uint64_t pc = uc->uc_mcontext.pc;
  const uint64_t lr = uc->uc_mcontext.regs[30];
  const uint64_t fp = uc->uc_mcontext.regs[29];
  const uint64_t sp = uc->uc_mcontext.sp;
  char buf[256];
  const char *name =
      sig == SIGSEGV ? "SIGSEGV" : sig == SIGBUS ? "SIGBUS" : sig == SIGABRT ? "SIGABRT" : "?";
  int n = snprintf(buf, sizeof buf,
                   "crash: signal %d (%s)\npc=%016llx\nlr=%016llx\nfp=%016llx\nsp=%016llx\nfault=%016llx\n",
                   sig, name, (unsigned long long)pc, (unsigned long long)lr,
                   (unsigned long long)fp, (unsigned long long)sp,
                   (unsigned long long)(uintptr_t)si->si_addr);
  if (s_crash_fd >= 0) write(s_crash_fd, buf, (size_t)n);

  uint64_t cur = fp;
  for (int i = 0; i < 32; i++) {
    uint64_t prev = safe_read64(cur);
    uint64_t ret = safe_read64(cur + 8);
    if (prev == 0 || ret == 0) break;
    n = snprintf(buf, sizeof buf, "  #%02d ret=%016llx\n", i, (unsigned long long)ret);
    if (s_crash_fd >= 0) write(s_crash_fd, buf, (size_t)n);
    if (prev <= cur) break; // no descending frame chain (or cycle) -> stop
    cur = prev;
  }
  if (s_crash_fd >= 0) fsync(s_crash_fd);
}

void install_crash_handler(void) {
  s_crash_fd = open(CRASH_NAME, O_CREAT | O_WRONLY | O_TRUNC, 0644);
  struct sigaction sa;
  memset(&sa, 0, sizeof sa);
  sa.sa_sigaction = crash_handler;
  sa.sa_flags = SA_SIGINFO | SA_NODEFER;
  sigemptyset(&sa.sa_mask);
  sigaction(SIGSEGV, &sa, NULL);
  sigaction(SIGBUS, &sa, NULL);
  sigaction(SIGABRT, &sa, NULL);
}

void fatal_error(const char *fmt, ...) {
  PadState pad;
  padConfigureInput(1, HidNpadStyleSet_NpadStandard);
  padInitializeDefault(&pad);

  consoleInit(NULL);

  va_list list;
  va_start(list, fmt);
  vprintf(fmt, list);
  va_end(list);

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
