import React from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function Sidenav() {
  return (
    <div>
      <div>
        <p className="text-light">Master Details</p>
        <Link to="/home/societydetails" className="btn btn-light btn-block">
          Society Details
        </Link>
        <Link to="/home/memberlist" className="btn btn-light btn-block">
          Members Details
        </Link>
      </div>
      <div>
        <p className="text-light pt-2">Milk Collection</p>
        <Link to="/home/" className="btn btn-light btn-block">
          Collection
        </Link>
      </div>
      <div>
        <p className="text-light pt-2">Report</p>
        <Link to="/home/todaycollection" className="btn btn-light btn-block">
          Collection Report
        </Link>
        <Link to="/home/paymentreport" className="btn btn-light btn-block">
          Payment Report
        </Link>
        <Link to="/home/Healthreportform" className="btn btn-light btn-block">
          Health Report
        </Link>
      </div>
      <div>
        <p className="text-light pt-2">Exit</p>
        <Link to="/" className="btn btn-danger btn-block">
          Logout
        </Link>
      </div>
    </div>
  );
}
