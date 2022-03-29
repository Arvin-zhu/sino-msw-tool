module.exports = {
	"plugins": ["@babel/plugin-transform-react-jsx"],
	"presets": [
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