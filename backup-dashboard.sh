#!/bin/bash
# Backup Dashboard - Check all VPS backups from local machine
# Usage: ./backup-dashboard.sh

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SSH_KEY="$HOME/.ssh/linode_rsa"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}       BACKUP STATUS DASHBOARD${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

check_server() {
    local name="$1"
    local addr="$2"
    local user="${3:-root}"
    local timeout="${4:-10}"
    
    echo -e "${YELLOW}--- ${name} ---${NC}"
    
    # Check if server is reachable
    if ! ssh -i "$SSH_KEY" -o ConnectTimeout=5 -o BatchMode=yes "${user}@${addr}" "true" 2>/dev/null; then
        echo -e "  Status: ${RED}UNREACHABLE${NC}"
        echo ""
        return
    fi
    
    # Determine if we need sudo for restic-env
    local sudo_cmd=""
    if [ "$user" != "root" ]; then
        sudo_cmd="sudo"
    fi
    
    # Get last backup time and stats with per-server timeout
    result=$(ssh -i "$SSH_KEY" -o ConnectTimeout="$timeout" -o BatchMode=yes "${user}@${addr}" "${sudo_cmd} bash -s" << 'REMOTESCRIPT'
source /root/.restic-env 2>/dev/null

# Get latest snapshot
latest=$(restic snapshots --latest 1 --json 2>/dev/null | grep -o '"time":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$latest" ]; then
    echo "NO_BACKUPS"
else
    # Get snapshot count
    count=$(restic snapshots --json 2>/dev/null | grep -o '"id"' | wc -l)
    
    # Get total size
    size=$(restic stats --mode raw-data 2>/dev/null | grep "Total Size:" | awk '{print $3, $4}')
    
    # Check if backup is recent (within 25 hours)
    last_epoch=$(date -d "$latest" +%s 2>/dev/null || echo "0")
    now_epoch=$(date +%s)
    hours_ago=$(( (now_epoch - last_epoch) / 3600 ))
    
    if [ "$hours_ago" -le 25 ]; then
        status="OK"
    elif [ "$hours_ago" -le 49 ]; then
        status="STALE"
    else
        status="OLD"
    fi
    
    echo "$status|$latest|$count|$size|$hours_ago"
fi
REMOTESCRIPT
    )
    
    if [ "$result" = "NO_BACKUPS" ]; then
        echo -e "  Status: ${YELLOW}NO BACKUPS FOUND${NC}"
    else
        IFS='|' read -r status latest count size hours_ago <<< "$result"
        
        case "$status" in
            OK)
                echo -e "  Status: ${GREEN}OK${NC}"
                ;;
            STALE)
                echo -e "  Status: ${YELLOW}STALE (${hours_ago}h ago)${NC}"
                ;;
            OLD)
                echo -e "  Status: ${RED}OLD (${hours_ago}h ago)${NC}"
                ;;
        esac
        
        echo -e "  Last backup: ${latest}"
        echo -e "  Snapshots: ${count}"
        echo -e "  Total size: ${size}"
    fi
    echo ""
}

check_server "VPS-4 (n4.abtz.co)" "139.162.111.88" "root" 15
check_server "VPS-5 (n5.cyanstats.com)" "172.105.204.16" "root" 15
check_server "VPS-6 (n6.kiwicart.xyz)" "172.105.204.96" "root" 15

echo -e "${BLUE}========================================${NC}"
echo -e "Last checked: $(date '+%Y-%m-%d %H:%M:%S')"
echo -e "${BLUE}========================================${NC}"
