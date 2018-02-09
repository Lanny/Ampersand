<?php
$time = '1518138320'; 
$key = hash('sha256','2Salinas');
echo($key);
echo("\n");
$pt2 = $time . $key;
echo($pt2);
echo("\n");
$passphrase = hash('sha256',$pt2); 

echo($passphrase);
echo("\n");
