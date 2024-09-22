import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { useLocation } from "react-router-dom";

export default function Milkcollection() {
  const navigate = useNavigate();
  const location = useLocation();
  const { formData } = location.state;

  const [values, setValues] = useState({
    Member_code: "",
    Fat: "",
    Snf: "",
    total_litter: "",
    rate: "",
    totamt: "",
    Date: "",
    Shift: "",
  });
  const [rate, setRate] = useState("");
  const [totamt, setTotAmt] = useState("");
  const [loading, setLoading] = useState(false); // Loading state

  const handleChange = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
    axios
      .post("http://localhost:8081/rateandtotamt", values)
      .then((res) => {
        console.log(res.data.rate);
        setRate(res.data.rate);
        setValues((prevValues) => ({
          ...prevValues,
          rate: res.data.rate,
        }));
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    axios
      .get("http://localhost:8081/getdateandshift")
      .then((res) => {
        let data = res.data.dateandshift;
        if (data.Date == null || data.shift == null) {
          navigate("/home/");
        }
      })
      .catch((err) => {
        console.log(err);
      });

    if (values.total_litter && rate) {
      let tot = parseFloat(rate) * parseFloat(values.total_litter);
      tot = tot.toFixed(2);
      setTotAmt(tot);
      setValues((prevValues) => ({
        ...prevValues,
        totamt: tot,
      }));
    }
  }, [values.total_litter, rate]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setLoading(true); // Start loading
    // Add formData values to values state
    const updatedValues = {
      ...values,
      Date: formData.collectiondate,
      Shift: formData.collectionshift,
    };
    console.log(updatedValues);
    axios
      .post("http://localhost:8081/milkcoolection", updatedValues)
      .then((res) => {
        setLoading(false); // Stop loading
        document.getElementById("milkcollectionform").reset();
        document.getElementById("mci1").focus();
      })
      .catch((err) => {
        setLoading(false); // Stop loading in case of error too
        console.log(err);
      });
  };

  return (
    <div className="d-flex justify-content-center">
      <form
        className="align-self-center"
        onSubmit={handleSubmit}
        id="milkcollectionform"
      >
        <p className="h4 text-primary font-italic text-center">
          Milk Collection
        </p>
        <div className="form-row">
          <div className="form-group col-md-6">
            <label id="collection_date" value={formData.collectiondate}>
              Date : {formData.collectiondate}
            </label>
          </div>
          <div className="form-group col-md-6">
            <label id="collection_shift" value={formData.collectionshift}>
              Shift : {formData.collectionshift}
            </label>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group col-md-6">
            <label htmlFor="inputCity">Member Code</label>
            <input
              type="number"
              className="form-control transparent-textbox"
              name="Member_code"
              id="mci1"
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group col-md-6">
            <label htmlFor="inputCity">FAT</label>
            <input
              type="number"
              className="form-control transparent-textbox"
              name="Fat"
              onChange={handleChange}
              step="any"
              required
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group col-md-6">
            <label htmlFor="inputCity">SNF</label>
            <input
              type="number"
              className="form-control transparent-textbox"
              name="Snf"
              step="any"
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group col-md-6">
            <label htmlFor="inputCity">Total Litre</label>
            <input
              type="number"
              className="form-control transparent-textbox"
              name="total_litter"
              step="any"
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group col-md-6">
            <label htmlFor="inputCity">Rate per Litre</label>
            <input
              type="text"
              className="form-control transparent-textbox"
              value={rate}
              readOnly
            />
          </div>
          <div className="form-group col-md-6">
            <label htmlFor="inputCity">Total Amount</label>
            <input
              type="text"
              className="form-control transparent-textbox"
              value={totamt}
              readOnly
            />
          </div>
        </div>
        {loading && <div>Loading...</div>} {/* Show loader if loading */}
        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={loading}
        >
          {loading ? "Storing Data..." : "Store Data"}
        </button>
      </form>
    </div>
  );
}
