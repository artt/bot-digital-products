import React from "react"
import Graph from "./components/Graph"
import './App.css';
import { getData } from "./data"
import InfoBox from "./components/InfoBox";
import NavCorner from "./components/NavCorner";

function App() {

  const [selection, setSelection] = React.useState(null)
  const [infoBoxOpen, setInfoBoxOpen] = React.useState(false)

  const data = React.useMemo(() => {
    return getData()
  }, [])

  return (
    <div className="App">
      <Graph
        data={data}
        selection={selection}
        setSelection={setSelection}
        setInfoBoxOpen={setInfoBoxOpen}
      />
      {/* <InfoBox
        nodes={data.nodes}
      /> */}
      <InfoBox
        // fullWidth={fullWidth}
        // maxWidth={maxWidth}
        selection={selection}
        setSelection={setSelection}
        open={infoBoxOpen}
        onClose={() => setInfoBoxOpen(false)}
      />
      <NavCorner
        selection={selection}
        setInfoBoxOpen={setInfoBoxOpen}
      />
    </div>
  );
}

export default App;
