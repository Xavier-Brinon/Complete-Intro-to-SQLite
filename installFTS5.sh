#!/bin/bash

# Check if FTS5 shared library exists
if [ ! -f fts5.so ]; then
    # Download the latest stable SQLite source code, extract and configure
    wget -c https://www.sqlite.org/src/tarball/sqlite.tar.gz -O SQLite-trunk.tgz
    tar -xzf SQLite-trunk.tgz
    cd sqlite || exit

    ./configure
    # Feature flags...
    # - fts4
    # - fts5
    # - geopoly
    # - rtree
    # - session
    # - update-limit
    # - memsys5
    # - memsys3
    # - scanstatus
    # + json
    # Created Makefile from Makefile.in
    # Created sqlite3.pc from sqlite3.pc.in
    # Created sqlite_cfg.h

    make fts5.c sqlite3.h sqlite3ext.h

    # Compiling a loadable extension
    # https://www.sqlite.org/loadext.html#build
    # on Linux: gcc -O2 -fPIC -shared fts5.c -o ../fts5.so
    gcc -g -fPIC -dynamiclib fts5.c -o ../fts5.dylib

    cd ..
fi

# Cleanup the source files
rm -rf sqlite SQLite-trunk.tgz
q
