import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs";
import React, { useRef, useState, useEffect } from "react";
import backend from "@tensorflow/tfjs-backend-webgl";
import Webcam from "react-webcam";
import { count } from "../../utils/music";

import Instructions from "../../components/Instrctions/Instructions";

import "./Yoga.css";

import { poseImages } from "../../utils/pose_images";
import back_arrow from "../../utils/images/arrow.png";
import { POINTS, keypointConnections } from "../../utils/data";
import { drawPoint, drawSegment } from "../../utils/helper";
import { treeRightLegAngle } from "./TreeCorrection";
import { chairHipAngle } from "./ChairCorrection";
import { dogHipAngle } from "./DogCorrection";
import { NavLink } from "react-router-dom";
import useDidMountEffect from "../../utils/helper/useDidMountEffect.js";

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

const Yoga = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const [startingTime, setStartingTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [poseTime, setPoseTime] = useState(0);
  const [bestPerform, setBestPerform] = useState(0);
  const [currentPose, setCurrentPose] = useState("Tree");
  const [isStartPose, setIsStartPose] = useState(false);

  useEffect(() => {
    const timeDiff = (currentTime - startingTime) / 1000;
    if (flag) {
      setPoseTime(timeDiff);
    }
    if ((currentTime - startingTime) / 1000 > bestPerform) {
      setBestPerform(timeDiff);
    }
  }, [currentTime]);

  useEffect(() => {
    setCurrentTime(0);
    setPoseTime(0);
    setBestPerform(0);
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

  function get_pose_size(landmarks, torso_size_multiplier = 2.5) {
    let hips_center = get_center_point(
      landmarks,
      POINTS.LEFT_HIP,
      POINTS.RIGHT_HIP
    );
    let shoulders_center = get_center_point(
      landmarks,
      POINTS.LEFT_SHOULDER,
      POINTS.RIGHT_SHOULDER
    );
    let torso_size = tf.norm(tf.sub(shoulders_center, hips_center));
    let pose_center_new = get_center_point(
      landmarks,
      POINTS.LEFT_HIP,
      POINTS.RIGHT_HIP
    );
    pose_center_new = tf.expandDims(pose_center_new, 1);

    pose_center_new = tf.broadcastTo(pose_center_new, [1, 17, 2]);
    // return: shape(17,2)
    let d = tf.gather(tf.sub(landmarks, pose_center_new), 0, 0);
    let max_dist = tf.max(tf.norm(d, "euclidean", 0));

    // normalize scale
    let pose_size = tf.maximum(
      tf.mul(torso_size, torso_size_multiplier),
      max_dist
    );
    return pose_size;
  }

  function normalize_pose_landmarks(landmarks) {
    let pose_center = get_center_point(
      landmarks,
      POINTS.LEFT_HIP,
      POINTS.RIGHT_HIP
    );
    pose_center = tf.expandDims(pose_center, 1);
    pose_center = tf.broadcastTo(pose_center, [1, 17, 2]);
    landmarks = tf.sub(landmarks, pose_center);

    let pose_size = get_pose_size(landmarks);
    landmarks = tf.div(landmarks, pose_size);
    return landmarks;
  }

  function landmarks_to_embedding(landmarks) {
    // normalize landmarks 2D
    landmarks = normalize_pose_landmarks(tf.expandDims(landmarks, 0));
    let embedding = tf.reshape(landmarks, [1, 34]);
    return embedding;
  }

  const runMovenet = async () => {
    const detectorConfig = {
      modelType: poseDetection.movenet.modelType.SINGLE_THUNDER,
    };
    const detector = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      detectorConfig
    );
    const poseClassifier = await tf.loadLayersModel(
      "https://models.s3.jp-tok.cloud-object-storage.appdomain.cloud/model.json"
    );
    const countAudio = new Audio(count);
    countAudio.loop = true;
    interval = setInterval(() => {
      detectPose(detector, poseClassifier, countAudio);
    }, 100);
  };

  const detectPose = async (detector, poseClassifier, countAudio) => {
    console.log("현재 포즈 : ", currentPose);
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      let notDetected = 0;
      const video = webcamRef.current.video;
      const pose = await detector.estimatePoses(video);
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      try {
        const keypoints = pose[0].keypoints;
        let input = keypoints.map((keypoint) => {
          if (keypoint.score > 0.4) {
            if (
              !(keypoint.name === "left_eye" || keypoint.name === "right_eye")
            ) {
              drawPoint(
                ctx,
                keypoint.x * 1.5,
                keypoint.y * 1.5,
                8,
                "rgb(255,255,255)"
              ); // 관절에 원 그리기
              let connections = keypointConnections[keypoint.name]; // keypointConnection 안에는 각각의 점이 어떤 점과 연결되는지 정의되어있음
              try {
                connections.forEach((connection) => {
                  let conName = connection.toUpperCase();
                  drawSegment(
                    ctx,
                    [keypoint.x, keypoint.y], // 현재 keypoint의 좌표
                    [
                      // 연결되어야 하는 connection의 좌표
                      keypoints[POINTS[conName]].x,
                      keypoints[POINTS[conName]].y,
                    ],
                    skeletonColor
                  );
                });
              } catch (err) {}
            }
          } else {
            notDetected += 1; // 정확도 0.4 안 넘으면 notDetected +1
          }
          return [keypoint.x, keypoint.y]; // input은 각각의 keypoint의 x, y 좌표 담고 있음
        });
        if (notDetected > 4) {
          skeletonColor = "rgb(255,255,255)";
          return;
        }
        const processedInput = landmarks_to_embedding(input);
        const classification = poseClassifier.predict(processedInput);

        classification.array().then((data) => {
          const classNo = CLASS_NO[currentPose];
          //console.log(data[0][classNo]);
          if (data[0][classNo] > 0.97) {
            if (!flag) {
              countAudio.play();
              setStartingTime(new Date(Date()).getTime());
              flag = true;
            }
            setCurrentTime(new Date(Date()).getTime());
            skeletonColor = "rgb(0,255,0)";

            switch (currentPose) {
              case "Tree":
                //const { rLegAngle, rightAnkle, rightKnee, rightHip } = treeRightLegAngle(pose);
                const treeLeg = treeRightLegAngle(pose);
                if (treeLeg.rLegAngle > 55) {
                  drawSegment(
                    ctx,
                    [treeLeg.rightAnkle.x, treeLeg.rightAnkle.y],
                    [treeLeg.rightKnee.x, treeLeg.rightKnee.y],
                    "rgb(255, 0, 0)"
                  );
                  drawSegment(
                    ctx,
                    [treeLeg.rightHip.x, treeLeg.rightHip.y],
                    [treeLeg.rightKnee.x, treeLeg.rightKnee.y],
                    "rgb(255, 0, 0)"
                  );
                }
                break;
              case "Chair":
                const chairHip = chairHipAngle(pose);
                if (chairHip.hipAngle > 100) {
                  drawSegment(
                    ctx,
                    [chairHip.point1.x, chairHip.point1.y],
                    [chairHip.point2.x, chairHip.point2.y],
                    "rgb(255, 0, 0)"
                  );
                  drawSegment(
                    ctx,
                    [chairHip.point3.x, chairHip.point3.y],
                    [chairHip.point2.x, chairHip.point2.y],
                    "rgb(255, 0, 0)"
                  );
                  drawSegment(
                    ctx,
                    [chairHip.cpoint1.x, chairHip.cpoint1.y],
                    [chairHip.cpoint2.x, chairHip.cpoint2.y],
                    "rgb(255, 0, 0)"
                  );
                  drawSegment(
                    ctx,
                    [chairHip.cpoint3.x, chairHip.cpoint3.y],
                    [chairHip.cpoint2.x, chairHip.cpoint2.y],
                    "rgb(255, 0, 0)"
                  );
                }
                break;
              case "Dog":
                const dogHip = dogHipAngle(pose);
                if (dogHip.hipAngle > 90 || dogHip.hipAngle < 50) {
                  drawSegment(
                    ctx,
                    [dogHip.point1.x, dogHip.point1.y],
                    [dogHip.point2.x, dogHip.point2.y],
                    "rgb(255, 0, 0)"
                  );
                  drawSegment(
                    ctx,
                    [dogHip.point3.x, dogHip.point3.y],
                    [dogHip.point2.x, dogHip.point2.y],
                    "rgb(255, 0, 0)"
                  );
                  drawSegment(
                    ctx,
                    [dogHip.cpoint1.x, dogHip.cpoint1.y],
                    [dogHip.cpoint2.x, dogHip.cpoint2.y],
                    "rgb(255, 0, 0)"
                  );
                  drawSegment(
                    ctx,
                    [dogHip.cpoint3.x, dogHip.cpoint3.y],
                    [dogHip.cpoint2.x, dogHip.cpoint2.y],
                    "rgb(255, 0, 0)"
                  );
                }
                break;

              default:
                break;
            }
          } else {
            flag = false;
            skeletonColor = "rgb(255,255,255)";
            countAudio.pause();
            countAudio.currentTime = 0;
          }
        });
      } catch (err) {
        console.log(err);
      }
    }
  };

  function startYoga() {
    setIsStartPose(true);
    runMovenet();
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
            <div class="drop-container" onClick={() => changePose(pose)}>
              <p className="dropdown-item-1">{pose.en}</p>
            </div>
          ))}
          <button onClick={stopPose} className="secondary-btn">
            Stop Pose
          </button>
        </div>
        <div className="performance-container">
          <div className="pose-performance">
            <h4>Pose Time: {poseTime} s</h4>
          </div>
          <div className="pose-performance">
            <h4>Best: {bestPerform} s</h4>
          </div>
        </div>
        <div className="webcam-canvas-container">
          <Webcam
            width="960px"
            height="720px"
            id="webcam"
            ref={webcamRef}
            style={{
              position: "absolute",
              top: 100,
              padding: "0px",
            }}
          />
          <canvas
            ref={canvasRef}
            id="my-canvas"
            width="960px"
            height="720px"
            style={{
              position: "absolute",
              top: 100,
              zIndex: 1,
            }}
          ></canvas>
          <div>
            <img src={poseImages[currentPose]} className="pose-img" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="yoga-container">
      <div className="yoga-header">
        {poseList.map((pose) => (
          <div class="drop-container" onClick={() => setCurrentPose(pose.en)}>
            <p className="dropdown-item-1">{pose.en}</p>
          </div>
        ))}
        <button onClick={startYoga} className="secondary-btn">
          Start
        </button>
      </div>
      <Instructions currentPose={currentPose} />
    </div>
  );
};

export default Yoga;
