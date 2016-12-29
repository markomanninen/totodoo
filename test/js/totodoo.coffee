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

	describe 'Init', ->

		@timeout 12000

		beforeEach ->
			@driver.get 'http://127.0.0.1/'

		it 'has the title of the application in the window\'s title', (done) ->
			expect(@driver.getTitle()).to.eventually.contain 'Totodoo App'
			@timeout 4000, done()

		it 'is the name of the default list', (done) ->
			drvr = @driver
			@driver.wait((()-> drvr.executeScript('return document.readyState')), 10000).then ()->
				text = drvr.findElement(id: 'listName').getText()
				expect(text).to.eventually.equal 'Public list 1'
				@timeout 4000, done()

		it 'is the length of the default list items = 2', (done) ->
			drvr = @driver
			@driver.wait((()-> drvr.executeScript('return document.readyState')), 10000).then ()->
				lis = drvr.findElement(id: 'todo-list').findElements(tagName: 'li')
				expect(lis.size()).to.eventually.equal 2
				@timeout 4000, done()

	describe 'List actions', ->

		@timeout 12000

		beforeEach ->
			@driver.get 'http://127.0.0.1/'

		it 'is the name of the private list after click', (done) ->
			@driver.wait((()-> @driver.executeScript('return document.readyState')), 10000).then ()->
				listName = 'Private list 1'
				@driver.findElement(linkText: listName).click()
				text = @driver.findElement(id: 'listName').getText()
				expect(text).to.eventually.equal listName
				@timeout 10000, done()

		it 'is the name of the public list after change', (done) ->
			@driver.wait((()-> @driver.executeScript('return document.readyState')), 10000).then ()->
				listName = 'PUBLIC LIST 1'
				el = @driver.findElement(id: 'listName')
				@driver.executeScript("arguments[0].setAttribute('value', arguments[1])", el, listName)
				text = @driver.findElement(id: 'id1').findElement(tagName: 'a').getText()
				expect(text).to.eventually.equal listName
				@timeout 4000, done()

		describe 'Create list', ->

		describe 'Delete list', ->

	describe 'Item actions', ->

		@timeout 12000

		beforeEach ->
			@driver.get 'http://127.0.0.1/'

		it 'is the length of the completd items = 1', (done) ->
			@driver.wait((()-> @driver.executeScript('return document.readyState')), 10000).then ()->
				@driver.findElement(linkText: 'Completed').click()
				lis = @driver.findElement(id: 'todo-list').findElements(tagName: 'li')
				expect(lis.size()).to.eventually.equal 1
				@timeout 10000, done()

		it 'is the length of the active items = 1', (done) ->
			@driver.wait((()-> @driver.executeScript('return document.readyState')), 10000).then ()->
				@driver.findElement(linkText: 'Active').click()
				lis = @driver.findElement(id: 'todo-list').findElements(tagName: 'li')
				expect(lis.size()).to.eventually.equal 1
				@timeout 10000, done()

		describe 'Add item', ->

		describe 'Complete item', ->

		describe 'Uncomplete item', ->

		describe 'Remove item', ->

		describe 'Show all items', ->

		describe 'Swap completed  items', ->

	describe 'User actions', ->

