<?php

error_reporting(E_ALL | E_STRICT);

session_start();

// Ensure that composer has installed all dependencies
if (!file_exists(dirname(__FILE__) . '/composer.lock')) {
    die("Dependencies must be installed using composer:\n\nphp composer.phar install --dev\n\n"
        . "See http://getcomposer.org for help with installing composer\n");
}

// Include the composer autoloader
require_once  'vendor/autoload.php';

$_SESSION['user'] = array('firstname' => 'Marko', 'lastname' => 'Manninen');

class Status {
	function __construct() {
		$this->status = "";
	}
}

class Application
{
	function __construct() {
		$this->jwt = new Status();
	}
}

function main() {
	
}

function flash() {

}
