require 'open-uri'
require 'nokogiri'
require 'json'
require 'pp'

url = 'https://nix-community.github.io/home-manager/options.html'
html = open(url)
doc = Nokogiri::HTML(html)


data = doc.search('dl.variablelist')

data.search('dt').each do |dt|
  dds = dt.xpath("following-sibling::dd[1]")

  option_title = dt.text
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
        example = ch.xpath("following-sibling::pre[1]")
        option_example = example.text
      end
    end

  end

  print "---------------------------------------\n"
  print "TITLE:\n#{option_title}\n\n"
  print "DESC:\n#{option_desc}\n\n"
  print "NOTE:\n#{option_note}\n\n" if option_note != ""
  print "TYPE:\n#{option_type}\n\n"
  print "DEFAULT:\n#{option_default}\n\n"
  print "EXAMPLE:\n#{option_example}\n\n" if option_example != ""
  print "DECLARED BY:\n#{option_declared_by}\n\n"
  print "\n"

end
