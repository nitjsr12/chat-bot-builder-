"use client";

import React, { useCallback, useState } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Handle,
  MiniMap,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import TEMPLATES from "./Templates";
import ChatbotPreview from "./ChatbotPreview";

import {
  FaPlus,
  FaTrash,
  FaSave,
  FaUpload,
  FaTextHeight,
  FaImage,
  FaReply,
} from "react-icons/fa";

const LOCAL_STORAGE_KEY = "react-flow-data";

const EditableComponent = ({
  component,
  onUpdate,
  onDelete,
  onSendMessage,
}) => {
  const [inputValue, setInputValue] = useState("");

  const handlePropertyChange = (e) => {
    const { name, value } = e.target;
    onUpdate({
      ...component,
      properties: { ...component.properties, [name]: value },
    });
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSend = () => {
    if (component.type === "quick-reply") {
      onSendMessage(component.properties.reply);
    } else {
      onSendMessage(inputValue);
      setInputValue("");
    }
  };

  return (
    <div className="relative rounded border bg-gray-100 p-4 shadow-inner">
      {component.type === "textarea" ? (
        <textarea
          value={inputValue}
          onChange={handleInputChange}
          placeholder={component.properties.placeholder}
          className="w-full rounded border p-2"
        />
      ) : component.type === "text-input" ? (
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={component.properties.placeholder}
          className="w-full rounded border p-2"
        />
      ) : component.type === "button" ? (
        <button
          className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          onClick={handleSend}
        >
          {component.properties.label}
        </button>
      ) : component.type === "image" ? (
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              const reader = new FileReader();
              reader.onload = () => {
                onUpdate({
                  ...component,
                  properties: { ...component.properties, src: reader.result },
                });
              };
              if (file) reader.readAsDataURL(file);
            }}
            className="mb-2 w-full"
          />
          {component.properties.src && (
            <img
              src={component.properties.src}
              alt={component.properties.alt || "Uploaded Image"}
              className="w-full rounded"
            />
          )}
        </div>
      ) : component.type === "quick-reply" ? (
        <button
          className="w-full rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
          onClick={handleSend}
        >
          {component.properties.reply}
        </button>
      ) : null}
      <button
        className="mt-2 w-full rounded bg-gray-200 px-4 py-2 text-blue-600 hover:bg-gray-300"
        onClick={() => onUpdate(component)}
      >
        Edit Properties
      </button>
      <button
        onClick={onDelete}
        className="absolute right-2 top-2 text-red-500 hover:text-red-700"
      >
        <FaTrash />
      </button>
      <Handle
        type="source"
        position="right"
        id={component.id}
        style={{
          background: "#007bff",
          borderRadius: "50%",
          border: "2px solid #0056b3",
          width: 15,
          height: 15,
          top: "50%",
          transform: "translateY(-50%)",
        }}
      />
    </div>
  );
};

const TextUpdaterNode = ({
  data,
  selected,
  onHeaderChange,
  onUpdateComponent,
  onDeleteComponent,
  onSendMessage,
}) => {
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [headerText, setHeaderText] = useState(data.header);

  const handleHeaderChange = (e) => {
    setHeaderText(e.target.value);
  };

  const saveHeader = () => {
    setIsEditingHeader(false);
    onHeaderChange(headerText);
  };

  return (
    <div
      className={`rounded-lg border border-gray-300 bg-white p-2 shadow-lg dark:bg-gray-800 ${
        selected ? "ring-2 ring-blue-500" : ""
      }`}
    >
      <Handle
        type="target"
        position="top"
        style={{
          background: "#555",
          borderRadius: "50%",
          border: "2px solid #333",
          width: 15,
          height: 15,
        }}
      />
      <div className="mb-2 text-xs font-bold text-gray-600 dark:text-gray-300">
        {isEditingHeader ? (
          <input
            type="text"
            value={headerText}
            onChange={handleHeaderChange}
            onBlur={saveHeader}
            onKeyDown={(e) => e.key === "Enter" && saveHeader()}
            autoFocus
            className="w-full rounded border p-1 text-sm focus:ring-2 focus:ring-blue-400"
          />
        ) : (
          <span
            onClick={() => setIsEditingHeader(true)}
            className="cursor-pointer hover:underline"
          >
            {data.header || "Node"}
          </span>
        )}
      </div>
      {data.messages.map((msg, index) => (
        <div
          key={index}
          className="mb-2 rounded bg-blue-100 p-2 text-sm text-gray-700"
        >
          {msg}
        </div>
      ))}
      {data.components.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Add a component
        </p>
      ) : (
        data.components.map((component, index) => (
          <EditableComponent
            key={index}
            component={component}
            onUpdate={(updatedComponent) =>
              onUpdateComponent(index, updatedComponent)
            }
            onDelete={() => onDeleteComponent(index)}
            onSendMessage={(msg) => onSendMessage(msg)}
          />
        ))
      )}
      <Handle
        type="source"
        position="bottom"
        style={{
          background: "#007bff",
          borderRadius: "50%",
          border: "2px solid #0056b3",
          width: 15,
          height: 15,
        }}
      />
    </div>
  );
};

const NodeComponent = ({
  data,
  onDelete,
  onDrop,
  onHeaderChange,
  onUpdateComponent,
  onDeleteComponent,
  onSendMessage,
  selected,
}) => {
  const handleDropdownChange = (e) => {
    const selectedComponent = {
      type: e.target.value,
      properties: { placeholder: "Enter text here" },
    };
    if (selectedComponent.type === "text-input") {
      selectedComponent.properties.placeholder = "Type something...";
    } else if (selectedComponent.type === "button") {
      selectedComponent.properties = { label: "Click Me" };
    } else if (selectedComponent.type === "image") {
      selectedComponent.properties = {
        src: "",
        alt: "Image Placeholder",
      };
    } else if (selectedComponent.type === "quick-reply") {
      selectedComponent.properties = { reply: "Quick Reply" };
    }
    onDrop(selectedComponent);
  };

  return (
    <div
      className={`relative rounded-lg border border-gray-200 bg-gray-50 p-4 shadow-lg dark:bg-gray-700 ${
        selected ? "ring-2 ring-blue-500" : ""
      }`}
    >
      <TextUpdaterNode
        data={data}
        selected={selected}
        onHeaderChange={onHeaderChange}
        onUpdateComponent={onUpdateComponent}
        onDeleteComponent={onDeleteComponent}
        onSendMessage={onSendMessage}
      />
      <select
        onChange={handleDropdownChange}
        className="mt-2 w-full rounded border bg-white p-2 text-gray-700 dark:bg-gray-600 dark:text-gray-200"
      >
        <option value="">Add Component</option>
        <option value="textarea">Textarea</option>
        <option value="text-input">Text Input</option>
        <option value="button">Button</option>
        <option value="image">Image</option>
        <option value="quick-reply">Quick Reply</option>
      </select>
      <button
        onClick={onDelete}
        className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-red-500 text-white transition hover:bg-red-600"
        title="Delete Node"
      >
        <FaTrash size={10} />
      </button>
    </div>
  );
};

function Flow() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodeCount, setNodeCount] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);

  // Save Flow
  const saveFlow = () => {
    const flowData = { nodes, edges };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(flowData));
    alert("Flow saved successfully!");
  };

  // Load Flow
  const loadFlow = () => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData) {
      const { nodes: savedNodes, edges: savedEdges } = JSON.parse(savedData);
      setNodes(savedNodes || []);
      setEdges(savedEdges || []);
      alert("Flow loaded successfully!");
    } else {
      alert("No saved flow found!");
    }
  };

  const loadTemplate = () => {
    const template = TEMPLATES[selectedTemplate];
    if (template) {
      setNodes(template.nodes);
      setEdges(template.edges);
      alert(`${selectedTemplate} Template Loaded!`);
    } else {
      alert("Select a valid template!");
    }
  };
  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [],
  );

  const addNode = () => {
    const newNode = {
      id: (nodes.length + 1).toString(),
      type: "custom",
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { components: [], messages: [], header: `Node ${nodeCount + 1}` },
    };
    setNodes((nds) => nds.concat(newNode));
    setNodeCount(nodeCount + 1);
  };

  const deleteNode = (nodeId) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) =>
      eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
    );
  };

  const handleDrop = (component, nodeId) => {
    const updatedNodes = nodes.map((node) => {
      if (node.id === nodeId) {
        return {
          ...node,
          data: {
            ...node.data,
            components: [
              ...node.data.components,
              { ...component, id: `comp-${Date.now()}` },
            ],
          },
        };
      }
      return node;
    });

    setNodes(updatedNodes);
  };

  const handleUpdateComponent = (nodeId, componentIndex, updatedComponent) => {
    const updatedNodes = nodes.map((node) => {
      if (node.id === nodeId) {
        const updatedComponents = [...node.data.components];
        updatedComponents[componentIndex] = updatedComponent;
        return {
          ...node,
          data: { ...node.data, components: updatedComponents },
        };
      }
      return node;
    });

    setNodes(updatedNodes);
  };

  const handleDeleteComponent = (nodeId, componentIndex) => {
    const updatedNodes = nodes.map((node) => {
      if (node.id === nodeId) {
        const updatedComponents = [...node.data.components];
        updatedComponents.splice(componentIndex, 1);
        return {
          ...node,
          data: { ...node.data, components: updatedComponents },
        };
      }
      return node;
    });

    setNodes(updatedNodes);
  };

  const handleSendMessage = (nodeId, msg) => {
    const updatedNodes = nodes.map((node) => {
      if (node.id === nodeId) {
        return {
          ...node,
          data: { ...node.data, messages: [...node.data.messages, msg] },
        };
      }
      return node;
    });

    setNodes(updatedNodes);
  };

  const handleHeaderChange = (newHeader, nodeId) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, header: newHeader } }
          : node,
      ),
    );
  };

  const nodeTypes = {
    custom: (props) => (
      <NodeComponent
        {...props}
        onDelete={() => deleteNode(props.id)}
        onDrop={(component) => handleDrop(component, props.id)}
        onHeaderChange={(header) => handleHeaderChange(header, props.id)}
        onUpdateComponent={(index, updatedComponent) =>
          handleUpdateComponent(props.id, index, updatedComponent)
        }
        onDeleteComponent={(index) => handleDeleteComponent(props.id, index)}
        onSendMessage={(msg) => handleSendMessage(props.id, msg)}
        selected={selectedNode === props.id}
      />
    ),
  };

  const onNodeClick = (event, node) => {
    setSelectedNode(node.id);
  };

  const onPaneClick = () => {
    setSelectedNode(null);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-44 bg-white p-4 shadow-md">
        <button
          onClick={addNode}
          className="mb-4 w-full rounded bg-blue-500 px-4 py-2 text-white"
        >
          <FaPlus className="mr-2 inline" />
          Add Node
        </button>
        <button
          onClick={saveFlow}
          className="mb-4 w-full rounded bg-green-500 px-4 py-2 text-white"
        >
          <FaSave className="mr-2 inline" />
          Save Flow
        </button>
        <button
          onClick={loadFlow}
          className="mb-4 w-full rounded bg-yellow-500 px-4 py-2 text-white"
        >
          <FaUpload className="mr-2 inline" />
          Load Flow
        </button>
        <div className="mb-4">
          <label className="mb-2 block text-sm font-semibold">Templates:</label>
          <select
            onChange={(e) => setSelectedTemplate(e.target.value)}
            className="mb-2 w-full rounded border p-2"
          >
            <option value="">Select Template</option>
            <option value="FAQ">FAQ Bot</option>
            <option value="eCommerce">E-Commerce Bot</option>
            <option value="LeadGeneration">Lead Generation Bot</option>
          </select>
          <button
            onClick={loadTemplate}
            className="w-full rounded bg-purple-500 px-4 py-2 text-white"
          >
            Load Template
          </button>
        </div>
      </div>

      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
        >
          <MiniMap />
          <Controls />
          <Background variant={BackgroundVariant.Lines} gap={16} />
        </ReactFlow>
      </div>

      {/* Preview Button */}
      <button
        onClick={() => setIsPreviewVisible(!isPreviewVisible)}
        className="fixed bottom-4 right-4 rounded-full bg-blue-500 px-4 py-2 text-white shadow-lg"
      >
        {isPreviewVisible ? "Close Preview" : "Preview"}
      </button>

      {/* Chatbot Preview */}
      {isPreviewVisible && (
        <ChatbotPreview
          nodes={nodes}
          edges={edges}
          onExitPreview={() => setIsPreviewVisible(false)}
        />
      )}
    </div>
  );
}

export default Flow;
