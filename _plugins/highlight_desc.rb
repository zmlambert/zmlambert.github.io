require 'cgi'
require 'jekyll'

# Extends Jekyll's built-in highlight tag to support desc="..." attribute.
# Usage: {% highlight ruby desc="My description" %}
# Outputs the description as data-desc on the figure element
class HighlightWithDesc < Jekyll::Tags::HighlightBlock
  def initialize(tag_name, markup, tokens)
    @desc = markup[/desc="([^"]*)"/, 1]
    super(tag_name, markup.gsub(/\s*desc="[^"]*"/, ''), tokens)
  end

  def render(context)
    output = super(context)
    return output unless @desc
    output.sub('<figure class="highlight"', "<figure class=\"highlight\" data-desc=\"#{CGI.escapeHTML(@desc)}\"")
  end
end

Liquid::Template.register_tag('highlight', HighlightWithDesc)
