import { kebabCase } from 'lodash'

const nodeStructure = {
  infrastructure: {
    data: [
      {
        name: "Payment Data Platform",
      },
      {
        name: "CWS",
        description: "ธปท. รับหน้าที่เป็นผู้ดูแลและดำเนินงานระบบฐานข้อมูลกลางในระยะแรก เพื่อให้มั่นใจว่าระบบฐานข้อมูลดังกล่าวมีประสิทธิภาพเพียงพอ พร้อมกันนี้ ธปท. ได้ออกแนวปฏิบัติ ธปท. เรื่อง การใช้ระบบฐานข้อมูลกลาง เพื่อใช้เป็นกรอบหลักเกณฑ์ให้ผู้ใช้งานระบบฐานข้อมูลกลางถือปฏิบัติในการใช้งานที่เป็นมาตรฐานเดียวกัน",
        link: "https://www.bot.or.th/Thai/PressandSpeeches/Press/2021/Pages/n2964.aspx",
      },
    ],
    payment: [
      {
        name: "BAHTNET API Hub",
      },
      {
        name: "mBridge",
      },
    ],
    id: [
      {
        name: "NDID",
      }
    ],
  },
  product: {
    payment: [
      {
        name: "PromptBiz",
      },
      {
        name: "PromptPay",
      },
      {
        name: "Cross-border Payment",
      },
      {
        name: "Cross-border Transfer",
      },
      {
        name: "QR Payment",
      },
    ],
    lending: [
      {
        name: "dStatement",
      },
      {
        name: "Digital Factoring",
      },
      {
        name: "Digital P-Loan",
      }
    ],
    id: [
      {
        name: "e-KYC",
      },
    ],
  }
}

const linkStructure = [
  {source: "CWS", target: "Digital Factoring", name: "ฐานข้อมูลสนับสนุน"},
  {source: "PromptBiz", target: "Digital Factoring", name: "ข้อมูล invoice สนับสนุน"},
  {source: "BAHTNET API Hub", target: "PromptBiz", name: "สนับสนุนการโอนเงินปริมาณมาก"},
  {source: "Payment Data Platform", target: "dStatement", name: "แหล่งข้อมูล", type: "optional"},
  {source: "PromptBiz", target: "Payment Data Platform", name: "ข้อมูลการทำธุรกรรม"},
  {source: "NDID", target: "e-KYC", name: "ระบบส่งต่อข้อมูล"},
  {source: "e-KYC", target: "Digital P-Loan", name: "ยืนยันตัวตน"},
  {source: "e-KYC", target: "PromptBiz", name: "ยืนยันตัวตน"},
  {source: "PromptPay", target: "Digital P-Loan", name: "ข้อมูลทางเลือกในการปล่อยสินเชื่อ", type: "optional"},
  {source: "QR Payment", target: "PromptPay", name: "เพิ่มความสะดวก", type: "optional"},
  {source: "PromptPay", target: "Cross-border Payment", name: "กลไกรับส่งเงินฝั่งเงินบาท"},
  {source: "mBridge", target: "Cross-border Transfer", name: "โครงสร้างพื้นฐาน"},
]

export const colors = {
  infrastructure: {
    data: [45, 130, 161],
    payment: [80, 40, 200],
    id: [20, 150, 178],
  },
  product: {
    payment: [243, 137, 3],
    lending: [255, 100, 20],
    id: [220, 137, 30],
  },
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
          color: colors[type][subtype],
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
  // loop over subtype and create links between them
  let subtypeLinks = []
  Object.keys(nodeStructure).forEach(type => {
    Object.keys(nodeStructure[type]).forEach(subtype => {
      const tmp = nodeStructure[type][subtype]
      const numInSubtype = tmp.length
      for (let i = 0; i < numInSubtype; i ++) {
        for (let j = i + 1; j < numInSubtype; j ++) {
          subtypeLinks.push({
            source: kebabCase(tmp[i].name),
            target: kebabCase(tmp[j].name),
            type: "subtype",
          })
        }
      }
    })
  })
  return ({ nodes: nodes, links: links.concat(subtypeLinks) })
}