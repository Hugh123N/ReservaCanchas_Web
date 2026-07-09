#!/bin/sh

# Iniciar nginx en background
nginx

# Iniciar servidor SSR
exec node server/server.mjs
