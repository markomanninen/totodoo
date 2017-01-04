<?php

define('SERVER_ROOT', dirname($_SERVER['SCRIPT_NAME']).'/');

include __DIR__.'/src/elonmedia/totodoo/php/bootstrap.php';

define('TEST_JSON', TRUE);

header('Content-Type: application/json');

if ($_SESSION['user']) {

	if (TEST_JSON) {
		test(TRUE);
	} else {
/*
		$result = array_merge(
			publicLists(), 
			array('sharedLists' => $_SESSION['user']['sharedLists']),
			array('privateLists' => $_SESSION['user']['privateLists'])
		);

		echo json_encode($result);
		*/
	}

} else {
	if (TEST_JSON) {
		test();
	} else {
		/*
		echo json_encode(publicLists());
		*/
	}
}

function test($user = FALSE) {

	$path = $_REQUEST['path'];
	
	$value = $_REQUEST['value'] ? $_REQUEST['value'] : array();

	if ($value && is_array($value)) {
		foreach ($value as $n => $item) {
			foreach ($item as $k => $v) {
				if ($k == 'completed') {
					$value[$n][$k] = $v === 'true';
				}
			}
		}
	} else {
		$value = in_array($value, array('false', 'true')) ? $value === 'true' : $value;
	}

	array_shift($path);

	setValue($_SESSION['user'], $path, $value);
	
	if ($user) {
		echo json_encode(array($_SESSION['user'], $path, $value, var_export($value, 1)));
	} else {
		echo json_encode(array($_SESSION['user'], $path, $value));
	}
}

function setValue(&$model, $path, $value) {
	$model = (array)$model;
	$n = array_shift($path);
	if (count($path) > 0) {
		return setValue($model[$n], $path, $value);
	}
	if (is_array($value)) {

// update object functionality, add list items
		foreach ($value as $k => $v) {
			if (!isset($model[$n][$k])) {
				$model[$n][$k] = $v;
			}
		}
// delete functionality, remove list items
		foreach ($model[$n] as $k => $v) {
			if (!isset($value[$k])) {
				unset($model[$n][$k]);
			}
		}

	} elseif ($model[$n] != $value) {
		$model[$n] = $value; #$value == 'null' ? array() : $value;
	}
}