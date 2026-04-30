require 'cgi'
require 'jekyll'

# Extends Jekyll's built-in highlight tag to support desc="..." attribute.
# Usage: {% highlight ruby desc="My description" %}
# Outputs the description as data-desc on the figure element
class HighlightWithDesc < Jekyll::Tags::HighlightBlock
  def initialize(tag_name, markup, tokens)
    @desc = markup[/desc="([^"]*)"/, 1]
    @collapsed = markup.match?(/\bcollapsed\b/)
    clean = markup.gsub(/\s*desc="[^"]*"/, '').gsub(/\s*\bcollapsed\b/, '')
    super(tag_name, clean, tokens)
  end

  def render(context)
    output = super(context)
    return output unless @desc
    attrs = "data-desc=\"#{CGI.escapeHTML(@desc)}\""
    attrs += " data-collapsed=\"true\"" if @collapsed
    output.sub('<figure class="highlight"', "<figure class=\"highlight\" #{attrs}")
  end
end

Liquid::Template.register_tag('highlight', HighlightWithDesc)
