import React, { useState, useEffect } from "react";
import axios from "axios";

export default function PaymentReport() {
  const [values, setValues] = useState({
    fromdate: "",
    todate: "",
  });

  const [loading, setLoading] = useState(false); // State variable for loading

  const handleChange = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  useEffect(() => {
    // Set today's date when the component mounts
    const today = new Date().toISOString().split("T")[0];
    setValues((prevState) => ({
      ...prevState,
      fromdate: today,
      todate: today,
    }));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true); // Set loading to true when the request starts
    try {
      const response = await axios.post(
        "https://dairycow-health-prediction.onrender.com/payment_Report_Download",
        values,
        { responseType: "blob" } // Set response type to blob
      );

      // Create a Blob from the PDF data
      const pdfBlob = new Blob([response.data], { type: "application/pdf" });

      // Create a temporary URL for the Blob
      const url = window.URL.createObjectURL(pdfBlob);

      // Create a link element and set attributes for download
      const link = document.createElement("a");
      link.href = url;
      link.download =
        "Payment Report " + values.fromdate + " To " + values.todate + " .pdf"; // Set the download attribute
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false); // Set loading to false when the request completes (success or error)
    }
  };

  return (
    <div className="col-6 align-self-center">
      <div>
        <p className="h4 text-primary font-italic text-center">
          Collection Report
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fromdate">Select From Date</label>
            <input
              type="date"
              className="form-control transparent-textbox"
              id="fromdate"
              onChange={handleChange}
              name="fromdate"
              value={values.fromdate}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="todate">Select To Date</label>
            <input
              type="date"
              className="form-control transparent-textbox"
              id="todate"
              onChange={handleChange}
              name="todate"
              value={values.todate}
              required
            />
          </div>
          <div>
            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? "Downloading..." : "Download Collection Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
