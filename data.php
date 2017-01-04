<?php

header('Content-Type: application/json');

define('SERVER_ROOT', dirname($_SERVER['SCRIPT_NAME']).'/');

include __DIR__.'/src/elonmedia/totodoo/php/bootstrap.php';

define('TEST_JSON', TRUE);

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

function publicLists() {
	try {
	    $app = new Application();
	    if ($a = $app->getApplication()) {
	    	$result = array('publicLists' => array());
	    	foreach ($a->customData->totodoo->lists as $list) {
	    		$result['publicLists'][] = (Array)$list;
	    	}
	    } else {
	        $result = array('error' => 'Application not found');
	    }
	} catch (\Stormpath\Resource\ResourceError $re) {
	    $result = array('error' => 'ResourceError');
	} catch (ExpiredException $ee) {
	    $result = array('error' => 'ExpiredException');
	} catch (Guzzle\Http\Exception\CurlException $ge) {
	    $result = array('error' => 'CurlException');
	}
	return $result;
}

function test($user = FALSE) {
	
	#unset($_SESSION['user']['publicLists']);
	#unset($_SESSION['user']['sharedLists']);
	#unset($_SESSION['user']['privateLists']);
	#unset($_SESSION['user']['notifications']);

	if ($user) {
		if (@!$_SESSION['user']['publicLists']) {
			$lists = json_decode(file_get_contents(__DIR__.'/data2.json'));
			$_SESSION['user']['publicLists'] = (array)$lists->publicLists;
			$_SESSION['user']['sharedLists'] = (array)$lists->sharedLists;
			$_SESSION['user']['privateLists'] = (array)$lists->privateLists;
			$_SESSION['user']['notifications'] = (array)$lists->notifications;
		}
	} else {
		if (@!$_SESSION['user']['publicLists']) {
			$lists = json_decode(file_get_contents(__DIR__.'/data.json'));
			$_SESSION['user']['publicLists'] = (array)$lists->publicLists;
			$_SESSION['user']['notifications'] = (array)$lists->notifications;
		}
	}
	
/*
	foreach ($_SESSION['user']['publicLists'] as $key => $value) {
		if (!$value->items || !is_array($value->items)) {
			$_SESSION['user']['publicLists'][$key]['items'] = array();
		}
	}
	foreach ($_SESSION['user']['sharedLists'] as $key => $value) {
		if (!$value->items || !is_array($value->items)) {
			$_SESSION['user']['sharedLists'][$key]['items'] = array();
		}
	}
	foreach ($_SESSION['user']['privateLists'] as $key => $value) {
		if (!$value->items || !is_array($value->items)) {
			$_SESSION['user']['privateLists'][$key]['items'] = array();
		}
	}
	*/
	echo json_encode(@$_SESSION['user']);
}
