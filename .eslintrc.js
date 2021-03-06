module.exports = {
    "rules": {
      "padded-blocks": 0,
      "indent": [2, 4, {"SwitchCase": 1}],
      "eol-last": 2,
      "camelcase": 0,
      "consistent-return": 0,
      "linebreak-style": 0,
      "space-before-function-paren": [2, {"anonymous": "always", "named": "never"}],
      "jsx-quotes": [2, "prefer-single"],
      "no-use-before-define": 0,
      "no-console": 0,
      "no-unused-vars": [1, {"vars": "all", "args": "none", "varsIgnorePattern": "dispatch"}],
      "no-redeclare": 1,
      "curly": [2, "multi-line", "consistent"],
      "new-cap": 1,
      "dot-notation": 1,
      "object-curly-spacing": [2, "always"],
      "no-unused-expressions": 1
    },
    "ecmaFeatures": {
      "experimentalObjecRestSpread": true
    },
    "parserOptions": {
        "ecmaVersion": 2017
    }
}
  