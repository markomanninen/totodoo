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

describe 'Webdriver tutorial', ->

	@timeout 12000

	beforeEach ->
		@driver.get 'http://bites.goodeggs.com/posts/selenium-webdriver-nodejs-tutorial/'

	it 'has the title of the post in the window\'s title', (done) ->
		expect(@driver.getTitle()).to.eventually.contain
		'Getting started with Selenium Webdriver for node.js'
		@timeout 4000, done()

	it 'has publication date', (done) ->
		text = @driver.findElement(css: '.post .meta time').getText()
		expect(text).to.eventually.equal 'December 30th, 2014'
		@timeout 4000, done()

	it 'links back to the homepage', (done) ->
		@driver.findElement(linkText: 'Bites').click()
		expect(@driver.getCurrentUrl()).to.eventually.equal 'http://bites.goodeggs.com/'
		@timeout 4000, done()

describe 'Totodoo App', ->

	@timeout 12000

	beforeEach ->
		@driver.get 'http://site.dev/'

	it 'has the title of the application in the window\'s title', (done) ->
		expect(@driver.getTitle()).to.eventually.contain
		'Totodoo App'
		@timeout 4000, done()
