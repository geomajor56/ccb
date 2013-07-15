<?php
$host = 'localhost';
$user = 'mas';
$pass = 'Wyliepup1';
$db = 'mas';

$station_num_id = $_POST['station_num_id'];
$connection = pg_connect("host=$host dbname=$db user=$user password=$pass") or die("Could not connect to server\n");

$chart_data = pg_query($connection, "SELECT sample_date, a, b, c, d, e, f, g, i, j, k, l, m FROM monitor_nutrient WHERE station_num_id = $station_num_id ORDER BY sample_date ASC ");
$row_1 = array();

while ($r1 = pg_fetch_array($chart_data)) {
	$the_date = strtotime($r1['sample_date'])*1000;
	$row_1[] = array($the_date, $r1['a'], $r1['b'], $r1['c'], $r1['d'], $r1['e'], $r1['f'], $r1['g'], $r1['i'], $r1['j'], $r1['k'], $r1['l'], $r1['m']);
}

echo(json_encode($row_1, JSON_NUMERIC_CHECK));


pg_close($connection);

?>


