#!/bin/bash

WWWOL_USER="wwwol"
ARPSCAN_CMD="arp-scan"

command -v $ARPSCAN_CMD >/dev/null 2>&1 || {
    echo >&2 "$ARPSCAN_CMD is required but it's not installed. Please install it.";
}

echo "Adding user $WWWOL_USER"
sudo adduser --system --group $WWWOL_USER

echo "Adding sudo privileges to $WWWOL_USER to use $ARPSCAN_CMD"
sudo cp wwwol.sudoers /etc/sudoers.d/wwwol
sudo chmod 0440 /etc/sudoers.d/wwwol

