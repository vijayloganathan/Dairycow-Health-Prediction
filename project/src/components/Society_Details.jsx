import React, { useState, useEffect } from "react";
import axios from "axios";
import "./style.css";

export default function Society_Details() {
  const [values, setValues] = useState({
    Center_Number: "",
    Owner_Name: "",
    Center_Name: "",
    Center_Address: "",
    Mobile_Number: "",
    Pincode: "",
  });

  const handleChange = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:8081/get_society_details");
      const data = res.data.data;
      setValues({
        Center_Number: data.Center_Number,
        Owner_Name: data.Owner_Name,
        Center_Name: data.Center_Name,
        Center_Address: data.Center_Address,
        Mobile_Number: data.Mobile_Number,
        Pincode: data.Pincode,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    axios
      .post("http://localhost:8081/Society_Details_Update", values)
      .then((res) => {
        alert("Society Details Updated Successfully");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="col-6 align-self-center">
      <p className="h4 font-italic text-primary text-center">Society Details</p>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group col-md-6">
            <label htmlFor="Center_Number">Center Number</label>
            <input
              type="number"
              className="form-control transparent-textbox"
              name="Center_Number"
              placeholder="Center No"
              onChange={handleChange}
              value={values.Center_Number}
              required
            />
          </div>
          <div className="form-group col-md-6">
            <label htmlFor="Owner_Name">Milk Collector Name</label>
            <input
              type="text"
              className="form-control transparent-textbox"
              name="Owner_Name"
              placeholder="Owner Name"
              onChange={handleChange}
              value={values.Owner_Name}
              required
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="Center_Name">Center Name</label>
          <input
            type="text"
            className="form-control transparent-textbox"
            name="Center_Name"
            placeholder="Center Name"
            onChange={handleChange}
            value={values.Center_Name}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="Center_Address">Center Address</label>
          <input
            type="text"
            className="form-control transparent-textbox"
            name="Center_Address"
            placeholder="Address"
            onChange={handleChange}
            value={values.Center_Address}
            required
          />
        </div>
        <div className="form-row">
          <div className="form-group col-md-6">
            <label htmlFor="Mobile_Number">Mobile Number</label>
            <input
              type="text"
              className="form-control transparent-textbox"
              name="Mobile_Number"
              placeholder="Contact Number"
              onChange={handleChange}
              value={values.Mobile_Number}
              required
            />
          </div>
          <div className="form-group col-md-6">
            <label htmlFor="Pincode">Pincode</label>
            <input
              type="text"
              className="form-control transparent-textbox"
              name="Pincode"
              placeholder="Pincode"
              onChange={handleChange}
              value={values.Pincode}
              required
            />
          </div>
        </div>
        <button type="submit" className="btn btn-primary btn-block">
          Update
        </button>
      </form>
    </div>
  );
}
