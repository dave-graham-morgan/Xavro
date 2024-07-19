import LoginForm from "./Components/LoginForm.jsx";
import AddRoom from "./Components/AddRoom.jsx"

import './App.css'

function onSubmit(){
    console.log("button pushed yo")
}

function App() {
  return (
    <>
        <div>
            <AddRoom/>
        </div>
    </>
  )
}

export default App
