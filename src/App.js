import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

const PaymentForm = () => {
  const [amount, setAmount] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [initiatedMerchantRequestID , setInitiatedMerchantRequestID] = useState('');
  const [initiatedCheckoutRequestID , setInitiatedCheckoutRequestID] = useState('');
  const [open, setOpen] = React.useState(false);
  const handleClose = () => {
    setOpen(false);
  };
  const handleOpen = () => {
    setOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if(!amount){
      toast.error("Please enter amount", {
        position: "bottom-center",
      });
      setLoading(false);
    }else if(!phoneNumber){
      toast.error("Please enter phone number", {
        position: "bottom-center",
      });
      setLoading(false);
    }else{
      try {
        const formData = new FormData();
        formData.append("amount", amount);
        formData.append("phoneNumber", phoneNumber);
        // Make a request to the backend server to initiate STK push
        setLoading(true);
        const response = await axios.post(
          "../..//Initiator.php", //Make it's live
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        setLoading(false);
  
        // Handle the response from the server
        const { success, message, transactionID, checkoutRequestID } = response.data;
          setInitiatedMerchantRequestID(transactionID);
         setInitiatedCheckoutRequestID(checkoutRequestID);
        if (success) {
          // Display success message to the user
          toast.success(message, {
            position: "top-center",
          });
          setOpen(true)
        }else{
          toast.error(message, {
            position: "bottom-center",
          });
        }
        
      } catch (error) {
        console.error(error);
        // Handle the error and display an error message to the user
        toast.error("An error occurred. Please try again later.",{
          position: "bottom-center",
        });
      }
    }
  };

  

  useEffect(() => {
    let swalDisplayed = false; // Flag to track if Swal modal has been displayed
  
    const fetchData = () => {
      fetch(`../../callback.php`)//Make sure it's live
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to fetch data from the server');
          }
          return response.json();
        })
        .then((data) => {
          const actualData = data.MpesaResponse;
  
          const jsonObjects = actualData.split('}{');
  
          let matchingPaymentStatus = null;
  
          jsonObjects.forEach((json, index) => {
            const jsonString =
              index === 0
                ? json + '}'
                : index === jsonObjects.length - 1
                ? '{' + json
                : '{' + json + '}';
  
            const parsedData = JSON.parse(jsonString);
            const merchantRequestID =
              parsedData.Body.stkCallback.MerchantRequestID;
            const resultCode = parsedData.Body.stkCallback.ResultCode;
  
            if (merchantRequestID === initiatedMerchantRequestID) {
              if (
                resultCode === 0 &&
                parsedData.Body.stkCallback.CallbackMetadata &&
                parsedData.Body.stkCallback.CallbackMetadata.Item
              ) {
                const items = parsedData.Body.stkCallback.CallbackMetadata.Item;
  
                matchingPaymentStatus = {
                  resultCode,
                  resultDesc: parsedData.Body.stkCallback.ResultDesc,
                  items,
                };
              } else {
                matchingPaymentStatus = {
                  resultCode,
                  resultDesc: parsedData.Body.stkCallback.ResultDesc,
                  items: [],
                };
              }
            }
          });
  
          // Show Swal modal based on the matching payment status if not displayed before
          if (matchingPaymentStatus && !swalDisplayed) {
            swalDisplayed = true; // Set flag to true
  
            if (
              matchingPaymentStatus.resultCode === 0 &&
              matchingPaymentStatus.items.length > 0
            ) {
              // Show success Swal modal with data
              setOpen(false)
              Swal.fire({
                icon: 'success',
                title: 'Payment Successful',
                html: `
                   ${matchingPaymentStatus.resultDesc}<br>
                  <strong>\n\nSummary</strong><br>
                  Ksh. ${matchingPaymentStatus.items[0].Value}<br>
                  ${matchingPaymentStatus.items[1].Value}<br>
                  +${matchingPaymentStatus.items[4].Value}<br>
                `,
                confirmButtonText: 'Close',
              }).then((result) => {
                if (result.isConfirmed) {
                  window.location.reload();
                }
              });
            } else {
              // Show error Swal modal
              setOpen(false)
              Swal.fire({
                icon: 'error',
                title: 'Transaction Failed',
                text: `${matchingPaymentStatus.resultDesc}`,
              }).then((result) => {
                if (result.isConfirmed) {
                  window.location.reload();
                }
              });
            }
          }
        })
        .catch((error) => {
          console.error(error);
          setMessage('An error occurred while checking for M-Pesa updates.');
        });
    };
  
    const interval = setInterval(fetchData, 1000);
  
    // Clear the interval when the component is unmounted
    return () => clearInterval(interval);
  }, [initiatedMerchantRequestID, initiatedCheckoutRequestID]);
  
  
  
  
  

  

  




  return (
    <div>
    <ToastContainer />
    <div oncontextmenu="return false" className="snippet-body">
    <div className="container d-flex justify-content-center">
      <div className="card mt-5 px-3 py-4">
        <div className="d-flex flex-row justify-content-around">
          <div className="mpesa"><span>Mpesa </span></div>
        </div>
        <div className="media mt-4 pl-2">
          <img src="/images/1200px-M-PESA_LOGO-01.svg.png" className="mr-3" height={75} />
          <div className="media-body">
            <h6 className="mt-1">Enter Amount &amp; Number</h6>
          </div>
        </div>
        <div className="media mt-3 pl-2">
          {/*bs5 input*/}
          <div className="row g-3">
            <div className="col-12">
              <label htmlFor="inputAddress" className="form-label">Amount</label>
              <input type="text" className="form-control" name="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter Amount" />
            </div>
            <div className="col-12">
              <label htmlFor="inputAddress2" className="form-label">Phone Number</label>
              <input type="text" className="form-control" name="phone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Format (2547...)" />
            </div>
            <center  className="col-12">
              <button onClick={handleSubmit} type="submit" className="btn btn-success" name="submit" disabled={loading}>
              {loading ? "Paying..." : "Pay Now"}
              </button>
            </center>
          </div>
          {/*bs5 input*/}
        </div>
      </div>
    </div>
  </div>
  <Backdrop
  sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
  open={open}
  onClick={handleClose}
>
  <CircularProgress color="inherit" />
</Backdrop>
    </div>
  );
};

export default PaymentForm;
