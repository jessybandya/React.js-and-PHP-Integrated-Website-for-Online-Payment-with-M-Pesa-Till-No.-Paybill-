<?php

function initiateTransaction($amount, $phoneNumber) {
    $consumerKey = ''; //Get it from safaricom developer portal by creating an app
    $consumerSecret = ''; //Get it from safaricom developer portal by creating an app
    $authUrl = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

    // Prepare the cURL request to generate the access token
    $ch = curl_init($authUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        'Authorization: Basic ' . base64_encode($consumerKey . ':' . $consumerSecret)
    ));

    // Send the cURL request to generate the access token and get the response
    $response = curl_exec($ch);
    curl_close($ch);

    // Extract the access token from the response
    $data = json_decode($response);
    $accessToken = $data->access_token;

    // Generate the timestamp
    $timestamp = date('YmdHis');
    $businessShortCode = ;//Business shortcode either till no. or paybill no.
    $passkey = ''; //Get it from safaricom developer portal under apis tab and click on Lipa na Mpesa Online and select the app you created initially or intented you'll be able to get it.
    $accountNumber = ;//Can be anything you want to identify the transaction with or account no. for paybill transactions

    // Generate the password
    $password = base64_encode($businessShortCode . $passkey . $timestamp);

    // Prepare the cURL request for STK push
    $stkUrl = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';
    $ch = curl_init($stkUrl);

    $headers = array(
        'Authorization: Bearer ' . $accessToken,
        'Content-Type: application/json'
    );

    $data = array(
        "BusinessShortCode" => $businessShortCode,
        "Password" => $password,
        "Timestamp" => $timestamp,
        "TransactionType" => "CustomerPayBillOnline",
        "Amount" => $amount,
        "PartyA" => $phoneNumber,
        "PartyB" => $businessShortCode,
        "PhoneNumber" => $phoneNumber,
        "CallBackURL" => "./callback.php", //Make sure to change this to your callback url and it's live
        "AccountReference" => $accountNumber,
        "TransactionDesc" => "Payment of X"
    );

    $options = array(
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_POST => 1,
        CURLOPT_POSTFIELDS => json_encode($data),
        CURLOPT_RETURNTRANSFER => 1
    );

    curl_setopt_array($ch, $options);

    // Send the cURL request for STK push and get the response
    $response = curl_exec($ch);
    curl_close($ch);

    // Process the response and return a message indicating the success or failure
    $data = json_decode($response);
if (isset($data->MerchantRequestID) && isset($data->CheckoutRequestID)) {
    // Transaction initiated successfully
    $response = array(
        'success' => true,
        'message' => "Payment initiated successfully.",
        'transactionID' => $data->MerchantRequestID,
        'checkoutRequestID' => $data->CheckoutRequestID
    );
} else {
    // Transaction initiation failed
    $errorMessage = isset($data->errorMessage) ? $data->errorMessage : "Unknown error";
    $response = array(
        'success' => false,
        'message' => "Failed to initiate payment. Reason: " . $errorMessage
    );
}

    return $response;
}

function processCallback($notificationData) {
    // Retrieve the transaction details from the payload
    $transactionID = $notificationData->Body->stkCallback->MerchantRequestID;
    $checkoutRequestID = $notificationData->Body->stkCallback->CheckoutRequestID;
    $resultCode = $notificationData->Body->stkCallback->ResultCode;
    $resultDesc = $notificationData->Body->stkCallback->ResultDesc;

    // Perform any required actions based on the transaction status
    if ($resultCode == 0) {
        // Transaction successful
        // Update your database or perform any required tasks

        // Send success response to frontend
        $response = array(
            'success' => true,
            'message' => 'Transaction successful',
            'transactionID' => $transactionID,
            'checkoutRequestID' => $checkoutRequestID
        );
    } else {
        // Transaction failed
        // Update your database or perform any required tasks

        // Send failure response to frontend
        $response = array(
            'success' => false,
            'message' => 'Transaction failed',
            'resultCode' => $resultCode,
            'resultDesc' => $resultDesc
        );
    }

    // Send the response to the React frontend
    header('Content-Type: application/json');
    echo json_encode($response);
}

// Enable CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Handle CORS pre-flight request
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $amount = isset($_POST['amount']) ? intval($_POST['amount']) : null;
    $phoneNumber = isset($_POST['phoneNumber']) ? intval($_POST['phoneNumber']) : null;

    if ($amount !== null && $phoneNumber !== null) {
        $response = initiateTransaction($amount, $phoneNumber);
    } else {
        $response = array(
            'success' => false,
            'message' => 'Invalid input values'
        );
    }

    // Return the response as JSON
    header('Content-Type: application/json');
    echo json_encode($response);
} else {
    // Handle callback
    $requestPayload = file_get_contents('php://input');
    $notificationData = json_decode($requestPayload);
    processCallback($notificationData);
}
?>
