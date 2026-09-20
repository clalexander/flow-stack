#!/usr/bin/env bash
set -euo pipefail

site_dir="site"
examples_dir="examples"

# actions/jekyll-build-pages runs in a container as root, so it leaves $site_dir root-owned;
# reclaim ownership before the runner user writes example output into it.
if [[ -d "$site_dir" ]] && [[ "$(stat -c '%u' "$site_dir" 2>/dev/null || stat -f '%u' "$site_dir")" != "$(id -u)" ]]; then
  sudo chown -R "$(id -u):$(id -g)" "$site_dir"
fi

for example in "$examples_dir"/*/; do
  name="$(basename "$example")"
  dist="${example}dist"

  if [[ -d "$dist" ]]; then
    mkdir -p "$site_dir/$name"
    cp -R "$dist/." "$site_dir/$name/"
  fi
done
