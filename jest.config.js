module.exports = {
	verbose: true,
	preset: 'ts-jest',
	"moduleNameMapper":{
		"\\.(css|less|scss|sass)$": "identity-obj-proxy" 
	},
	 transform: {
    '^.+\\.(ts|tsx)?$': 'ts-jest',
    "^.+\\.(js|jsx)$": "babel-jest",
    ".+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2|svg)$": "jest-transform-stub"
	},
	"testEnvironment": "jsdom"
}