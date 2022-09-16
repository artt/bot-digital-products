import { kebabCase } from 'lodash'

const nodeStructure = {
  infrastructure: {
    data: [
      {
        name: "CWS",
        description: "ธปท. รับหน้าที่เป็นผู้ดูแลและดำเนินงานระบบฐานข้อมูลกลางในระยะแรก เพื่อให้มั่นใจว่าระบบฐานข้อมูลดังกล่าวมีประสิทธิภาพเพียงพอ พร้อมกันนี้ ธปท. ได้ออกแนวปฏิบัติ ธปท. เรื่อง การใช้ระบบฐานข้อมูลกลาง เพื่อใช้เป็นกรอบหลักเกณฑ์ให้ผู้ใช้งานระบบฐานข้อมูลกลางถือปฏิบัติในการใช้งานที่เป็นมาตรฐานเดียวกัน",
        link: "https://www.bot.or.th/Thai/PressandSpeeches/Press/2021/Pages/n2964.aspx",
      },
      {
        name: "Payment Data Platform",
        description: "",
      },
    ],
    payment: [
      {
        name: "BAHTNET API Hub",
        description: "",
      },
    ]
  },
  product: {
    payment: [
      {
        name: "PromptBiz",
        description: "",
      },
    ],
    lending: [
      {
        name: "Digital Factoring",
        description: "",
      },
      {
        name: "dStatement",
        description: "",
      },
    ]
  }
}

const linkStructure = [
  {source: "CWS", target: "Digital Factoring", name: "ฐานข้อมูลสนับสนุน"},
  {source: "PromptBiz", target: "Digital Factoring", name: "ข้อมูล invoice สนับสนุน"},
  {source: "BAHTNET API Hub", target: "PromptBiz", name: "สนับสนุนการโอนเงินปริมาณมาก"},
  {source: "Payment Data Platform", target: "dStatement", name: "แหล่งข้อมูล", type: "optional"},
  {source: "PromptBiz", target: "Payment Data Platform", name: "ข้อมูลการทำธุรกรรม"},
]

export const colors = {
  infrastructure: [45, 130, 161],
  product: [243, 137, 3],
}

function processNodes(nodeStructure) {
  let nodes = []
  Object.keys(nodeStructure).forEach(type => {
    Object.keys(nodeStructure[type]).forEach(subtype => {
      nodeStructure[type][subtype].forEach(n => {
        nodes.push({
          ...n,
          id: kebabCase(n.name),
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

export function getData() {
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
}