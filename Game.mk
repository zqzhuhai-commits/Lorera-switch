# Game.mk -- Lorera game build entry (loader NRO + native NSP components).
#   make -f Game.mk             -> lorera_nx.nro
#   make -f Game.mk nsp-components -> dist/native/{main,main.npdm,control.nacp}
TARGET := lorera_nx
APP_TITLE := 守护劳拉
APP_AUTHOR := 96Brothers
APP_VERSION := 1.0.0
PORT_NPDM_TITLEID := 0100F53A4C4F5245
PORT_NPDM_CONFIG := tools/config.npdm.json
include runtime/runtime.mk
