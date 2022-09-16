import React from "react"
import ForceGraph2D from 'react-force-graph-2d';
import { forceX, forceY, forceZ } from 'd3-force-3d'
import { colors } from "../../data"

const DBL_CLICK_TIMEOUT = 500
const blurOpacity = 0.15

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

  const handleCanvasClick = () => {
    if (!hoveredNode && !hoveredLink) {
      clickedNodeLinks.clear()
      clickedNodeNeighbors.clear()
      setClickedNodeNeighbors(clickedNodeNeighbors)
      setClickedNodeLinks(clickedNodeLinks)
      setSelection(null)
    }
  }

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

  function getNodeOpacity(node) {
    if (!selection)
      return 1
    if ([selection, hoveredNode, ...clickedNodeNeighbors, ...hoveredNodeNeighbors, ...hoveredLinkNeighbors].includes(node))
      return 1
    return blurOpacity
  }

  function getLinkWidth(link) {
    if ([hoveredLink, ...clickedNodeLinks, ...hoveredNodeLinks].includes(link))
      return 4
    return 1
  }

  function getLinkColor(link) {
    if (link.type === "subtype")
      return "rgba(255, 255, 255, 0)"
    if (link === hoveredLink)
      return "grey"
    if (!selection)
      return "lightgrey"
    if ([...clickedNodeLinks].includes(link))
      return "lightgrey"
    return `rgba(100, 100, 100, ${blurOpacity})`
  }

  /// expand with color, background etc.
function drawText(ctx, txt, x, y, { fontColor="black", fontSize=6, bold=false, bkg="", padding=1 }) {
  ctx.save();
  ctx.font = `${bold ? "bold" : ""} ${fontSize}px sans-serif`;
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle';
  if (bkg) {
    ctx.fillStyle = bkg
    const width = ctx.measureText(txt).width;
    ctx.fillRect(x - width/2 - padding, y - fontSize/2 - padding, width + 2*padding, fontSize + 2*padding);  
  }
  ctx.fillStyle = fontColor;
  ctx.fillText(txt, x, y);
  ctx.restore();
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
    ctx.fillStyle = `rgba(${colors[node.type]}, ${getNodeOpacity(node)}`
    ctx.fill()
    drawText(ctx, node.name, node.x, node.y + 10, { fontColor: node === selection ? "black" : `rgba(${colors[node.type]}, ${getNodeOpacity(node)})`, bold: node === selection, bkg: `rgba(255, 255, 255, 0.8)` })
  }

  // draw extra info on links (in case of link selection)
  function drawLinkExtra(link, ctx, scale) {
    if ([...clickedNodeLinks].includes(link)) {
      drawText(ctx, link.name, (link.source.x + link.target.x) / 2, (link.source.y + link.target.y) / 2, { bkg: `rgba(255, 255, 255, 0.8)` })
    }
  }

  React.useEffect(() => {
    if (!graphLoaded) {
      return
    }
    const f = 0.7
		fgRef.current.d3Force('centerX', forceX(-100).strength(node => {
      return (node.type === "infrastructure" ? f : 0)
    }))
		fgRef.current.d3Force('centerX', forceX(100).strength(node => {
      return (node.type === "product" ? f : 0)
    }))
		// fgRef.current.d3Force('centerY', forceY(0));
		// fgRef.current.d3Force('centerZ', forceZ(0));
		fgRef.current.d3Force('link').distance(link => link.type === "subtype" ? 5 : 40);
		fgRef.current.d3Force('link').strength(link => link.type === "subtype" ? 0.4 : 0.2);
		fgRef.current.d3Force('charge').strength(-150);
	}, [graphLoaded]);

  const [graphData, setGraphData] = React.useState({nodes: [], links: []})

  React.useEffect(() => {
    setGraphData(data)
  }, [data])

  return(
    <div onClick={handleCanvasClick}>
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
          linkCanvasObject={drawLinkExtra}
          linkCanvasObjectMode={() => 'after'}
          linkColor={getLinkColor}
          linkWidth={getLinkWidth}
          linkLineDash={link => link.type === "optional" ? [2, 2] : false}
          linkDirectionalArrowLength={link => clickedNodeLinks.has(link) ? 0 : 6}
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