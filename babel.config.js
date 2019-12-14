//  项目发布所需的babel插件 
const productionPlugins = []
if (process.env.NODE_ENV === 'production') {
  productionPlugins.push("transform-remove-console")
}

module.exports = {
  'presets': [
    '@vue/cli-plugin-babel/preset'
  ],
  'plugins': [
    [
      'component',
      {
        'libraryName': 'element-ui',
        'styleLibraryName': 'theme-chalk'
      }
    ],
    ...productionPlugins
  ]
}
