// Add nunjuck custom methods here
module.exports = {
  asset: function (assetPath) {
    return `${this.ctx.app.urls.assets}/${assetPath}`
  },
}
