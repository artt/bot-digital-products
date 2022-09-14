import React from "react"
import Graph from "./components/Graph"
import './App.css';

function App() {

  const [clickedNode, setClickedNode] = React.useState(null)
  
  return (
    <div className="App">
      <Graph
        clickedNode={clickedNode}
        setClickedNode={setClickedNode}
      />
    </div>
  );
}

export default App;
