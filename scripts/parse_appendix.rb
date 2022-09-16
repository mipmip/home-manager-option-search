require 'open-uri'
require 'nokogiri'
require 'json'
require 'pp'

url = 'https://nix-community.github.io/home-manager/options.html'
html = URI.open(url)
doc = Nokogiri::HTML(html)

data = doc.search('dl.variablelist')

outarr = []

data.search('dt').each do |dt|
  dds = dt.xpath("following-sibling::dd[1]")

  option_title = dt.css("span a code").inner_html

  option_desc = ""
  option_note = ""
  option_type = ""
  option_default = ""
  option_example = ""
  option_declared_by = ""

  i = 0
  dds.children.each do | ch |
    i+=1
    if i == 1
      option_desc = ch.text.strip.gsub("\n","")
    elsif i == 2
      if ch.text[0..4] == "Type:"
        option_type = ch.text[5..-1].strip
      else
        option_note = ch.text.strip
      end

    else
      if ch.text[0..4] == "Type:"
        option_type = ch.text[5..-1].strip.gsub("\n","")
      elsif ch.text[0..7] == "Default:"
        option_default = ch.text[8..-1].strip.gsub("\n","").gsub(/\s+/, ' ')
      elsif ch.text[0..11] == "Declared by:"
        declared = ch.xpath("following-sibling::table[1]")
        option_declared_by = declared.text.strip.gsub(/\s+/, "\n")
      elsif ch.text[0..7] == "Example:"

#        if option_title.include? "urxvt.extraConfig" or option_title.include? "vim.extraConfig"
#          p option_title.upcase
#          #PP.pp ch
#          p "---"
#          #PP.pp ch.xpath("following-sibling::pre[1]")
#          #PP.pp ch.xpath("following-sibling")
#          p
#
#          PP.pp ch.xpath("code").text
#        end
        example = ch.xpath("following-sibling::pre[1]")
        if example.length > 0
          option_example = example.text
        else
          option_example = ch.xpath("code").text
        end
      end
    end

  end

#  print "---------------------------------------\n"
#  print "TITLE:\n#{option_title}\n\n"
#  print "DESC:\n#{option_desc}\n\n"
#  print "NOTE:\n#{option_note}\n\n" if option_note != ""
#  print "TYPE:\n#{option_type}\n\n"
#  print "DEFAULT:\n#{option_default}\n\n"
#  print "EXAMPLE:\n#{option_example}\n\n" if option_example != ""
#  print "DECLARED BY:\n#{option_declared_by}\n\n"
#  print "\n"
#
  outrec = {}
  outrec["title"] = option_title
  outrec["description"] = option_desc
  outrec["note"] = option_note
  outrec["type"] = option_type
  outrec["default"] = option_default
  outrec["example"] = option_example
  outrec["declared_by"] = option_declared_by

  outarr <<  outrec

end


outobj = {}
time = Time.new
outobj["last_update"] = time.strftime("%B %d, %Y at %k:%M")
outobj["options"] = outarr

File.open("data/options.json","w") do |f|
    f.write(outobj.to_json)
end

print "Finished parsing home manager options."
