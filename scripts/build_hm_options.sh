#!/usr/bin/env sh

if [ -z $HM_RELEASE ]; then
  HM_RELEASE=master
fi

echo "building Home Manager options from ${HM_RELEASE}"

#in_file = File.read("./result/share/doc/home-manager/options.json")

nix build github:nix-community/home-manager/${HM_RELEASE}#docs-json --no-write-lock-file
rm -f ./data/hm-options-${HM_RELEASE}.json
ruby ./scripts/parse_options-json.rb
