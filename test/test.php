<?php

function sortArray(&$toSort, $sortByValuesAsKeys) {
	$sorted = array();
	foreach ($sortByValuesAsKeys as $n) {
		$sorted[] = $toSort[$n];
	}
	$toSort = $sorted;
}

$a = [0 => 'a', 1 => 'b', 2 => 'c', 3 => 'd', 4 => 'e'];

$b = [2, 3, 4, 0, 1];

sortArray($a, $b);

print_r($a);

unset($a[1]);

$a = array_values($a);

print_r($a);

?>