import React from "react";
import { Link } from "react-router-dom";

import "./Home.css";
import yogaIcon from "../../utils/images/yoga_icon.png";

export default function Home() {
  return (
    <div className="home-container">
      <div className="home-header">
        <h1 className="home-heading">SUDA</h1>
      </div>

      <div className="home-main">
        <img src={yogaIcon} />
        <h3 className="description">Yoga Correction</h3>
        <div className="btn-section">
          <Link to="/start">
            <button className="btn login-btn">시작</button>
          </Link>
          <Link to="/peeryoga">
            <button className="btn login-btn">함께하기</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
