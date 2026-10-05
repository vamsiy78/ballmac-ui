#!/usr/bin/env bash
# Runs the private "Pro CI" (in the Pro repository) for a commit of this repository, and waits for the result.
#
#   pnpm pro:ci               the head of origin/preprod
#   pnpm pro:ci <sha|ref>     a specific commit or branch
#   PRO_REF=main pnpm pro:ci  check against another branch of the Pro repository (default preprod)
#
# The public CI never sees the Pro source, because this repository's logs are public. Pro CI builds the whole site with Pro,
# runs the Pro tests and the leak scan, and keeps its logs private. The pre-push guard looks for a passing run of it.
set -euo pipefail

PRO=vamsiy78/ballmac-ui-pro
git fetch -q origin
sha=$(git rev-parse "${1:-origin/preprod}")
echo "Starting Pro CI for ${sha:0:7} (Pro branch: ${PRO_REF:-preprod})"
gh workflow run ci.yml --repo "$PRO" -f sha="$sha" -f pro_ref="${PRO_REF:-preprod}"

id=""
for _ in $(seq 1 30); do
  sleep 3
  id=$(gh run list --repo "$PRO" --workflow ci.yml --event workflow_dispatch --limit 15 --json databaseId,displayTitle \
    --jq "[.[] | select(.displayTitle | contains(\"$sha\"))][0].databaseId // empty")
  [ -n "$id" ] && break
done
[ -n "$id" ] || { echo "Could not find the Pro CI run. Look at https://github.com/$PRO/actions" >&2; exit 1; }
echo "Run: https://github.com/$PRO/actions/runs/$id"
gh run watch "$id" --repo "$PRO" --exit-status
