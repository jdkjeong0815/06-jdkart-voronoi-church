// Coding Train / Daniel Shiffman
// Weighted Voronoi Stippling
// https://thecodingtrain.com/challenges/181-image-stippling
// =============================================================================
// 프로그램 : 06-jdkart-voronoi-church 
// Created : 2025-Jan-06
// 작가 : jdk                    Inspiration : 
// Github : https://github.com/jdkjeong0815/06-jdkart-voronoi-church
// Web : https://jdkjeong0815.github.io/06-jdkart-voronoi-church/
// 작품 설명 : 교회의 창문을 표현한 스테인드글라스 프로젝트. 빛의 표현을 더욱 뚜렷하게 하기 위해 그라디언트 방향을 변경하고, 십자가 이미지를 추가하여 교회의 분위기를 더욱 강조하였다.
// 프로그램 특징 : Voronoi 다이어그램, HSL 컬러 색상표 사용. 빛의 느김을 더욱 잘 살리기 위헤 RGB, HSV(HSV), HSL 모드 중 HSL 모드를 사용하였다.
// 라이브러리 기능 : jdklib.js / 반응형 UI 안됨. 풀스크린 안됨
// 주기적인 리로드 : 매  ??초
// Last Update : 
// 2025-Jan-07 요약
//  - 1) 빛의 밝음과 어두움을 더욱 뚜렷하게 하는 로직 추가
//  - 2) 
// 2025-Jan-06 요약:
//  - 1) 십자가 이미지 추가, 360도 랜덤 각도 적용, 그라디언트 방향 변경
//  - 2)  
// =============================================================================


let saveFileName = "06-jdkart-voronoi-church";
let points = [];
let delaunay, voronoi;
let bgImg;
let offsetX, offsetY, offsetW, offsetH

let colorPalettes = {}; // JSON 색상 데이터를 저장할 배열
let selectedPalette; // 선택된 색상 팔레트
let randomIndex;
let churchCross;

function preload() {
  // 십자가 이미지
  churchCross = loadImage("assets/pexels-jonathanborba-2917373-bw-sm.png");
  // JSON 파일 로드 (예: colorPalettes.json)
  colorPalettes = loadJSON("assets/colors.json");
  // 배경 이미지
  bgImg = loadImage("assets/sanfrancisco-California-reflection-church-architecture-Raw-962960-wallhere.com-square-투명3.png");
}

function setup() {
  createCanvas(bgImg.width, bgImg.height);
  background(bgImg);
  //console.log("cp", colorPalettes.length);
  
  // offsetX = width / 3.5;
  // offsetY = height / 4.84;
  // offsetW = width / 1.359;
  // offsetH = height / 1.937;
 
  offsetX = 260;
  offsetY = 160;
  offsetW = 800;
  offsetH = 550;
  // console.log(offsetX, offsetY, offsetW, offsetH);
  
  generateVoronoi(); // 초기 Voronoi 다이어그램 생성

  // 60초마다 새로운 Voronoi 다이어그램 생성
  setInterval(generateVoronoi, 60000);
}

function generateVoronoi() {
  if (Object.keys(colorPalettes).length >= 0) {
    // 랜덤으로 색상 팔레트를 선택
    randomIndex = floor(random(Object.keys(colorPalettes).length));
    selectedPalette = colorPalettes[randomIndex];
  }
   // console.log("Selected Palette Index:", randomIndex, "Palette:", Object.keys(colorPalettes).length, selectedPalette.length);
  
  // 새로운 포인트 배열 생성
  points = [];
  for (let i = 0; i < 200; i++) {  // 75
    let x = random(width);
    let y = random(height);
    // let x = random(rectX1, rectX3);
    // let y = random(rectY1, rectY3);
    points[i] = createVector(x, y);
  }

  // Delaunay 및 Voronoi 갱신
  delaunay = calculateDelaunay(points);
  voronoi = delaunay.voronoi([offsetX, offsetY, offsetW, offsetH]);

  drawVoronoi();

  // 십자가 이미지
  let scaleFactor = min(width / churchCross.width, height / churchCross.height);
  let resizedWidth = churchCross.width * scaleFactor * 0.7;
  let resizedHeight = churchCross.height * scaleFactor * 0.7;

  let offX = (width - resizedWidth) / 2; // 중앙 정렬을 위한 X 오프셋
  let offY = (height - resizedHeight) / 2; // 중앙 정렬을 위한 Y 오프셋
  image(churchCross, offX + 20, offY - 100, resizedWidth, resizedHeight);
  // 십자가 이미지
  //image(churchCross, 0, 0, churchCross.width, churchCross.height);

  // 교회 백그라운드 이미지 
  background(bgImg); 

}

function drawVoronoi() {
  let polygons = voronoi.cellPolygons();
  let cells = Array.from(polygons);

  let strokeColor = random([0, 255]);
  let strokeW = random([1, 2]);
  stroke(strokeColor);
  strokeWeight(strokeW);
  for (let poly of cells) {
    if (poly.length > 0) {
      drawPerlinGradientPolygon(poly);
    }
  }
}

function hexToHSB(hex) {
  // HEX 색상을 HSB로 변환
  colorMode(RGB, 255);
  let c = color(hex);
  colorMode(HSB, 360, 100, 100);
  return {
    h: hue(c),
    s: saturation(c),
    b: brightness(c)
  };
}

function drawPerlinGradientPolygon(polygon) {
  // 노이즈 적용을 위한 기준 값
  let noiseScale = 0.01;

  // 다각형의 경계 좌표 계산
  let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity;
  for (let v of polygon) {
    xMin = min(xMin, v[0]);
    xMax = max(xMax, v[0]);
    yMin = min(yMin, v[1]);
    yMax = max(yMax, v[1]);
  }

  // 중심점 계산
  let centerX = (xMin + xMax) / 2;
  let centerY = (yMin + yMax) / 2;

  // 랜덤 각도(1~360도) 선택
  let angle = radians(random(1, 360));

  // 각도를 기준으로 그라디언트 시작점과 끝점 계산
  let radius = max(xMax - xMin, yMax - yMin); // 대각선 길이 기준 반지름
  let startX = centerX + cos(angle) * radius;
  let startY = centerY + sin(angle) * radius;
  let endX = centerX - cos(angle) * radius;
  let endY = centerY - sin(angle) * radius;

  // 그라디언트 설정
  let gradient = drawingContext.createLinearGradient(startX, startY, endX, endY);

  // 45도 각도로 그라디언트 설정
  //let gradient = drawingContext.createLinearGradient(xMin, yMin, xMax, yMax);
  
  // 선택된 팔레트에서 색상 선택
  let baseColorHex = selectedPalette[floor(random(selectedPalette.length))];
  console.log("selectedPalette: ", selectedPalette, "baseColorHex: ", baseColorHex);
  let baseColorHSB = hexToHSB(baseColorHex);

  // 랜덤 색상 생성 (HSB 모드 사용)
  colorMode(HSB, 360, 100, 100);
  let baseColor = color(baseColorHSB.h, baseColorHSB.s, baseColorHSB.b);
  let darkColor = color(baseColorHSB.h, baseColorHSB.s, baseColorHSB.b * 0.1);  // 0.3

  // RGB로 변환 후 추가 밝기 조정
  colorMode(RGB, 255); // RGB 모드
  let r = red(baseColor) + 20; // 밝기 증가
  let g = green(baseColor) + 20;
  let b = blue(baseColor) + 20;
  let baseColorFinal = color(constrain(r, 0, 255), constrain(g, 0, 255), constrain(b, 0, 255));
  
  // colorMode(HSB, 360, 100, 100); => RGB 모드가 색상이 더욱 풍부하게 나타남 

  gradient.addColorStop(0, baseColorFinal.toString());
  gradient.addColorStop(0.2, baseColorFinal.toString());
  gradient.addColorStop(0.8, darkColor.toString());
  gradient.addColorStop(1, darkColor.toString());

  // 다각형 내부에 펄린 노이즈로 변형된 색상 적용
  drawingContext.fillStyle = gradient;
  beginShape();
    for (let v of polygon) {
      let noiseX = v[0] + noise(v[0] * noiseScale, v[1] * noiseScale) * 20;
      let noiseY = v[1] + noise(v[0] * noiseScale, v[1] * noiseScale) * 20;
      vertex(noiseX, noiseY);
    }
  endShape(CLOSE);

  // RGB 모드 복원
  colorMode(RGB, 255);
  
  //background(bgImg); // 백그라운드 이미지 
}

function calculateDelaunay(points) {
  let pointsArray = [];
  for (let v of points) {
    pointsArray.push(v.x, v.y);
  }
  return new d3.Delaunay(pointsArray);
}

