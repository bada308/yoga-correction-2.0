import * as tf from "@tensorflow/tfjs";
import React, { useRef, useState, useEffect } from "react";

import Instructions from "../../components/Instrctions/Instructions";

import "./Yoga.css";

import { poseImages } from "../../utils/pose_images";
import { POINTS, keypointConnections } from "../../utils/data";
import Videos from "../../components/\bYoga/Videos";

let skeletonColor = "rgb(255,255,255)";
let poseList = [
  { en: "Tree", kr: "나무 자세" },
  { en: "Chair", kr: "의자 자세" },
  { en: "Dog", kr: "개 자세" },
];

let interval;

// flag variable is used to help capture the time when AI just detect
// the pose as correct(probability more than threshold)
let flag = false;

const PeerYoga = () => {
  const [currentPose, setCurrentPose] = useState("Tree");
  const [isStartPose, setIsStartPose] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [welHidden, setWelHidden] = useState(false);

  /**
   * currentPose가 바뀔 때
   * currentTime, poseTime, best 초기화
   * 변경된 pose에 맞춰서 pose classification 다시 실행
   */
  useEffect(() => {
    if (isStartPose) {
      stopPose();
      startYoga();
    }
  }, [currentPose]);

  const CLASS_NO = {
    Chair: 0,
    Cobra: 1,
    Dog: 2,
    No_Pose: 3,
    Shoulderstand: 4,
    Traingle: 5,
    Tree: 6,
    Warrior: 7,
  };

  function get_center_point(landmarks, left_bodypart, right_bodypart) {
    let left = tf.gather(landmarks, left_bodypart, 1);
    let right = tf.gather(landmarks, right_bodypart, 1);
    const center = tf.add(tf.mul(left, 0.5), tf.mul(right, 0.5));
    return center;
  }

  function startYoga() {
    setIsStartPose(true);
  }

  function stopPose() {
    setIsStartPose(false);
    clearInterval(interval);
  }

  function changePose(pose) {
    setCurrentPose(pose.en);
  }

  if (isStartPose) {
    return (
      <div className="yoga-container">
        <div className="yoga-header">
          {poseList.map((pose) => (
            <div className="drop-container" onClick={() => changePose(pose)}>
              <p className="dropdown-item-1">{pose.en}</p>
            </div>
          ))}
          <button onClick={stopPose} className="secondary-btn">
            Stop Pose
          </button>
        </div>
        <div className="webcam-canvas-container">
          <Videos
            currentPose={currentPose}
            isStartPose={isStartPose}
            width={"800px"}
            height={"600px"}
            roomName={roomName}
          />
        </div>
        <div>
          <img src={poseImages[currentPose]} className="pose-img" hidden />
        </div>
      </div>
    );
  }

  return (
    <div className="yoga-container">
      <div className="yoga-header">
        {poseList.map((pose) => (
          <div
            className="drop-container"
            onClick={() => setCurrentPose(pose.en)}
          >
            <p className="dropdown-item-1">{pose.en}</p>
          </div>
        ))}
        <div className="welcome">
          <form onSubmit={startYoga}>
            <input
              type={"text"}
              placeholder={"Room Name"}
              required
              onChange={({ target: { value } }) => setRoomName(value)}
            ></input>
            <button className="secondary-btn">Enter Room</button>
          </form>
        </div>
      </div>

      <Instructions currentPose={currentPose} />
    </div>
  );
};

export default PeerYoga;
