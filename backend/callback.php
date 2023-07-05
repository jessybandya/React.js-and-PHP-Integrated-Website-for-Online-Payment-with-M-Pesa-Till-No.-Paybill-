<?php
// Enable CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

header("Content-Type: application/json");

// DATA
$mpesaResponse = file_get_contents('php://input');

// log the response
$logFile = "mpesa.txt";
$log = fopen($logFile, "a");
fwrite($log, $mpesaResponse);
fclose($log);
$mpesaResponse1 = file_get_contents($logFile);

// Prepare the response based on the M-Pesa response
$response = json_encode([
    "ResultCode" => 0,
    "ResultDesc" => "Confirmation Received Successfully",
    "MpesaResponse" => $mpesaResponse1 // Include the actual M-Pesa response data
]);

echo $response;
?>
