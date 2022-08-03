module.exports = {
	"plugins": ["@babel/plugin-transform-react-jsx"],
	"presets": [
    ['@babel/preset-react', {
			runtime: 'automatic',
		}],
		['@babel/preset-typescript'],
    [
      "@babel/preset-env",
      {
        "targets": {
          "node": true
        }
      }
    ]
  ]
}