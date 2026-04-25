#!/bin/sh
set -e

MW_VERSION="1.43"

install_ext() {
  NAME=$1
  if [ ! -d "/extensions/$NAME" ]; then
    echo "Installing $NAME..."
    curl -fsSL "https://github.com/wikimedia/mediawiki-extensions-${NAME}/archive/refs/heads/REL${MW_VERSION}/archive.tar.gz" -o /tmp/ext.tar.gz || \
    curl -fsSL "https://github.com/wikimedia/mediawiki-extensions-${NAME}/archive/REL${MW_VERSION}.tar.gz" -o /tmp/ext.tar.gz
    mkdir -p /extensions/$NAME
    tar -xzf /tmp/ext.tar.gz -C /extensions/$NAME --strip-components=1
    rm -f /tmp/ext.tar.gz
    echo "$NAME installed."
  else
    echo "$NAME already present, skipping."
  fi
}

install_ext VisualEditor
install_ext Cite