import React from "react";
import { Link } from "react-router-dom";
import cowimg from "../assets/image/cow 3.jpg";
import axios from "axios";

export default function Landingpage() {
  return (
    <div>
      <div
        style={{
          backgroundImage: `url(${cowimg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        id="landpg"
      >
        <div
          className="row d-flex align-items-center justify-content-center"
          style={{ height: "100vh", backgroundColor: "rgb(6, 6, 6,0.8)" }}
        >
          <div className="col-10 d-flex justify-content-center">
            <p
              className="h3 text-light font-italic"
              style={{ textAlign: "center" }}
            >
              A Comprehensive Machine Learning Approach for Predictive Dairy
              Cows Health Monitoring Periodically and Research Across COVID Eras
            </p>
          </div>
          <div className="col-6 d-flex justify-content-center">
            <p className="h3 text-light font-italic">
              Let's Start The Milk <br></br>Collection Now!!!
            </p>
          </div>
          <div className="col-6 d-flex justify-content-center">
            <Link to="/home" className="btn btn-primary">
              Start Collection
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
