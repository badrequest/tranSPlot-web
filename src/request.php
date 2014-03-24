<?php
header('Content-type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'GET')
{
	$ch = curl_init(); 
	curl_setopt ($ch, CURLOPT_URL, "http://179.184.209.242/transplot-rest/rest/traffic/status?ix=" . $_GET["ix"] . "&iy=" . $_GET["iy"] . "&fx=" . $_GET["fx"] . "&fy=" . $_GET["fy"]); 
	curl_setopt ($ch, CURLOPT_USERAGENT, "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.6) Gecko/20070725 Firefox/2.0.0.6"); 
	curl_setopt ($ch, CURLOPT_TIMEOUT, 60); 
	curl_setopt ($ch, CURLOPT_FOLLOWLOCATION, 0); 
	curl_setopt ($ch, CURLOPT_RETURNTRANSFER, 1); 
	curl_setopt ($ch, CURLOPT_COOKIEJAR, $cookie); 
	curl_setopt ($ch, CURLOPT_COOKIEFILE, $cookie); 
	echo json_encode(curl_exec($ch));
}