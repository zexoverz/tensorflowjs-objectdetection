import './App.css';
import React, {useEffect} from 'react';
// import * as tf from '@tensorflow/tfjs';
const cocoSsd = require('@tensorflow-models/coco-ssd');

function App() {

  const videoRef = React.createRef();
  const canvasRef = React.createRef();

  let styles = {
    position: 'fixed',
    left: 150,
  };

  const detectFromVideoFrame = (model, video) => {
    model.detect(video).then(predictions => {
      showDetections(predictions);

      requestAnimationFrame(() => {
        detectFromVideoFrame(model, video);
      });
    }, (error) => {
      console.log("Couldn't start the webcam")
      console.error(error)
    })
  }

  const showDetections = predictions => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    const font = "24px helvetica";
    ctx.font = font;
    ctx.textBaseline = "top";

    predictions.forEach(prediction => {
      const x = prediction.bbox[0];
      const y = prediction.bbox[1];
      const width = prediction.bbox[2];
      const height = prediction.bbox[3];
      // Draw the bounding box.
      ctx.strokeStyle = "#2fff00";
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, width, height);
      // Draw the label background.
      ctx.fillStyle = "#2fff00";
      const textWidth = ctx.measureText(prediction.class).width;
      const textHeight = parseInt(font, 10);
      // draw top left rectangle
      ctx.fillRect(x, y, textWidth + 10, textHeight + 10);
      // draw bottom left rectangle
      ctx.fillRect(x, y + height - textHeight, textWidth + 15, textHeight + 10);

      // Draw the text last to ensure it's on top.
      ctx.fillStyle = "#000000";
      ctx.fillText(prediction.class, x, y);
      ctx.fillText(prediction.score.toFixed(2), x, y + height - textHeight);
    });
  };

  useEffect(() => {
    if (navigator.mediaDevices.getUserMedia) {
      // define a Promise that'll be used to load the webcam and read its frames
      const webcamPromise = navigator.mediaDevices
        .getUserMedia({
          video: true,
          audio: false,
        })
        .then(stream => {
          // pass the current frame to the window.stream
          window.stream = stream;
          // pass the stream to the videoRef
          videoRef.current.srcObject = stream;

          return new Promise(resolve => {
            videoRef.current.onloadedmetadata = () => {
              resolve();
            };
          });
        }, (error) => {
          console.log("Couldn't start the webcam")
          console.error(error)
        });

      // define a Promise that'll be used to load the model
      const loadlModelPromise = cocoSsd.load();
      
      // resolve all the Promises
      Promise.all([loadlModelPromise, webcamPromise])
        .then(values => {
          detectFromVideoFrame(values[0], videoRef.current);
        })
        .catch(error => {
          console.error(error);
        });
    }
  }, [videoRef])
  
  return (
    <div className="App" style={{ display: 'flex', justifyContent: "center", alignItems: "center"}}>
      {/* <h1 className="App-header">Demo of TensorFlow.js Coco SSD's model object detection</h1> */}
      <div style={{left: 50}}>
        <video
            style={styles}
            autoPlay
            muted
            ref={videoRef}
            width="720"
            height="600"
            className = "video"
          />
        <canvas style={styles} ref={canvasRef} width="720" height="600" />
      </div>
    </div>
  );
}

export default App;
