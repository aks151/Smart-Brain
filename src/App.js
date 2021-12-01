import React, { Component } from 'react';
import './App.css';
import Clarifai from 'clarifai';
import Navigation from './Components/Navigation/Navigation';
import Signin from './Components/Signin/Signin';
import Register from './Components/Register/Register';
import FaceRecognistion from './Components/FaceRecognistion/FaceRecognistion';
import Particles from 'react-particles-js';
import Logo from './Components/Logo/Logo';
import ImageLinkForm from './Components/ImageLinkForm/ImageLinkForm';
import Rank from './Components/Rank/Rank';

const app = new Clarifai.App({
  apiKey: '402193a6b8b14e0b9d1e179e2575ed89'
 });

const particlesOptions = {
  particles: {
      number: {
        value:30,
        density: {
          enable: true,
          value_area: 800
        }
      }
  }
}
const initialState = {
  input: '',
  imageUrl: '',
  box: {},
  route : 'signin',
  isSignedIn : false,
  user: {
    id: '',
    name: '',
    email: '',
    password: '',
    entries: 0,
    joined: ''
  }
}

class App extends Component {
  constructor()
  {
    super();
    this.state = initialState
  }

  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
  }

  // componentDidMount() {
  //   fetch('http://localhost:3000/')
  //   .then(response => response.json())
  //   .then(console.log)
  // }
  
  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)

    }
  }

  displayFaceBox = (box) => {
    this.setState({box : box})
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value})
  }

  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input});
    app.models
      .predict(
        Clarifai.FACE_DETECT_MODEL,
        this.state.input)
      .then(response =>{
        if(response) {
          fetch('https://ancient-plateau-12124.herokuapp.com/image', {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
            id: this.state.user.id
            })
          })
          .then(response => response.json())
          .then(count => {
            this.setState(Object.assign(this.state.user, {entries: count}))
          })
          .catch(console.log)
        }
         this.displayFaceBox(this.calculateFaceLocation(response))
        })
      .catch(err => console.log(err));
  }

  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState(initialState)
    } else if(route === 'home') {
      this.setState({isSignedIn: true})
    }
    this.setState({route : route});
  }
  render(){
    return (
      <div className="App">
        <Particles className = 'particles'
        params={particlesOptions} 
        />
        <Navigation isSignedIn={this.state.isSignedIn}onRouteChange={this.onRouteChange} />
        { this.state.route === 'home'
        ? <div> 
        <Logo />
      <Rank 
      name  = {this.state.user.name}
      entries = {this.state.user.entries}
      />
      <ImageLinkForm onInputChange = {this.onInputChange} onButtonSubmit = { this.onButtonSubmit}/>
      <FaceRecognistion className = 'center' box = {this.state.box} imageUrl={this.state.imageUrl}/>
      </div>
      : (
        this.state.route === 'signin'
        ?<Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
        :<Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
      )
        }
      </div>
    );
  }
}

export default App;
