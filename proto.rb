require 'open-uri'
require 'nokogiri'
require 'json'
require 'pp'

url = 'https://nix-community.github.io/home-manager/options.html'
html = open(url)
doc = Nokogiri::HTML(html)

#html body div.appendix div.variablelist

data = doc.search('dl.variablelist')

data.search('dt').each do |dt|
  option_title = dt.text
  #  ct  = dt.xpath('count(following-sibling::dt)')
  #  dds = dt.xpath("following-sibling::dd[count(following-sibling::dt)=#{ct}]")
  dds = dt.xpath("following-sibling::dd[1]")
  option_desc = dds.children[0].text

  i = 0
  dds.children.each do | p |
    i+=1
    option_example = ""
    if i == 1
      option_desc = p.text
    elsif i == 2
      option_type = p.text
    elsif i == 3
      option_default = p.text
    elsif i == 4 and p.text.include? "Example"
      option_example = p.text
    end

    p "title:" + option_title
    p "desc:" + option_desc.to_s
    p "type:" + option_type.to_s
    p "default:" + option_default.to_s
    p "example:" + option_example.to_s
    p ""
  end
end
