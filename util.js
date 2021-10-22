const isProd = process.env.NODE_ENV === 'production'

function rowToObject (row) {
  const result = {}

  Object.keys(row).forEach((key) => {
    result[snakeToCamel(key)] = row[key]
  })

  return result
}

function snakeToCamel (string) {
  const tokens = string.split('_')

  for (let i = 1; i < tokens.length; i++) {
    tokens[i] = tokens[i].charAt(0).toUpperCase() + tokens[i].slice(1)
  }

  return tokens.join('')
}

function asyncWrapper(f) {
  return async (req, res, next) => {
    try {
      await f(req, res, next)
    }
    catch (error) {
      next(error)
    }
  }
}

module.exports = {
  isProd,
  rowToObject,
  asyncWrapper
}
