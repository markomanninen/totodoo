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

	@timeout 12000

	beforeEach ->
		@driver.get 'http://127.0.0.1/'

	describe 'Init', ->

		it 'has the title of the application in the window\'s title', (done) ->
			text = @driver.getTitle()
			expect(text).to.eventually.contain
			'Totodoo - Sample todo application with StormPath user management service'
			@timeout 4000, done()

		it 'is the name of the default list', (done) ->
			drvr = @driver
			# wait for page to be loaded
			@driver.wait((()-> drvr.executeScript('return document.readyState')), 10000).then ()->
				text = drvr.findElement(id: 'listName').getText()
				expect(text).to.eventually.contain
				'Todos'
			@timeout 4000, done()

		it 'is the length of the default list items', (done) ->
			drvr = @driver
			# wait for page to be loaded
			@driver.wait((()-> drvr.executeScript('return document.readyState')), 10000).then ()->
				size = drvr.executeScript('return window.document.querySelectorAll("#todo-list li").length')
				expect(size).to.eventually.equal
				2
			@timeout 4000, done()
