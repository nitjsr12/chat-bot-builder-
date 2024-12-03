import create from 'zustand';
import { applyNodeChanges, applyEdgeChanges, addEdge } from 'react-flow-renderer';

const useFlowStore = create((set) => ({
  nodes: [],
  edges: [],
  theme: 'light',

  addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),
  
  deleteNode: (nodeId) =>
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== nodeId),
      edges: state.edges.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId
      ),
    })),

  onNodesChange: (changes) =>
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes),
    })),

  onEdgesChange: (changes) =>
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
    })),

  onConnect: (connection) =>
    set((state) => ({ edges: addEdge(connection, state.edges) })),

  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
}));

export default useFlowStore;
