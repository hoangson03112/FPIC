import { Container, Row, Col, Form, Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import Header from "../elements/Header";
import { useEffect, useState } from "react";
import AccountContext from "../http/AccountContext";

const Profile = () => {
  const [account, setAccount] = useState({
    firstName: "",
    surname: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    postcode: "",
    state: "",
    area: "",
    email: "",
    education: "",
    country: "",
    region: "",
    experience: "",
    additionalDetails: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await AccountContext.Authentication(); // Đảm bảo Authentication là một hàm async
        setAccount(data.account);
      } catch (error) {
        console.error("Error during authentication:", error);
      }
    };

    fetchData();
  }, []); // Chạy effect chỉ một lần khi component mount

  return (
    <div className="container rounded bg-white mt-5 mb-5">
      <div className="row">
        <div className="col-md-3 border-right">
          <div className="d-flex flex-column align-items-center text-center p-3 py-5">
            <img
              className="rounded-circle mt-5"
              width="150px"
              src={
                account?.avatar ??
                "https://i.pinimg.com/736x/f5/97/55/f59755a3995d1d20d1daa8d98c3ba5ac.jpg"
              }
              alt="profile"
            />
            <span className="font-weight-bold">{account.firstName}</span>
            <span className="text-black-50">{account.email}</span>
          </div>
        </div>
        <div className="col-md-5 border-right">
          <div className="p-3 py-5">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="text-right">Profile Settings</h4>
            </div>
            <div className="row mt-2">
              <div className="col-md-6">
                <label className="labels">FistNAme</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="First name"
                  value={account.firstName}
                />
              </div>
              <div className="col-md-6">
                <label className="labels">LastName</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Surname"
                  value={account.lastName}
                />
              </div>
            </div>
            <div className="row mt-3">
              <div className="col-md-12">
                <label className="labels">Mobile Number</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter phone number"
                  value={account.phoneNumber}
                />
              </div>

              <div className="col-md-12">
                <label className="labels">Email </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter email"
                  value={account.email}
                  onChange={(e) =>
                    setAccount({ ...account, email: e.target.value })
                  }
                />
              </div>
            </div>

            <button className="btn btn-danger mt-5" type="button">
              Save Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
