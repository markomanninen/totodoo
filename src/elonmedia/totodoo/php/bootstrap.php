<?php

session_start();

error_reporting(E_ALL | E_STRICT);

#ini_set('display_errors', 1);

define('APPLICATION_ROOT', dirname(dirname(dirname(dirname(__DIR__)))).'/');
if (!defined('SERVER_ROOT'))
	define('SERVER_ROOT', dirname(dirname(dirname(dirname(dirname($_SERVER['SCRIPT_NAME']))))));
define('APPLICATION_SRC', __DIR__.'/');

// Ensure that composer has installed all dependencies
if (!file_exists(APPLICATION_ROOT . 'composer.lock')) {
    die("Dependencies must be installed using composer:\n\nphp composer.phar install --dev\n\n"
        . "See http://getcomposer.org for help with installing composer\n");
}

require_once APPLICATION_ROOT . 'vendor/autoload.php';
require_once APPLICATION_SRC . 'functions.php';

define('LIST_APPLICATIONS', FALSE);
define('STORMPATH_APPLICATION_ID', '3jcnVb1RNNTPCO0W79yTBU');
define('STORMPATH_CALLBACK_URI', callbackURI());
define('STORMPATH_API_KEYS', '/Users/markom/.stormpath/apiKey.properties');

if (file_exists(STORMPATH_API_KEYS)) {
	\Stormpath\Client::$apiKeyFileLocation = STORMPATH_API_KEYS;
} else {
	$apiKeyProperties = "apiKey.id={$_ENV['STORMPATH_API_ID']}\napiKey.secret={$_ENV['STORMPATH_API_KEY']}";
	\Stormpath\Client::$apiKeyProperties = $apiKeyProperties;
}
