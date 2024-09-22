import React, { useState, useEffect } from "react";
import axios from "axios";

export default function () {
  const [values, setValues] = useState({
    Member_Id: "",
    Member_Name: "",
    Member_Mobile: "",
  });
  const [members, setMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleChange = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  function getMembersData() {
    axios
      .get("http://localhost:8081/get_members_data")
      .then((res) => {
        let data = res.data.member_data;
        setMembers(data); // Save the data to the state variable
      })
      .catch((err) => {
        console.log(err);
      });
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    axios
      .post("http://localhost:8081/Add_Member_Details", values)
      .then((res) => {
        getMembersData();
        alert("Member Details Added or Updated Successfully");
        // Clear form values
        setValues({
          Member_Id: "",
          Member_Name: "",
          Member_Mobile: "",
        });
        setSelectedMemberId(null); // Reset selected member ID
        document.getElementById("add_member_form").reset();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleUpdate = (memberId) => {
    // Find the member with the given ID
    const selectedMember = members.find(
      (member) => member.Member_Id === memberId
    );
    // Set form values with the selected member's data
    setValues({
      Member_Id: selectedMember.Member_Id,
      Member_Name: selectedMember.Member_Name,
      Member_Mobile: selectedMember.Member_Mobile,
    });
    // Set the selected member's ID
    setSelectedMemberId(memberId);
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  useEffect(() => {
    getMembersData();
  }, []); // Empty array as the second argument to run only once on mount

  // Filter members based on search query
  const filteredMembers = members.filter(
    (member) =>
      member.Member_Id.includes(searchQuery) ||
      member.Member_Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.Member_Mobile.includes(searchQuery)
  );

  return (
    <div className="align-self-center">
      <p className="h4 text-primary font-italic text-center">
        Member List Updation
      </p>
      <div>
        <form className="form-inline mt-4 d-flex justify-content-center">
          <div className="form-group mx-sm-3 mb-2">
            <input
              type="text"
              className="form-control transparent-textbox"
              id="inputPassword2"
              placeholder="Search Members"
              onChange={handleSearch}
              value={searchQuery}
            />
          </div>
        </form>
      </div>
      <div className="mt-3">
        <form onSubmit={handleSubmit} id="add_member_form">
          <div className="form-row rounded">
            <div className="col">
              <input
                type="number"
                className="form-control"
                placeholder="Member ID"
                onChange={handleChange}
                name="Member_Id"
                value={values.Member_Id}
                disabled={selectedMemberId ? true : false} // Disable input for update
              />
            </div>
            <div className="col">
              <input
                type="text"
                className="form-control"
                placeholder="Member Name"
                onChange={handleChange}
                name="Member_Name"
                value={values.Member_Name}
              />
            </div>
            <div className="col">
              <input
                type="number"
                className="form-control"
                placeholder="Mobile Number"
                onChange={handleChange}
                name="Member_Mobile"
                value={values.Member_Mobile}
              />
            </div>
            <button type="submit" className="btn btn-primary mb-2">
              {selectedMemberId ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
      <div>
        <p className="h6 text-primary font-italic m-2">Member List</p>
        <div className="" style={{ overflowY: "scroll", maxHeight: "200px" }}>
          <table className="table table-bordered">
            <thead className="bg-primary">
              <tr className="text-light">
                <th>Member Code</th>
                <th>Farmer Name</th>
                <th>Mobile Number</th>
                <th>Update Button</th>
              </tr>
            </thead>
            <tbody>
              {/* Render filtered members */}
              {filteredMembers.map((member, index) => (
                <tr key={index}>
                  <td>{member.Member_Id}</td>
                  <td>{member.Member_Name}</td>
                  <td>{member.Member_Mobile}</td>
                  <td>
                    <button
                      className="btn btn-info btn-block"
                      onClick={() => handleUpdate(member.Member_Id)}
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
