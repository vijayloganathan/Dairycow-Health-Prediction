import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function CollectionDateShift() {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    collectiondate: "", // Initially empty
    collectionshift: "Morning",
  });

  useEffect(() => {
    // Set today's date when the component mounts
    const today = new Date().toISOString().split("T")[0];
    setValues((prevState) => ({ ...prevState, collectiondate: today }));
  }, []);

  const handleChange = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    axios
      .post("http://localhost:8081/shiftdetail", values)
      .then((res) => {
        console.log("Collection started!!");
        navigate("/home/milkcollection", { state: { formData: values } });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div className="col-6 align-self-center">
      <p className="h4 text-primary font-italic text-center">Milk Collection</p>
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
          <button type="submit" className="btn btn-primary btn-block">
            Confirm Date and Shift
          </button>
        </div>
      </form>
    </div>
  );
}
