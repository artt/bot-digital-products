import React from "react"
import ForceGraph2D from 'react-force-graph-2d';
import { forceX, forceY, forceZ } from 'd3-force-3d'
import { colors } from "../../data"

const DBL_CLICK_TIMEOUT = 500

export default function Graph({ data, selection, setSelection, setInfoBoxOpen }) {

  const fgRef = React.useRef();
  const [graphLoaded, setGraphLoaded] = React.useState(false);

  // when selection is made, the node is called `selection`
  const [clickedNodeNeighbors, setClickedNodeNeighbors] = React.useState(new Set());
  const [clickedNodeLinks, setClickedNodeLinks] = React.useState(new Set());
  const [prevClick, setPrevClick] = React.useState();
  // when a node is hovered
  const [hoveredNode, setHoveredNode] = React.useState(null);
  const [hoveredNodeNeighbors, setHoveredNodeNeighbors] = React.useState(new Set())
  const [hoveredNodeLinks, setHoveredNodeLinks] = React.useState(new Set())
  // when a link is hovered
  const [hoveredLink, setHoveredLink] = React.useState(null)
  const [hoveredLinkNeighbors, setHoveredLinkNeighbors] = React.useState(new Set())
  // link clicking is not supported

  const handleNodeClick = node => {
    const now = new Date();
    clickedNodeLinks.clear()
    clickedNodeNeighbors.clear()
    if (prevClick && prevClick.node === node && (now - prevClick.time) < DBL_CLICK_TIMEOUT) {
      setPrevClick(null);
      handleNodeDoubleClick(node);
    }
    setPrevClick({ node, time: now });
    if (node) {
      node.neighbors.forEach(neighbor => clickedNodeNeighbors.add(neighbor))
      node.links.forEach(link => clickedNodeLinks.add(link));
    }
    setClickedNodeNeighbors(clickedNodeNeighbors)
    setClickedNodeLinks(clickedNodeLinks)
    setSelection(node)
  }

  const handleNodeHover = node => {
    hoveredNodeNeighbors.clear()
    hoveredNodeLinks.clear()
    if (node) {
      node.neighbors.forEach(neighbor => hoveredNodeNeighbors.add(neighbor));
      node.links.forEach(link => hoveredNodeLinks.add(link));
    }
    setHoveredNodeNeighbors(hoveredNodeNeighbors)
    setHoveredNodeLinks(hoveredNodeLinks)
    setHoveredNode(node || null);
  }

  const handleLinkHover = link => {
    hoveredLinkNeighbors.clear()
    if (link) {
      hoveredLinkNeighbors.add(link.source)
      hoveredLinkNeighbors.add(link.target)
    }
    setHoveredLinkNeighbors(hoveredLinkNeighbors)
    setHoveredLink(link || null)
  }

  const handleNodeDoubleClick = node => {
    setInfoBoxOpen(true)
  }

  function getParticleSpeed(link) {
    const distance = Math.sqrt((link.source.x - link.target.x)**2 + (link.source.y - link.target.y)**2)
    return 0.5 / distance
  }

  function drawRing(node, ctx, color) {
    ctx.beginPath();
    ctx.arc(node.x, node.y, 6, 0, 2 * Math.PI);
    ctx.fillStyle = color
    ctx.fill()
  }

  function getOpacity(node) {
    if (!selection)
      return 1
    if ([selection, hoveredNode, ...clickedNodeNeighbors, ...hoveredNodeNeighbors, ...hoveredLinkNeighbors].includes(node))
      return 1
    return 0.3
  }

  function getLinkWidth(link) {
    if ([hoveredLink, ...clickedNodeLinks, ...hoveredNodeLinks].includes(link))
      return 4
    return 1
  }

  function drawNode(node, ctx, scale) {
    if (node === selection) {
      drawRing(node, ctx, "black")
    }
    else if ([hoveredNode, ...hoveredNodeNeighbors, ...hoveredLinkNeighbors].includes(node)) {
      drawRing(node, ctx, "grey")
    }
    ctx.beginPath();
    ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = `rgba(${colors[node.type]}, ${getOpacity(node)}`
    ctx.fill()
    ctx.font = '6px Sans-Serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = node === selection ? "black" : `rgba(${colors[node.type]}, 1)`
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
          onLinkHover={handleLinkHover}
          linkColor={link => link === hoveredLink ? "grey" : "lightgrey"}
          linkLineDash={link => link.type === "optional" ? [2, 2] : false}
          linkDirectionalArrowLength={6}
          linkWidth={getLinkWidth}
          linkDirectionalParticles={4}
          linkDirectionalParticleWidth={link => clickedNodeLinks.has(link) ? 4 : 0}
          linkDirectionalParticleSpeed={getParticleSpeed}
          linkDirectionalParticleColor="grey"
          // misc
          onEngineTick={() => setGraphLoaded(true)}
        />
      }
    </div>
  )

}