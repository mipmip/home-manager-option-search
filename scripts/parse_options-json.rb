# Copyright 2024 Pim Snel <post@pimsnel.com
# License: MIT

require 'json'
require 'pp'

if not ENV['HM_RELEASE']
  ENV['HM_RELEASE'] = "master"
end

p ENV['HM_RELEASE']

in_file = File.read("./result/share/doc/home-manager/options.json")
parsed = JSON.parse(in_file)

options_arr = []
parsed.each do | name, val |

  next if name == '_module.args'

  val['title'] = name

  if val.key? "example"
    val['example'] = val['example']['text']
  else
    val['example'] = ""
  end

  if val.key? "default"
    val['default'] = val['default']['text']
  else
    val['default'] = ""
  end

  options_arr << val
end

outobj = {}
time = Time.new
outobj["last_update"] = time.utc.strftime("%B %d, %Y at %k:%M UTC")
outobj["options"] = options_arr

filename = "data/hm-options-#{ENV['HM_RELEASE']}.json"

File.open(filename,"w") do |f|
    f.write(outobj.to_json)
end

print "Finished parsing home manager options."
