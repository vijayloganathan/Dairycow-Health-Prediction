import React from "react";
import Navbar from "./Navbar.jsx";
import Sidenav from "./Sidenav.jsx";
import cowimg from "../assets/image/cowlogo.png";
import Society_Details from "./Society_Details.jsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CollectionDateShift from "./CollectionDateShift.jsx";
import MemberlistForm from "./MemberlistForm.jsx";
import Milkcollection from "./Milkcollection.jsx";
import Todaycollection from "./Todaycollection.jsx";
import PaymentReport from "./PaymentReport.jsx";
import Healthreportform from "./Healthreportform.jsx";
import Healthreport from "./Healthreport.jsx";
import axios from "axios";

export default function Home() {
  return (
    <div>
      <Navbar />
      <div className="container-well">
        <div className="row m-1 ">
          <div className="col-2 bg-primary p-1 " style={{ height: "85vh" }}>
            <Sidenav />
          </div>
          <div
            className="col-9 p-1 "
            style={{
              backgroundImage: `url(${cowimg})`,
              width: "5vw",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
            }}
          >
            <div
              style={{
                height: "85vh",
                width: "82vw",
                backgroundColor: "rgb(255,255,255,0.8)",
              }}
              className="d-flex justify-content-center"
            >
              <Routes>
                <Route path="/" element={<CollectionDateShift />} />
                <Route path="/memberlist" element={<MemberlistForm />} />
                <Route path="/societydetails" element={<Society_Details />} />
                <Route path="/milkcollection" element={<Milkcollection />} />
                <Route path="/todaycollection" element={<Todaycollection />} />
                <Route path="/paymentreport" element={<PaymentReport />} />
                <Route path="/Healthreport" element={<Healthreport />} />
                <Route
                  path="/Healthreportform"
                  element={<Healthreportform />}
                />
              </Routes>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
