import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs";
import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import { count } from "../../utils/music";

import { POINTS, keypointConnections } from "../../utils/data";
import { drawPoint, drawSegment } from "../../utils/helper";
import { treeRightLegAngle } from "../../pages/Yoga/TreeCorrection";
import { chairHipAngle } from "../../pages/Yoga/ChairCorrection";
import { dogHipAngle } from "../../pages/Yoga/DogCorrection";
import { newPC, newSocket } from "../../utils/helper/socket";

let skeletonColor = "rgb(255,255,255)";
let interval;

// flag variable is used to help capture the time when AI just detect
// the pose as correct(probability more than threshold)
let flag = false;

const Videos = ({ isStartPose, currentPose, width, height, roomName }) => {
  // 1. Client에서 사용할 변수들
  const [pc, setPc] = useState(null);
  const [socket, setSocket] = useState(null);

  // 소켓 정보를 담을 Ref
  const socketRef = useRef(null);
  // 자신의 비디오
  const webcamRef = useRef(null);
  // 자신의 캔버스
  const canvasRef = useRef(null);
  // peer의 비디오
  const peercamRef = useRef(null);
  // peer의 캔버스
  const peerCanvasRef = useRef(null);

  // 2. Socket 수신 이벤트

  // Socket
  newSocket.on("welcome", () => {
    console.log("newPC.createOffer");
    const offer = newPC.createOffer();
    console.log("newPC.setLocalDescription");
    newPC.setLocalDescription(offer);
    console.log("emit offer");
    newSocket.emit("offer", { offer, roomName });
  });

  newSocket.on("offer", async (offer) => {
    newPC.setRemoteDescription(offer);
    const answer = await newPC.createAnswer();
    newPC.setLocalDescription(answer);
    console.log("emit answer");
    newSocket.emit("answer", { answer, roomName });
  });

  newSocket.on("ice", (ice) => {
    newPC.addIceCandidate(ice);
  });

  //setSocket(newSocket);
  //setPc(newPC);

  // 3. MediaStream 설정 및 RTCPeerConnection 이벤트
  navigator.mediaDevices
    .getUserMedia({
      video: true,
      audio: true,
    })
    .then((stream) => {
      if (webcamRef.current) webcamRef.current.srcObject = stream;

      // 자신의 video, audio track을 모두 자신의 RTCPeerConnection에 등록한다.
      stream.getTracks().forEach((track) => {
        newPC.addTrack(track, stream);
      });

      newPC.onicecandidate = (e) => {
        if (e.candidate) {
          console.log("onicecandidate");
          newSocket.emit("candidate", e.candidate);
        }
      };
      newPC.oniceconnectionstatechange = (e) => {
        console.log(e);
      };

      newPC.ontrack = (ev) => {
        console.log("add remotetrack success");
        if (peercamRef.current) peercamRef.current.srcObject = ev.streams[0];
      };
      // 자신의 video, audio track을 모두 자신의 RTCPeerConnection에 등록한 후에 room에 접속했다고 Signaling Server에 알림
      // offer or answer을 주고받을 때의 RTCSessionDescription에 해당 video, audio track에 대한 정보가 담겨 있기 때문
      // 순서를 어기면 상대방의 MediaStream을 받을 수 없음
      console.log("emit join_room event");
      newSocket.emit("join_room", { roomName });
    })
    .catch((error) => {
      console.log(`getUserMedia error:${error}`);
    });

  // // 4. 상대방에게 offer signal 전달
  // const createOffer = () => {
  //   newPC
  //     .createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true })
  //     .then((sdp) => {
  //       newPC.setLocalDescription(new RTCSessionDescription(sdp));
  //       newSocket.emit("offer", sdp);
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //     });
  // };

  // // 5. 상대방에게 answer signal 전달
  // const createAnswer = (sdp) => {
  //   newPC.setRemoteDescription(new RTCSessionDescription(sdp)).then(() => {
  //     console.log("answer set remote description success");
  //     newPC
  //       .createAnswer({
  //         offerToReceiveAudio: true,
  //         offerToReceiveAudio: true,
  //       })
  //       .then((sdp1) => {
  //         console.log("create answer");
  //         newPC.setLocalDescription(new RTCSessionDescription(sdp1));
  //         newSocket.emit("answer", sdp1);
  //       })
  //       .catch((error) => {
  //         console.log(error);
  //       });
  //   });
  // };

  // Pose Detection
  /**
   * currentPose가 바뀔 때
   * currentTime, poseTime, best 초기화
   * 변경된 pose에 맞춰서 pose classification 다시 실행
   */
  useEffect(() => {
    if (isStartPose) {
      runMovenet();
      clearInterval(interval);
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
              drawPoint(ctx, keypoint.x, keypoint.y, 8, "rgb(255,255,255)"); // 관절에 원 그리기
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
              flag = true;
            }
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

  return (
    <div className="Videos">
      <div className="myFace">
        <Webcam id="my-webcam" className="webcam" ref={webcamRef} />
        <canvas
          width={width}
          height={height}
          ref={canvasRef}
          id="my-canvas"
        ></canvas>
      </div>
      <div className="peerFace">
        <video
          width={width}
          id="peer-webcam"
          className="webcam"
          ref={peercamRef}
        />
        <canvas
          width={width}
          height={height}
          ref={peerCanvasRef}
          id="my-canvas"
        ></canvas>
      </div>
    </div>
  );
};

export default Videos;
