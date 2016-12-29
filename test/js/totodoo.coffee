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
			expect(@driver.getTitle()).to.eventually.contain
			'Totodoo App'
			@timeout 4000, done()

		it 'is the name of the default list', (done) ->
			@timeout 4000, done()

	describe 'List actions', ->

		describe 'Select list', ->

		describe 'Create list', ->

		describe 'Modify list', ->

		describe 'Delete list', ->

	describe 'Item actions', ->

		describe 'Add item', ->

		describe 'Complete item', ->

		describe 'Uncomplete item', ->

		describe 'Remove item', ->

		describe 'Show all items', ->

		describe 'Show completed items', ->

		describe 'Show uncompleted items', ->

		describe 'Swap completed  items', ->

	describe 'User actions', ->

