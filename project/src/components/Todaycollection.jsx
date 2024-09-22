import React, { useState, useEffect } from "react";
import axios from "axios";

export default function TodayCollection() {
  const [values, setValues] = useState({
    collectiondate: "", // Initially empty
    collectionshift: "Morning",
  });

  const [loading, setLoading] = useState(false); // State variable for loading

  const handleChange = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  useEffect(() => {
    // Set today's date when the component mounts
    const today = new Date().toISOString().split("T")[0];
    setValues((prevState) => ({ ...prevState, collectiondate: today }));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true); // Set loading to true when the request starts
    try {
      const response = await axios.post(
        "http://localhost:8081/downloadtodayreport",
        values,
        { responseType: "blob" } // Set response type to blob
      );

      // Create a Blob from the PDF data
      const pdfBlob = new Blob([response.data], { type: "application/pdf" });

      // Create a temporary URL for the Blob
      const url = window.URL.createObjectURL(pdfBlob);

      // Create a link element and simulate a click to trigger the download
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        values.collectiondate +
          "-" +
          values.collectionshift +
          "-collection_report.pdf"
      );
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
            <label htmlFor="formGroupExampleInput">Select Date</label>
            <input
              type="date"
              className="form-control transparent-textbox"
              id="formGroupExampleInput"
              onChange={handleChange}
              placeholder="Example input"
              name="collectiondate"
              value={values.collectiondate} // Set the value to the state
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="formGroupExampleInput2">Select Shift</label>
            <select
              className="form-control transparent-textbox"
              name="collectionshift"
              onChange={handleChange}
              value={values.collectionshift} // Set the value to the state
              required
            >
              <option value="Morning">Morning Shift</option>
              <option value="Evening">Evening Shift</option>
            </select>
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
