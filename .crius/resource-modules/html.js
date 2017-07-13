const lazypipe = require('lazypipe')
const gulpIf = require('gulp-if')
const nunjucksRender = require('gulp-nunjucks-render')
const htmlmin = require('gulp-htmlmin')

const crius = require('../manifest.js')

const hyperionFilters = require('../../.hyperion/filters.js')
const hyperionMethods = require('../../.hyperion/methods.js')
const hyperionGetData = require('../../.hyperion/data.js')

module.exports = {
  pipelines: {
    each: asset => {
      return lazypipe()
        .pipe(() =>
          gulpIf(
            '*.njk',
            nunjucksRender({
              path: crius.config.paths.source,
              manageEnv: function (environment) {
                Object.keys(hyperionFilters).forEach(key =>
                  environment.addFilter(key, hyperionFilters[key])
                )

                Object.keys(hyperionMethods).forEach(key =>
                  environment.addGlobal(key, hyperionMethods[key])
                )
              },
              data: hyperionGetData(),
            })
          )
        )
        .pipe(() =>
          gulpIf(
            file =>
              !crius.params.debug && file.path.split('.').pop() === 'html',
            htmlmin({
              collapseWhitespace: true,
              minifyCSS: true,
              minifyJS: {
                compress: {
                  drop_console: true,
                },
              },
              processConditionalComments: true,
              removeComments: true,
              removeEmptyAttributes: true,
              removeScriptTypeAttributes: true,
              removeStyleLinkTypeAttributes: true,
            })
          )
        )
    },
  },
}
