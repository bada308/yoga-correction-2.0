const dogStandard = [
  { x: 0.6321335, y: 0.6020304, score: 0.76484156 },
  { x: 0.6339438, y: 0.62207144, score: 0.72034204 },
  { x: 0.63619894, y: 0.62556887, score: 0.70814425 },
  { x: 0.58186066, y: 0.65808547, score: 0.5938159 },
  { x: 0.5815069, y: 0.66335976, score: 0.586529 },
  { x: 0.5152237, y: 0.6111894, score: 0.83710915 },
  { x: 0.51687896, y: 0.6015134, score: 0.7619861 },
  { x: 0.64691913, y: 0.73081845, score: 0.78491443 },
  { x: 0.66569304, y: 0.7275232, score: 0.7180992 },
  { x: 0.7324672, y: 0.8418352, score: 0.6079475 },
  { x: 0.76469105, y: 0.8497374, score: 0.6594322 },
  { x: 0.22531614, y: 0.34919772, score: 0.712031 },
  { x: 0.22617385, y: 0.33823404, score: 0.72365373 },
  { x: 0.48677891, y: 0.2153439, score: 0.761714 },
  { x: 0.48639774, y: 0.20910415, score: 0.8440134 },
  { x: 0.7086432, y: 0.09311967, score: 0.658287 },
  { x: 0.71208286, y: 0.0797503, score: 0.6776126 },
];

let beforeActoion=false;

// Standard Hip Angle = 68.56

export const dogHipAngle = (poses) => {
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

  const fail = new SpeechSynthesisUtterance("엉덩이를 높이 올리세요");
  fail.lang='ko-KR';
  const success = new SpeechSynthesisUtterance("성공입니다");
  success.lang='ko-KR';

  if (hipAngle > 90 || hipAngle < 50) {
    if(beforeActoion==false){
      console.log("fail");
    }
    else{
      window.speechSynthesis.cancel();
      console.log("fail2");
      window.speechSynthesis.speak(fail);
    }
    beforeActoion=false;
  }
  else{
    if(beforeActoion==false){
      window.speechSynthesis.cancel();
      console.log("success");
      window.speechSynthesis.speak(success);
    }
    else{
      console.log("success2");
    }
    beforeActoion=true;
  }

  return { hipAngle, point1, point2, point3, cpoint1, cpoint2, cpoint3 };
};
