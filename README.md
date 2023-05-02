# yoga_correction

### 프로젝트 필요성 및 배경 
---
카카오 vx에서 출시한 동작인식 기반 인공지능 홈트레이닝 앱과 비교했을 때,
* 잘못된 자세를 취해도 동작 점수가 perfect가 뜨는 등 인식 정확도가 떨어짐
<img width="234" alt="스크린샷 2022-12-24 오후 3 32 37" src="https://user-images.githubusercontent.com/88534959/209424538-e1c4a4db-7526-4917-9de5-aaf77be997e3.png">

* 잘못된 부위를 빨간색 선으로 표시해줄 뿐 구체적으로 어떻게 고쳐야 하는지에 대한 피드백이 없었음
<img width="231" alt="스크린샷 2022-12-24 오후 3 32 53" src="https://user-images.githubusercontent.com/88534959/209424546-faa9a159-c8d7-40ce-807b-0ae082e46169.png">

위와 같은 문제점이 존재했다.
따라서 동작 정확도를 높이고 시각적 피드백과 음성 피드백을 통해 구체적인 피드백을 제공하는 것을 목표로 하였다.

### 사용한 기술
---
#### Pose Estimation
영상 기반의 코칭 트레이닝 시스템을 개발하기 위해 실시간으로 사용자의 영상을 받아 사람의 관절을 추정해야 한다.
여기서 사람의 관절을 측정하기 위해 pose estimation 기술을 사용했다.
pose estimation은 사람의 관절을 keypoint로 지정해 사람의 자세를 예측하는 기술이다.

#### MoveNet
이 프로젝트에서는 MoveNet 을 이용하여 영상 내의 사용자의 신체 17개의 부위를 keypoint로 감지하고 skeleton을 추출한다.

다양한 pose estimation 중에서 MoveNet을 선택한 이유는 다음과 같다.
* MoveNet은 Bottom-up 방식으로 Read-time에 적용할 수 있다.
* MoveNet은 TensorFlow.js에서 제공하는 모델로 서버 호출 없이 브라우저에서 모델을 실행할 수 있다.
* MoveNet 높은 정확도를 위한 Thunder모델과, 빠른 속도 처리를 위한 Lightining모델로 나뉜다.
  해당 프로젝트에서는 정확도를 놆이는 것이 목표이므로 Thunder 모델을 사용했다.

#### keras를 이용한 다중 분류 모델
MoveNet의 결과값인 17개의 keypoint를 feature로 넣어 요가 동작 이름을 label로 받는다.

### flow chart
---
#### 동작 분류
* input : MoveNet을 통해 추출한 keypoint 좌표
* output : 포즈 클래스(자세 종류)
<img width="438" alt="스크린샷 2022-12-24 오후 3 20 40" src="https://user-images.githubusercontent.com/88534959/209424194-eaf78f0b-7cef-4a2f-bb49-2275a292f149.png">
1. 요가 동작 분류 모델에 캠을 통해 입력 받은 사용자의 좌표를 입력으로 넣는다.


2.예측된 포즈 클래스와 사용자가 선택한 요가 자세가 일치하면 관절을 연결하는 선을 초록색으로 표시하여 시각적 피드백을 제공한다.

#### 자세 교정
<img width="377" alt="스크린샷 2022-12-24 오후 3 22 15" src="https://user-images.githubusercontent.com/88534959/209424225-651d7f2c-07ac-473f-9c4d-862ecd41b949.png">
1. 정확한 자세의 keypoint를 추출하여 교정하고 싶은 부위의 각도를 계산(해당 프로젝트에서는 유튜브에서 요가 트레이너의 skeleton을 추출함)


2.사용자의 각도도 같은 방법으로 계산하여 올바른 각도와 사용자의 각도가 차이가 큰 경우 시각적 피드백과 음성 피드백을 동시에 제공

#### 전체 flow chart
<img width="392" alt="스크린샷 2022-12-24 오후 3 41 37" src="https://user-images.githubusercontent.com/88534959/209424768-7e64b543-d1fb-4ade-902d-573d3047f04d.png">
동작 분류와 자세 교정 알고리즘이 포함된 전체 flow chart

### 실행 결과
---
<img width="470" alt="스크린샷 2022-12-24 오후 6 08 14" src="https://user-images.githubusercontent.com/88534959/209428918-b116b08c-9be8-4abe-a86f-68b7d55c25d3.png">

[![Video Label](http://img.youtube.com/vi/3Uz2qNt3Iqw/0.jpg)](https://youtu.be/3Uz2qNt3Iqw)

위 사진을 누르면 비디오가 실행됩니다.


### 추후 계획
---
* 각 요가 당 한 부위만 skeleton 사이의 각도를 계산한 후 사용자에게 피드백을 제공하고 있으나, 사용자에게 더 정확한 피드백을 제공하기 위해서 각도르 계산하는 부위를 더 늘려나갈 예정
* version 1은 혼자서만 요가 코칭을 받을 수 있지만 socket통신을 통해서 다른 사람과 함께 요가 코칭을 받을 수 있는 기능 제공
* 사용자의 꾸준한 운동을 촉진하기 위해서 친구기능, 요가 기록 등 다양한 커뮤니케이션 추가

### 실행
---
1. 터미널에서 frontend 폴더로 이동
2. npm install -> node modules 다운
3. npm start
