import React, { Component } from "react";
import Slider from "react-slick";
import * as tf from "@tensorflow/tfjs";
import * as cocossd from "@tensorflow-models/coco-ssd";
import Webcam from "react-webcam";
import {FaRegEye} from "react-icons/fa";
import {drawRect} from "./utilites"
import Tesseract from "tesseract.js";
import "./App.css";


import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

var Classes=[]
var Classes1=[]
var Objects=[]
var pastObjects=[]
var SpeakNumber=0;
class App extends Component {

  state = {
    imageUrl: null,
    classes1:[],
    classes:[],
    text:""
  };

  constructor(props) {
    super(props);
    this.webcamRef = React.createRef();
    this.webcamRef1=React.createRef();
    this.canvasRef = React.createRef();
  }

  componentDidMount() {
   this.runCoco();
  }

  runCoco = async () => {
    const net = await cocossd.load();
    this.detectInterval = setInterval(() => {
      Classes=[];
      this.detect(net);
    }, 1);
  };

  speak = (object) => {
    if(SpeakNumber==150){
      SpeakNumber=0;
      pastObjects=[];
    }
    let LatestObjects=[]
    const synth = window.speechSynthesis;
    const newObject=[...new Set(object)];
    Objects=[...newObject];
    let checkArray= pastObjects.join(" ")==Objects.join(" ")
    if(checkArray==false){
      LatestObjects=Objects.filter((i)=>pastObjects.includes(i)==false)
      const utterance = new SpeechSynthesisUtterance(`${LatestObjects.join(" ")} detected`);
      synth.speak(utterance);
    }
    pastObjects=[...Objects]
  };

  detect = async (net) => {
    if (
      typeof this.webcamRef1.current !== "undefined" &&
      this.webcamRef1.current !== null &&
      this.webcamRef1.current.video.readyState === 4
    ) {
        
        const video = this.webcamRef1.current.video;
        const obj = await net.detect(video);
        let classes1 = Classes1;
        classes1=[...new Set(classes1)]
        obj.forEach((i) => classes1.push(i.class));
        this.setState({classes1})
    }
    if (
      typeof this.webcamRef.current !== "undefined" &&
      this.webcamRef.current !== null &&
      this.webcamRef.current.video.readyState === 4
    ) {
      
    const video = this.webcamRef.current.video;
    const obj = await net.detect(video);
      const videoWidth = this.webcamRef.current.video.videoWidth;
      const videoHeight = this.webcamRef.current.video.videoHeight;

      this.webcamRef.current.video.width = videoWidth;
      this.webcamRef.current.video.height = videoHeight;

      this.canvasRef.current.width = videoWidth;
      this.canvasRef.current.height = videoHeight;
      const ctx = this.canvasRef.current.getContext("2d");
      drawRect(obj, ctx);
      const classes = Classes;
      obj.forEach((i) => classes.push(i.class));
      this.setState({classes})
      Objects=[...Objects,...classes]
      SpeakNumber++;
      this.speak(Objects)
      console.log(SpeakNumber)
      
    }
    
  };

  detectText = async () => {
    try {
      const { data: { text } } = await Tesseract.recognize(
        this.state.imageUrl,
        "eng",
        {
          tessjs_create_pdf: "1",
        }
      );
      this.setState({text});
    } catch (error) {
      console.error(error);
    }
  };

  removeImg=()=>{
    this.setState({imageUrl:"",text:""})

  }
  
  capture = () => {
    const imageUrl = window.innerWidth<=500?this.webcamRef1.current.getScreenshot():this.webcamRef.current.getScreenshot();
    this.setState({ imageUrl ,text:"loading Text"}, this.detectText);
  };

  render() {
    const {text,classes,classes1,imageUrl}=this.state
    return (
      <div className="MainContainer">
        <div className="HeaderContainer">
          <div className="LogoContainer">
            <FaRegEye className="eyeLogo"/>
            <h1 className="title">Audio Assistance For Blind</h1>
          </div>
          <div className="BatchContainer">
            <h3>Batch D6</h3>
          </div>
        </div>
        <div className="InnerBoxContainer">
          <div className="MainWork">
            <div className="WebcamReact1">
                <Webcam
                  ref={this.webcamRef1}
                  muted={true}
                  style={{height:200,width:250}}
                  className="webCam2"
                  id="webcam"
                />
            </div>
            <div className="CamContainer">
                <div className="WebcamReact">
                <Webcam
                  ref={this.webcamRef}
                  muted={true}
                  className="webCam"
                  id="webcam"
                />
                <canvas
                  ref={this.canvasRef}
                  className="webCam1"
                  id="canvas"
                />
                </div>
                
            </div>
            
            <div className="textBoxContainer">
              {imageUrl && (
                <>
                <button className="into" onClick={this.removeImg}>X</button>
                <img src={this.state.imageUrl} alt="Screenshot" className="screenShot"/>
                </>
              )}
              <button onClick={this.capture} className="captureButton">Capture</button>
              {text!==""?(
                <p>{text}</p>
              ):""}
              {classes.length?(
                <div className="classesDetected">
                  {classes.map(i=><p>{i}</p>)}
                </div>
              ):""}
              {classes1.length && window.innerWidth<=500 ?(
              <div className="classesDetected">
                  {classes1.map(i=><p>{i}</p>)}
                </div>):""}
            </div> 
            </div>
            <hr className="line"/>
            <div className="AboutBox">
              <div className="About">
                <h3 className="AboutHead">About</h3>
                <p className="AboutTitle">We are so Lucky that we can able to read and enjoy the beauty of world through our vision .Visual impairment is one of the biggest limitations for humanity, especially in this day when information is communicated a lot by text messages rather than voice. The proposed method enables the visually impaired people to see with the help of ears. The image will be uploaded to the cocossd library by first and received output will be a stack of object in form of text, the text will be formatted using text to speech using node js, the audio file will be uploaded to mongodb database with a certain date and time.  The image uploaded goes through a certain number of image pre- processing steps to locate only that part of the image that contains the text and remove the background. Two main tools are used to convert the new image to speech and identification of objects. They are text to speech api engines  and Optical character recognition software. The user can access the past audio by using open command. Our design is used to aid people with mild or moderate visual impairment by providing the capability to listen to the text through open voice command. It can also help people with dyslexia or other disabilities that involve difficulty in reading and interpreting words and letters. We wish these people to be independent and self sufficient like any other individual.</p>
              </div>
            </div>
        </div>
        <div className="Footer">
          <h3>Our Team</h3>
          <div className="SliderContainer">
            <Slider className="slider">
            <div>
                <div className="sliderItem">
                  <div className="imageContainer">
                    <img src="https://res.cloudinary.com/dub9ymu0j/image/upload/v1675619715/156547b5-0c4c-4b4a-960a-39099e77b0b1_ykqxjc.jpg" className="profileMe" alt="profile"/>
                  </div>
                  <div className="AboutContainer">
                    <h3>N S R K Sree Charan</h3>
                    <p>19L31A05O6</p>
                    <p>Backend developer</p>
                  </div>
                </div>
              </div>
              <div>
              <div className="sliderItem">
                <div className="imageContainer">
                  <img src="https://res.cloudinary.com/dub9ymu0j/image/upload/v1675618674/9292ccb0-9bc7-4357-8a80-4a7a06a3c6cf_wpvtp4.jpg" className="profile" alt="profile"/>
                </div>
                <div className="AboutContainer">
                  <h3>B Darsitha</h3>
                  <p>19L31A05P3</p>
                  <p>Team Lead (Backend developer)</p>
                </div>
                </div>
              </div>
              
              <div>
              <div className="sliderItem">
                <div className="imageContainer">
                  <img src="https://res.cloudinary.com/dub9ymu0j/image/upload/v1675617795/d9ee4a65-a2c3-43da-b154-c99b007bf993_jgipcw.jpg" className="profile" alt="profile"/>
                </div>
                <div className="AboutContainer">
                  <h3>G Chinna Rao</h3>
                  <p>19L31A05S4</p>
                  <p>Frontend developer</p>
                </div>
                </div>
              </div>
              <div>
              <div className="sliderItem">
                <div className="imageContainer">
                  <img src="https://res.cloudinary.com/dub9ymu0j/image/upload/v1675618888/50865d38-397d-4817-9078-b2491a55e532_zoxgmz.jpg" className="profile" alt="profile"/>
                </div>
                <div className="AboutContainer">
                  <h3>E Kishor</h3>
                  <p>19L31A05U7</p>
                  <p>Frontend developer</p>
                </div>
                </div>
              </div>
            </Slider>
          </div>
        </div>
      </div>
    );
  }
}

export default App;