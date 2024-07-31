#!/usr/bin/env ruby

# Copyright 2024 Pim Snel <post@pimsnel.com>
# License: MIT

require 'json'
require 'pp'
require 'yaml'

def isLiteralExpression(val, key)
  if val.key? key and val[key].instance_of? Hash and val[key].key? "_type" and val[key]['_type'] == 'literalExpression'
    true
  else
    false
  end
end

def getValFor(val, key)
  if isLiteralExpression(val, key)
    val[key]['text']
  elsif val.key? key
    val[key]
  else
    ""
  end
end

def parseVal(val)
  val['example'] = getValFor(val, 'example')
  val['default'] = getValFor(val, 'default')

  val
end

in_file_conf = File.read("./config.yaml")
config = YAML.load(in_file_conf)

if not ENV['HM_RELEASE']
  ENV['HM_RELEASE'] = "master"
elsif ENV['HM_RELEASE'] == "stable"
  ENV['HM_RELEASE'] = config['params']['release_current_stable']
end

puts "Cleanup and Building Home Manager options from #{ENV['HM_RELEASE']}"

`rm -Rf result`
`nix build github:nix-community/home-manager/${HM_RELEASE}#docs-json --no-write-lock-file`
`rm -f ./data/options-${HM_RELEASE}.json`

in_file = File.read("./result/share/doc/home-manager/options.json")
parsed = JSON.parse(in_file)

options_arr = []
parsed.each do | name, val |

  next if name == '_module.args'

  val['title'] = name
  val = parseVal(val)

  options_arr << val
end

outobj = {}
time = Time.new
outobj["last_update"] = time.utc.strftime("%B %d, %Y at %k:%M UTC")
outobj["options"] = options_arr

filename = "static/data/options-#{ENV['HM_RELEASE']}.json"

File.open(filename,"w") do |f|
    f.write(outobj.to_json)
end

puts "Finished parsing home manager options."
