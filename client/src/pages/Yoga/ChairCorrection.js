const chairStandard = [
  { x: 0.4151263, y: 0.6763357, score: 0.46244398 },
  { x: 0.40119344, y: 0.66654164, score: 0.5150109 },
  { x: 0.40025386, y: 0.67060304, score: 0.46979463 },
  { x: 0.4075074, y: 0.61851543, score: 0.6172898 },
  { x: 0.40638158, y: 0.6359537, score: 0.77457696 },
  { x: 0.46859726, y: 0.58639604, score: 0.6500471 },
  { x: 0.4656672, y: 0.61468244, score: 0.7987385 },
  { x: 0.37003586, y: 0.71255255, score: 0.5305863 },
  { x: 0.3721741, y: 0.72061014, score: 0.40647694 },
  { x: 0.28963658, y: 0.76605123, score: 0.54302645 },
  { x: 0.28026998, y: 0.77128863, score: 0.47480232 },
  { x: 0.6742412, y: 0.45161873, score: 0.70362836 },
  { x: 0.67354965, y: 0.44396913, score: 0.73701876 },
  { x: 0.7489676, y: 0.6216945, score: 0.62059146 },
  { x: 0.7642269, y: 0.6230739, score: 0.7015353 },
  { x: 0.9015726, y: 0.5381875, score: 0.6787855 },
  { x: 0.9141815, y: 0.537426, score: 0.66579205 },
];

let beforeActoion = false;

// Standart Hip Angle = 77.46

export const chairHipAngle = (poses) => {
  const point1 = poses[0].keypoints[6]; // RIGHT_SHOULDER = 6
  const point2 = poses[0].keypoints[12]; // RIGHT_HIP = 12
  const point3 = poses[0].keypoints[14]; // RIGHT_KNEE = 14

  const cpoint1 = poses[0].keypoints[5]; // LIFT_SHOULDER = 6
  const cpoint2 = poses[0].keypoints[11]; // LIFT_HIP = 12
  const cpoint3 = poses[0].keypoints[13]; // LIFT_KNEE = 14

  let hipAngle = 0;
  let angle = 0;

  const angle1 = Math.atan2(point1.y - point2.y, point1.x - point2.x);
  const angle2 = Math.atan2(point3.y - point2.y, point3.x - point2.x);

  if (angle1 >= angle2) {
    angle = (angle1 - angle2) * (180 / Math.PI);
    angle = angle % 180;
  } else {
    angle = (angle2 - angle1) * (180 / Math.PI);
    angle = angle % 180;
  }

  if (point1.score > 0.3 && point2.score > 0.3 && point3.score > 0.3) {
    hipAngle = angle;
  }

  const fail = new SpeechSynthesisUtterance("엉덩이를 더 내리세요");
  fail.lang = "ko-KR";
  const success = new SpeechSynthesisUtterance("성공입니다");
  success.lang = "ko-KR";

  if (hipAngle > 100) {
    if (beforeActoion == false) {
      console.log("fail");
    } else {
      window.speechSynthesis.cancel();
      console.log("fail2");
      window.speechSynthesis.speak(fail);
    }
    beforeActoion = false;
  } else {
    if (beforeActoion == false) {
      window.speechSynthesis.cancel();
      console.log("success");
      window.speechSynthesis.speak(success);
    } else {
      console.log("success2");
    }
    beforeActoion = true;
  }

  return { hipAngle, point1, point2, point3, cpoint1, cpoint2, cpoint3 };
};
