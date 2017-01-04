<?php

define('SERVER_ROOT', dirname($_SERVER['SCRIPT_NAME']).'/');

include __DIR__.'/src/elonmedia/totodoo/php/bootstrap.php';

define('TEST_JSON', TRUE);

header('Content-Type: application/json');

$val 	= array();
$method = $_REQUEST['method'];
$path 	= $_REQUEST['path'];
$value 	= $_REQUEST['value'] ? $_REQUEST['value'] : array();
$user 	= $_SESSION['user']  ? $_SESSION['user']  : array();

// remove root instance from the path
array_shift($path);

$deleteCB = function(&$m, $n, $i) {
	$unset = FALSE;
	foreach ($m[$n] as $k => $model) {
		// model is a std object type, for comparing below cast to array
		$model = (array)$model;
		foreach ($i as $item) {
			if ($model['id'] == $item['id'])  {
				unset($m[$n][$k]);
				$unset = TRUE;
			}
		}
	}
	// reindex
	if ($unset) $m[$n] = array_values($m[$n]);
};

$addCB = function(&$m, $n, $i) {
	$m[$n] = (array)$m[$n];
	foreach ($i as $item) {
		if (isset($item['completed']))
			$item['completed'] = $item['completed'] === 'true';
		array_push($m[$n], $item);
	}
};

$editCB = function(&$m, $n, $i) {
	if ($n == 'completed') $i = $i === 'true';
	if ($m[$n] != $i) $m[$n] = $i;
};

$orderCB = function(&$m, $n, $i) {
	$sorted = array();
	$arr = (array)$m[$n];
	foreach ($i as $x) {
		$sorted[] = $arr[$x];
	}
	$m[$n] = $sorted;
};

$getCB = function($m, $n, $i) {
	return $m[$n];
};

$callbacks = array(
	'post' => $addCB,
	'put' => $editCB,
	'delete' => $deleteCB,
	'get' => $getCB,
	'order' => $orderCB
);


if (isset($callbacks[$method])) {
	$val = action($_SESSION['user'], $path, $value, $callbacks[$method]);
} else {
	$method = "unsupported";
}

echo json_encode(
	array('user' => $user, 
		  'path' => $path, 
		  'value' => $value, 
		  'val' => $val, 
		  'method' => $method, 
		  'exportedValue' => var_export($value, 1)
	)
);

function action(&$model, $path, $value, $cb) {
	$model = (array)$model;
	$n = array_shift($path);
	if (count($path) > 0) {
		return action($model[$n], $path, $value, $cb);
	}
	return $cb($model, $n, $value);
}

/*
function save() {

	if ($_SESSION['user']) {

		if (TEST_JSON) {
			test(TRUE);
		} else {
	
			$result = array_merge(
				publicLists(), 
				array('sharedLists' => $_SESSION['user']['sharedLists']),
				array('privateLists' => $_SESSION['user']['privateLists'])
			);

			echo json_encode($result);
	
		}

	} else {
		if (TEST_JSON) {
			test();
		} else {
			
			echo json_encode(publicLists());
			
		}
	}

}
*/

/*
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
		echo json_encode(array($_SESSION['user'], $path, $value, var_export($value, 1)));
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

*/