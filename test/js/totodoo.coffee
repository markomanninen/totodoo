selenium = require 'selenium-webdriver'
chai = require 'chai'
chai.use require 'chai-as-promised'
expect = chai.expect

before ->
	@driver = new selenium.Builder()
		.withCapabilities(selenium.Capabilities.phantomjs())
		.build()
	@driver.getWindowHandle()

after ->
	@driver.quit()

describe 'Totodoo App', ->

	@timeout 30000

	beforeEach ->
		@driver.get 'http://127.0.0.1/'

	it 'has the title of the application in the window\'s title', (done) ->
		expect(@driver.getTitle()).to.eventually.contain 'Totodoo - Sample todo application with StormPath user management service'
		@timeout 10000, done()
