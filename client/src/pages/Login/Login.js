import React from "react";
import { Link } from "react-router-dom";

import "./Login.css";

import { tutorials, fixCamera } from "../../utils/data";

export default function Login() {
  return (
    <div className="login-container">
      <div className="login-form-container">
        <h1>로그인 페이지</h1>
      </div>
      <div className="btn-section">
        <Link to="/start">
          <button className="btn start-btn">시작</button>
        </Link>
      </div>
    </div>
  );
}
