import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Healthreportform() {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    membercode: "",
    fromdate: "",
    todate: "",
  });

  useEffect(() => {
    setValues((prevState) => ({
      ...prevState,
      fromdate: "2020",
      todate: "2020",
    }));
  }, []);

  const handleChange = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      navigate("/home/Healthreport", { state: { formData: values } });
    } catch (error) {
      console.error("Error:", error);
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
            <label htmlFor="fromdate">Enter Member Code</label>
            <input
              type="text"
              className="form-control transparent-textbox"
              name="membercode"
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="fromdate">Select From Date</label>
            <select
              className="form-control transparent-textbox"
              onChange={handleChange}
              name="fromdate"
            >
              <option value="2020">2020</option>
              <option value="2021">2021</option>
              <option value="2022">2022</option>
              <option value="2023">2023</option>
              <option value="2024">2024</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="fromdate">Select To Date</label>
            <select
              className="form-control transparent-textbox"
              onChange={handleChange}
              name="todate"
            >
              <option value="2020">2020</option>
              <option value="2021">2021</option>
              <option value="2022">2022</option>
              <option value="2023">2023</option>
              <option value="2024">2024</option>
            </select>
          </div>
          <div>
            <button type="submit" className="btn btn-primary btn-block">
              Show Health Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
