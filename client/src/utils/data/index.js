export const poseInstructions = {
  Tree: [
    "두 발을 모아 엄지발가락을 붙이고 똑바로 섭니다.",
    "오른발을 구부려 오른 발바닥을 왼쪽 허벅지 안에 갖다 붙입니다.",
    "두 손을 가슴 앞에 모읍니다.",
    "고르게 숨을 쉬면서 시선을 한점에 집중하고 균형을 잡으며 잠시 머무릅니다.",
  ],
  Cobra: [
    "Lie prone on the floor. Stretch your legs back, tops of the feet on the floor. Spread your hands on the floor under your shoulders. Hug the elbows back into your body.",
    "On an inhalation, begin to straighten the arms to lift the chest off the floor, going only to the height at which you can maintain a connection through your pubis to your legs. Press the tailbone toward the pubis and lift the pubis toward the navel. Narrow the hip points. Firm but don’t harden the buttocks.",
    "Firm the shoulder blades against the back, puffing the side ribs forward. Lift through the top of the sternum but avoid pushing the front ribs forward, which only hardens the lower back. Distribute the backbend evenly throughout the entire spine.",
    "Hold the pose anywhere from 15 to 30 seconds, breathing easily. Release back to the floor with an exhalation.",
    "Source: Yoga Journal - https://www.yogajournal.com/poses/types/cobra-pose-2/",
  ],
  Dog: [
    "무릎을 꿇고, 엎드린 자세로 시작하며, 손가락은 벌려줍니다.",
    "발가락을 바닥에 대고, 무릎을 바닥에서 들어 올립니다.",
    "햄스트링과 종아리가 개방되기 시작하면, 다리를 쭉 펴면서 발꿈치를 바닥으로 낮추기 시작합니다.",
    "머리는 어깨 사이에 편안히 두도록 하고, 30초 이상 심호흡하세요.",
  ],
  Chair: [
    "자리에 서서 엉덩이 너비만큼 발을 벌리고 팔은 옆구리에 붙입니다.",
    "숨을 들이마시면서 팔을 천장 쪽으로 올리고 팔 근육을 활성화하며 손바닥은 앞을 보게끔 자세를 취한다",
    "팔이 귀 높이만큼 오도록 내린다.",
    "무릎이 발목 앞으로 넘어가지 않도록 주의하면서 구부린다.",
  ],
  Warrior: [
    "Begin in lunge with your front knee bent, your back leg straight and your back heel lifted. Your hips and chest should be squared to front of the mat. Raise your arms above your head.",
    "Move your hands to your heart, with palms pressed against each other in a prayer position. Lean forward until your back leg extends straight back, even with your hips. Keep your foot flexed and your gaze downward.",
    "Make sure your standing leg is strong and straight, but not locked at knee. Reach your arms forward so your body forms a “T” shape.",
    "Source classpass - https://classpass.com/movements/warrior-3-pose",
  ],
  Traingle: [
    "Begin standing, then lightly jump your feet apart to a wide position about three to four feet apart. Turn your left foot out and turn to face that direction. Take a slight bend in your left leg and raise your arms out on your sides, forming a “T” shape.",
    "Straighten through your left leg, then hinge and reach your torso over your left leg as your hips jut back. Rotate your left palm so it faces the ceiling, and gaze out over your left arm.",
    "Maintain a long, straight spine as you reach your left hand to the mat, placing it in front of your left foot. If you feel off balance, bring in your back leg closer to shorten your stance. Gaze towards your right arm, which should be extended overhead. Hold and repeat on the other side.",
    "Source classpass - https://classpass.com/movements/triangle-pose",
  ],
  Shoulderstand: [
    "Start with a stack of two folded blankets. Lay down on your mat aligning shoulders onto the blankets. With legs bent and feet on the floor (as if setting up for bridge pose) begin to walk your shoulders underneath your upper back feeling the chest gently rising.",
    "Lift your hips off of the mat coming into bridge pose and extend your arms onto the ground, palms facing down as if your hands could touch your heels. Press firmly into the palms using them as leverage to lift onto the balls of the feet and extend one leg up. Bend at the elbows, place your hands on your low back creating a shelf, and then extend the next leg up.",
    "Once you raise the legs, don't turn your head to the side to look around the room, since you can injure your neck. Keep your gaze upward and your neck straight.",
    "Lift up through the balls of your feet. Walk your hands further up the back for more stability. Feel the chest reaching towards the chin to support opening the upper back.",
    "Move your hips toward the front of the room and your feet toward the back of the room to straighten the body. The correct alignment is with the hips over the shoulders and feet over the hips. Ask your teacher or a friend to help you determine if your legs are perpendicular to the floor.",
    "Stay in the pose for up to 10 breaths",
    "Source: verywellfit - https://www.verywellfit.com/shoulderstand-salamba-sarvangasana-3567115",
  ],
};

export const tutorials = [
  "1. When App ask for permission of camera, allow it to access to capture pose.",
  "2. Select what pose you want to do in the dropdown.",
  "3. Read Instrctions of that pose so you will know how to do that pose.",
  "4. Click on Start pose and see the image of the that pose in the right side and replecate that image in front of camera.",
  "5. If you will do correctly the skeleton over the video will become green in color and sound will start playing",
];

export const fixCamera = [
  "Solution 1. Make sure you have allowed the permission of camera, if you have denined the permission, go to setting of your browser to allow the access of camera to the application.",
  "Solution 2. Make sure no any other application is not accessing camera at that time, if yes, close that application",
  "Solution 3. Try to close all the other opened broswers",
];

export const POINTS = {
  NOSE: 0,
  LEFT_EYE: 1,
  RIGHT_EYE: 2,
  LEFT_EAR: 3,
  RIGHT_EAR: 4,
  LEFT_SHOULDER: 5,
  RIGHT_SHOULDER: 6,
  LEFT_ELBOW: 7,
  RIGHT_ELBOW: 8,
  LEFT_WRIST: 9,
  RIGHT_WRIST: 10,
  LEFT_HIP: 11,
  RIGHT_HIP: 12,
  LEFT_KNEE: 13,
  RIGHT_KNEE: 14,
  LEFT_ANKLE: 15,
  RIGHT_ANKLE: 16,
};

export const keypointConnections = {
  nose: ["left_ear", "right_ear"],
  left_ear: ["left_shoulder"],
  right_ear: ["right_shoulder"],
  left_shoulder: ["right_shoulder", "left_elbow", "left_hip"],
  right_shoulder: ["right_elbow", "right_hip"],
  left_elbow: ["left_wrist"],
  right_elbow: ["right_wrist"],
  left_hip: ["left_knee", "right_hip"],
  right_hip: ["right_knee"],
  left_knee: ["left_ankle"],
  right_knee: ["right_ankle"],
};
