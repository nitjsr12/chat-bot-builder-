// src/components/Templates.js

const TEMPLATES = {
  FAQ: {
    nodes: [
      {
        id: "1",
        type: "default",
        position: { x: 250, y: 5 },
        data: { label: "FAQ Bot" },
      },
      {
        id: "2",
        type: "default",
        position: { x: 150, y: 100 },
        data: { label: "How can I help you?" },
      },
      {
        id: "3",
        type: "default",
        position: { x: 350, y: 100 },
        data: { label: "What is your query?" },
      },
    ],
    edges: [
      { id: "e1-2", source: "1", target: "2", animated: true },
      { id: "e1-3", source: "1", target: "3", animated: true },
    ],
  },
  eCommerce: {
    nodes: [
      {
        id: "1",
        type: "default",
        position: { x: 250, y: 5 },
        data: { label: "E-Commerce Bot" },
      },
      {
        id: "2",
        type: "default",
        position: { x: 150, y: 100 },
        data: { label: "Browse Products" },
      },
      {
        id: "3",
        type: "default",
        position: { x: 350, y: 100 },
        data: { label: "Track Order" },
      },
    ],
    edges: [
      { id: "e1-2", source: "1", target: "2", animated: true },
      { id: "e1-3", source: "1", target: "3", animated: true },
    ],
  },
  LeadGeneration: {
    nodes: [
      {
        id: "1",
        type: "default",
        position: { x: 250, y: 5 },
        data: { label: "Lead Generation Bot" },
      },
      {
        id: "2",
        type: "default",
        position: { x: 150, y: 100 },
        data: { label: "Collect User Info" },
      },
      {
        id: "3",
        type: "default",
        position: { x: 350, y: 100 },
        data: { label: "Schedule a Demo" },
      },
    ],
    edges: [
      { id: "e1-2", source: "1", target: "2", animated: true },
      { id: "e1-3", source: "1", target: "3", animated: true },
    ],
  },
};

export default TEMPLATES;
