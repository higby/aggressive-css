const autoprefixer = require('autoprefixer')
const cheerio = require('cheerio')
const duplicatecss = require('postcss-combine-duplicated-selectors')
const duplicatemediaquery = require('postcss-combine-media-query')
const postCSS = require('postcss')
const purgecss = require('@fullhuman/postcss-purgecss')

module.exports = config => {
  config.addTransform('aggressive-css', async (content, outputPath) => {
    if (outputPath && !outputPath.endsWith('.html')) return content

    const $ = cheerio.load(content)
    const styles = $('style').text()

    $('style').text('')

    async function minifyCSS(styles) {
      return postCSS([
        autoprefixer,
        duplicatemediaquery, // make sure this is before `duplicatecss`
        duplicatecss({ removeDuplicatedValues: true }),
        purgecss({
          content: [
            {
              raw: $.html(),
              extension: 'html'
            }
          ]
        })
      ]).process(styles, { from: null })
    }
    const result = await minifyCSS(styles)

    $('style').text(result.css)

    return $.html()
  })
}
