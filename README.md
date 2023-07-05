# React.js and PHP Integrated Website for Online Payment with M-Pesa

This website is built using React.js as the frontend framework and PHP as the backend language. The primary objective of this project is to seamlessly integrate online payment functionality with M-Pesa, a widely used mobile payment service in Kenya.

With the integration of M-Pesa, users can conveniently make online payments directly from the website without the need to constantly check their phones for transaction updates. The website ensures real-time updates from Safaricom, the parent company of M-Pesa, to provide users with immediate and accurate information about their transactions.

This project consists of the following files:

1. `Initiator.php`: This file is responsible for initiating the STK push and other transactions. It handles the request to M-Pesa, processes the payment information, and starts the transaction flow.

2. `Callback.php`: This file receives transaction information from Safaricom's M-Pesa service. It acts as a callback endpoint where Safaricom sends real-time updates about transaction status, allowing the website to update the payment status accordingly.

3. `mpesa.txt`: This file is used to store the details of Safaricom M-Pesa transactions. It should be placed in the same directory as the other PHP files. The initial content of this file is as follows:
```
{"Body":{"stkCallback":{"MerchantRequestID":"10921-63713470-2","CheckoutRequestID":"ws_CO_05072023023225597768405710","ResultCode":0,"ResultDesc":"The service request is processed successfully.","CallbackMetadata":{"Item":[{"Name":"Amount","Value":1.00},{"Name":"MpesaReceiptNumber","Value":"RG50Q1JQYE"},{"Name":"Balance"},{"Name":"TransactionDate","Value":20230705023158},{"Name":"PhoneNumber","Value":254768405710}]}}}}
{"Body":{"stkCallback":{"MerchantRequestID":"10913-63714119-1","CheckoutRequestID":"ws_CO_05072023023321277746749307","ResultCode":2118,"ResultDesc":"No security credential is found. Operation failed."}}}
```
Note: This is just a sample of the initial content and can be replaced with actual transaction details as they occur.

To easily access the backend functionality, we recommend hosting your backend on a live server. This will ensure that the Initiator.php, Callback.php, and mpesa.txt files are accessible via a public URL.

## Getting Started
To get started with this project, please follow the instructions below:

1. Clone the repository to your local machine.
2. Install the necessary dependencies for both the frontend and backend.
3. Configure the M-Pesa API credentials for secure communication.
4. Host the backend files (Initiator.php, Callback.php, and mpesa.txt) on a live server.
5. Start the development server for the frontend.
6. Access the website through your preferred web browser.

Please refer to the detailed documentation for more information on installation, configuration, and usage instructions.

## Contribution
We welcome contributions to improve this project and make it even more beneficial for small and big businesses. If you have any suggestions, bug fixes, or feature requests, feel free to submit a pull request or open an issue on the GitHub repository.

Let's collaborate and create a robust and efficient online payment platform integrated with M-Pesa!

## License
This project is licensed under the [MIT License](LICENSE).