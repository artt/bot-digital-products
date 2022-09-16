import React from "react"
import ForceGraph2D from 'react-force-graph-2d';
import { forceX, forceY, forceZ } from 'd3-force-3d'
import { colors } from "../../data"

const DBL_CLICK_TIMEOUT = 500

export default function Graph({ data, selection, setSelection, setInfoBoxOpen }) {

  const fgRef = React.useRef();
  const [graphLoaded, setGraphLoaded] = React.useState(false);

  const [highlightNodes, setHighlightNodes] = React.useState(new Set());
  const [highlightLinks, setHighlightLinks] = React.useState(new Set());
  const [hoverNode, setHoverNode] = React.useState(null);
  const [prevClick, setPrevClick] = React.useState();

  const [clickedLinks, setClickedLinks] = React.useState(new Set());

  const updateHighlight = () => {
    setHighlightNodes(highlightNodes)
    setHighlightLinks(highlightLinks)
  }

  const handleNodeHover = node => {
    highlightNodes.clear()
    highlightLinks.clear()
    if (node) {
      highlightNodes.add(node)
      node.neighbors.forEach(neighbor => highlightNodes.add(neighbor));
      node.links.forEach(link => highlightLinks.add(link));
    }
    setHoverNode(node || null);
    updateHighlight();
  }

  const handleNodeClick = node => {
    const now = new Date();
    clickedLinks.clear()
    if (prevClick && prevClick.node === node && (now - prevClick.time) < DBL_CLICK_TIMEOUT) {
      setPrevClick(null);
      handleNodeDoubleClick(node);
    }
    setPrevClick({ node, time: now });
    if (node) {
      node.links.forEach(link => clickedLinks.add(link));
    }
    setClickedLinks(clickedLinks)
    setSelection(node)
  }

  const handleNodeDoubleClick = node => {
    setInfoBoxOpen(true)
  }

  // function getParticleNum(link) {
  //   const distance = Math.sqrt((link.source.x - link.target.x)**2 + (link.source.y - link.target.y)**2)
  //   return 0.1 * distance
  // }

  function getParticleSpeed(link) {
    const distance = Math.sqrt((link.source.x - link.target.x)**2 + (link.source.y - link.target.y)**2)
    return 0.5 / distance
  }

  function drawNode(node, ctx, scale) {
    if (node === selection) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = "black"
      ctx.fill()
    }
    else if (node === hoverNode) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = "grey"
      ctx.fill()
    }
    ctx.beginPath();
    ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = colors[node.type]
    ctx.fill()
    ctx.font = '6px Sans-Serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = node === selection ? "black" : colors[node.type]
    ctx.fillText(node.name, node.x, node.y + 10)
  }

  React.useEffect(() => {
    if (!graphLoaded) {
      return
    }
		fgRef.current.d3Force('centerX', forceX(-100).strength(node => {
      return (node.type === "infrastructure" ? 1 : 0)
    }))
		fgRef.current.d3Force('centerX', forceX(100).strength(node => {
      return (node.type === "product" ? 1 : 0)
    }))
		// fgRef.current.d3Force('centerY', forceY(0));
		// fgRef.current.d3Force('centerZ', forceZ(0));
		fgRef.current.d3Force('link').distance(30);
		fgRef.current.d3Force('link').strength(0.2);
	}, [graphLoaded]);

  const [graphData, setGraphData] = React.useState({nodes: [], links: []})

  React.useEffect(() => {
    setGraphData(data)
  }, [data])

  return(
    <div>
      {!graphLoaded &&
        <div className="center full">
          <div>
            <div>Loading stuff...</div>
          </div>
        </div>
			}
      {graphData &&
        <ForceGraph2D
          // data
          ref={fgRef}
          graphData={graphData}
          // node
          nodeVal={10}
          nodeCanvasObject={drawNode}
          onNodeClick={handleNodeClick}
          onNodeHover={handleNodeHover}
          nodeLabel=""
          // link
          linkLineDash={link => link.type === "optional" ? [2, 2] : false}
          linkDirectionalArrowLength={6}
          linkWidth={link => highlightLinks.has(link) || clickedLinks.has(link) ? 5 : 1}
          linkDirectionalParticles={4}
          linkDirectionalParticleWidth={link => clickedLinks.has(link) ? 4 : 0}
          linkDirectionalParticleSpeed={getParticleSpeed}
          // misc
          onEngineTick={() => setGraphLoaded(true)}
        />
      }
    </div>
  )

}