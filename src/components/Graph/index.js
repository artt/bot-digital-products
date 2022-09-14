import React from "react"
import ForceGraph2D from 'react-force-graph-2d';
import { kebabCase } from 'lodash';
import { forceX, forceY, forceZ } from 'd3-force-3d'

const nodeStructure = {
  infrastructure: {
    data: [
      "CWS",
      "Payment Data Platform",  
    ],
    payment: [
      "BAHTNET API Hub",
    ]
  },
  product: {
    payment: [
      "PromptBiz",
    ],
    lending: [
      "Digital Factoring",
      "dStatement",
    ]
  }
}

const linkStructure = [
  {source: "CWS", target: "Digital Factoring", label: "ฐานข้อมูลสนับสนุน"},
  {source: "PromptBiz", target: "Digital Factoring", label: "ข้อมูล invoice สนับสนุน"},
  {source: "BAHTNET API Hub", target: "PromptBiz", label: "สนับสนุนการโอนเงินปริมาณมาก"},
  {source: "Payment Data Platform", target: "dStatement", label: "แหล่งข้อมูล", type: "optional"},
  {source: "PromptBiz", target: "Payment Data Platform", label: "ข้อมูลการทำธุรกรรม"},
]

const colors = {
  infrastructure: "DarkBlue",
  product: "DarkOrange",
}

function processNodes(nodeStructure) {
  let nodes = []
  Object.keys(nodeStructure).forEach(type => {
    Object.keys(nodeStructure[type]).forEach(subtype => {
      nodeStructure[type][subtype].forEach(n => {
        nodes.push({
          id: kebabCase(n),
          name: n,
          type: type,
          subtype: subtype,
        })
      })
    })
  })
  return nodes
}

function processLinks(linkStructure) {
  return linkStructure.map(link => ({
    ...link,
    source: kebabCase(link.source),
    target: kebabCase(link.target),
  }))
}

function findNodeIndex(nodes, id) {
  return nodes.map(node => node.id).indexOf(id)
}

export default function Graph() {

  const fgRef = React.useRef();
  const [graphLoaded, setGraphLoaded] = React.useState(false);

  const [highlightNodes, setHighlightNodes] = React.useState(new Set());
  const [highlightLinks, setHighlightLinks] = React.useState(new Set());
  const [hoverNode, setHoverNode] = React.useState(null);

  const updateHighlight = () => {
    setHighlightNodes(highlightNodes);
    setHighlightLinks(highlightLinks);
  }

  const handleNodeHover = node => {
    highlightNodes.clear();
    highlightLinks.clear();
    if (node) {
      highlightNodes.add(node);
      node.neighbors.forEach(neighbor => highlightNodes.add(neighbor));
      node.links.forEach(link => highlightLinks.add(link));
    }

    setHoverNode(node || null);
    updateHighlight();
  }

  function drawNode(node, ctx, scale) {
    ctx.beginPath();
    if (node === hoverNode) {
      ctx.arc(node.x, node.y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = node === hoverNode ? "red" : "green"
      ctx.fill()
    }
    ctx.beginPath();
    ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = colors[node.type]
    ctx.fill()
    ctx.font = '6px Sans-Serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
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

  const data = React.useMemo(() => {
    let nodes = processNodes(nodeStructure)
    let links = processLinks(linkStructure)
    links.forEach(link => {
      const a = nodes[findNodeIndex(nodes, link.source)];
      const b = nodes[findNodeIndex(nodes, link.target)];
      !a.neighbors && (a.neighbors = []);
      !b.neighbors && (b.neighbors = []);
      a.neighbors.push(b);
      b.neighbors.push(a);

      !a.links && (a.links = []);
      !b.links && (b.links = []);
      a.links.push(link);
      b.links.push(link);
    })
    return ({ nodes: nodes, links: links })
  }, [])

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
          nodeAutoColorBy="type"
          nodeVal={10}
          nodeCanvasObject={drawNode}
          onNodeHover={handleNodeHover}
          nodeLabel=""
          // link
          linkLineDash={link => link.type === "optional" ? [2, 2] : false}
          linkDirectionalArrowLength={6}
          linkWidth={link => highlightLinks.has(link) ? 5 : 1}
          linkDirectionalParticles={4}
          linkDirectionalParticleWidth={link => highlightLinks.has(link) ? 4 : 0}
          // misc
          onEngineTick={() => setGraphLoaded(true)}
        />
      }
    </div>
  )

}