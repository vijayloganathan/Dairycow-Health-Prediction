import React from "react";
import cowlogo from "../assets/image/cowlogo.png";
import axios from "axios";

export default function Navbar() {
  return (
    <div>
      <div className="container-well m-1 bg-primary p-1">
        <div className="row">
          <div className="col-1">
            <img src={cowlogo} alt="" style={{ width: "5vw" }} />
          </div>
          <div className="col-11 align-self-center">
            <p className=" h5 text-light font-italic text-center">
              A Comprehensive Machine Learning Approach for Predictive Dairy
              Cows Health Monitoring Periodically and Research Across COVID Eras
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
