const video = document.getElementById("video")
const log = document.getElementById("log")

let labeledDescriptors = []

async function loadModels(){

await faceapi.nets.tinyFaceDetector.loadFromUri(
"https://cdn.jsdelivr.net/npm/face-api.js/models"
)

await faceapi.nets.faceLandmark68Net.loadFromUri(
"https://cdn.jsdelivr.net/npm/face-api.js/models"
)

await faceapi.nets.faceRecognitionNet.loadFromUri(
"https://cdn.jsdelivr.net/npm/face-api.js/models"
)

await faceapi.nets.ageGenderNet.loadFromUri(
"https://cdn.jsdelivr.net/npm/face-api.js/models"
)

await faceapi.nets.faceExpressionNet.loadFromUri(
"https://cdn.jsdelivr.net/npm/face-api.js/models"
)

log.innerHTML += "<br>Models Loaded"
}

loadModels()

function startCamera(){

navigator.mediaDevices.getUserMedia({video:{}})
.then(stream=>{
video.srcObject = stream
})

log.innerHTML += "<br>Camera Started"

}

async function registerFace(){

const detection = await faceapi
.detectSingleFace(video,new faceapi.TinyFaceDetectorOptions())
.withFaceLandmarks()
.withFaceDescriptor()

if(!detection){

alert("No face found")
return

}

const name = prompt("Enter name")

const descriptor = detection.descriptor

const labeled = new faceapi.LabeledFaceDescriptors(
name,[descriptor]
)

labeledDescriptors.push(labeled)

log.innerHTML += "<br>Saved: "+name

}

function clearFaces(){

labeledDescriptors = []

log.innerHTML += "<br>All data cleared"

}

video.addEventListener("play",()=>{

const canvas = faceapi.createCanvasFromMedia(video)

document.body.append(canvas)

const displaySize = {
width:video.width,
height:video.height
}

faceapi.matchDimensions(canvas,displaySize)

setInterval(async()=>{

const detections = await faceapi
.detectAllFaces(video,new faceapi.TinyFaceDetectorOptions())
.withFaceLandmarks()
.withFaceDescriptors()
.withAgeAndGender()
.withFaceExpressions()

const resized = faceapi.resizeResults(detections,displaySize)

canvas.getContext("2d").clearRect(0,0,canvas.width,canvas.height)

const matcher = new faceapi.FaceMatcher(labeledDescriptors,0.6)

resized.forEach(result=>{

const box = result.detection.box

let label = "Unknown"

if(labeledDescriptors.length>0){

const best = matcher.findBestMatch(result.descriptor)

label = best.toString()

}

const age = Math.round(result.age)

const gender = result.gender

const text = label+" | "+age+" | "+gender

const drawBox = new faceapi.draw.DrawBox(box,{label:text})

drawBox.draw(canvas)

})

},300)

})
