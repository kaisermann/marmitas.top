const fs = require('fs')

function parseAppData () {
  // Walks through all of an objects properties
  const iterateObjProps = (obj, cb) => {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        obj[key] = typeof obj[key] === 'object'
          ? iterateObjProps(obj[key], cb)
          : cb(key, obj[key])
      }
    }
    return obj
  }

  // Reads a string like "{{prop1.prop2.prop3...}}" and returns the actual
  // value of 'object['prop1']['prop2']['prop3']...'
  const parsePropStr = (key, val) => {
    let matched

    if ('' + val === val && (matched = /{{\s?(\S*)\s?}}/g.exec(val))) {
      const propRealValue = matched[1]
        .split('.')
        .reduce((o, i) => o[i], appData)
      return val.replace(matched[0], propRealValue)
    }
    return val
  }

  // Reads the 'app.json' file
  let appData = JSON.parse(fs.readFileSync('app.json', 'utf8'))

  // If NODE_ENV is set and inside the 'app.json[environments]',
  // append its variables to the 'app' object.
  appData = Object.assign(
    appData,
    appData.environments[process.env.NODE_ENV]
      ? appData.environments[process.env.NODE_ENV]
      : {}
  )
  delete appData.environments

  // Iterate through the object and transform all
  // {{keyerty.etc.etc2.etc3...}} into actual properties
  iterateObjProps(appData, parsePropStr)

  return appData
}

/* This modules exports a function and not an object.
 * This way we can read more than once the 'app.json' file
 * and see live changes when its content is edited.
*/
module.exports = () => {
  return {
    // Default 'app' object
    app: parseAppData(),
  }
}
