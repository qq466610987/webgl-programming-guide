// eslint.config.mjs
import eslint from '@antfu/eslint-config'

export default eslint({
  prettier: true,
  rules: {
    'antfu/consistent-list-newline': 'off',
  },
})
