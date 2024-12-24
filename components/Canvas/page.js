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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"; // Utility for conditional classNames (optional)
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import {
  FaPlus,
  FaTrash,
  FaSave,
  FaUpload,
  FaTextHeight,
  FaImage,
  FaReply,
  FaEllipsisV,
} from "react-icons/fa";

const LOCAL_STORAGE_KEY = "react-flow-data";

const EditableComponent = ({
  component,
  index,
  onUpdate,
  onDelete,
  onSendMessage,
  navigateToNode,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [localLabel, setLocalLabel] = useState(
    component.properties.label || "",
  );

  const handleLocalChange = (e) => {
    setLocalLabel(e.target.value);
  };

  // Update parent state on blur (smooth)
  const handleBlur = () => {
    onUpdate({
      ...component,
      properties: { ...component.properties, label: localLabel },
    });
  };

  const handlePropertyChange = (e) => {
    const { name, value } = e.target;

    // Directly update the component to avoid lag
    const updatedComponent = {
      ...component,
      properties: { ...component.properties, [name]: value },
    };

    // Update parent state with new component data
    onUpdate(updatedComponent);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue("");
    }
  };
  const handleButtonClick = () => {
    if (component.properties.actionType === "link-node") {
      if (component.properties.nodeId) {
        navigateToNode(component.properties.nodeId);
      } else {
        alert("Please provide a valid Node ID to link.");
      }
    } else if (component.properties.actionType === "url") {
      if (component.properties.url) {
        window.open(component.properties.url, "_blank");
      } else {
        alert("Please provide a valid URL.");
      }
    } else if (component.properties.actionType === "api-call") {
      if (component.properties.apiUrl) {
        fetch(component.properties.apiUrl)
          .then((response) => response.json())
          .then((data) => alert(`API Response: ${JSON.stringify(data)}`))
          .catch((error) => alert(`API Error: ${error.message}`));
      } else {
        alert("Please provide a valid API URL.");
      }
    }
  };
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onUpdate({
          ...component,
          properties: {
            ...component.properties,
            src: reader.result,
          },
        });
      };
      reader.readAsDataURL(file);
    }
  };
  const handleTextChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    if (onChange) onChange(value);
  };

  const handleResize = (e) => {
    const newWidth = e.target.value;
    onUpdate({
      ...component,
      properties: {
        ...component.properties,
        width: newWidth,
      },
    });
  };
  return (
    <div className="relative rounded border bg-gray-100 p-4 shadow-inner">
      {component.type === "textarea" && (
        <div className="rounded-lg border border-gray-300 bg-white p-6 shadow-lg">
          <label className="mb-3 block text-lg font-medium text-gray-900">
            Message
          </label>

          <Textarea
            value={inputValue}
            onChange={handleInputChange}
            placeholder={
              component.properties.placeholder || "Type your message here..."
            }
            maxLength={component.properties.maxLength}
            rows={5}
            className={cn(
              "w-full resize-none rounded-lg border-gray-300 bg-white p-3 text-gray-700 shadow-sm",
              "focus:border-primary focus:ring-2 focus:ring-primary/40",
            )}
          />

          <div className="mt-4 flex justify-end">
            <Button
              onClick={handleSend}
              variant="default"
              className="px-6 py-2 font-medium"
            >
              Send
            </Button>
          </div>
        </div>
      )}

      <button
        onClick={onDelete}
        className="absolute right-2 top-2 text-red-500 hover:text-red-700"
      >
        <FaTrash />
      </button>
      {/* Button Preview */}
      <div className="relative">
        <Button className="w-full px-4 py-2 font-medium" variant="default">
          {component.properties.label || "Button"}
        </Button>

        {/* Quick Reply Connection Point */}
        {component.properties.actionType === "quick-reply" && (
          <Handle
            type="source"
            position="right"
            id={`quick-reply-${index}`}
            style={{
              background: "#007bff",
              border: "2px solid #0056b3",
              borderRadius: "50%",
              width: 12,
              height: 12,
              right: -8,
              top: `${index * 40}px`,
              transform: "translateY(-50%)",
            }}
          />
        )}
      </div>

      {/* Editable Properties */}
      <div className="mt-4 space-y-4">
        <div>
          <Label htmlFor="label" className="text-sm font-semibold">
            Button Label
          </Label>
          <Input
            type="text"
            id="label"
            value={localLabel}
            onChange={handleLocalChange}
            onBlur={handleBlur}
            placeholder="Enter Button Text"
          />
        </div>

        <div>
          <Label htmlFor="actionType" className="text-sm font-semibold">
            Action Type
          </Label>
          <Select
            value={component.properties.actionType || ""}
            onValueChange={(value) =>
              handlePropertyChange({
                target: { name: "actionType", value },
              })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="quick-reply">Quick Reply</SelectItem>
              <SelectItem value="url">URL</SelectItem>
              <SelectItem value="dialer">Dialer</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Action-Specific Options */}
        {component.properties.actionType === "url" && (
          <div>
            <label className="mt-2 block text-sm font-semibold">URL:</label>
            <input
              type="text"
              name="url"
              value={component.properties.url || ""}
              onChange={handlePropertyChange}
              placeholder="Enter URL"
              className="w-full rounded border p-2"
            />
          </div>
        )}

        {component.properties.actionType === "dialer" && (
          <div>
            <label className="mt-2 block text-sm font-semibold">
              Phone Number:
            </label>
            <input
              type="text"
              name="phoneNumber"
              value={component.properties.phoneNumber || ""}
              onChange={handlePropertyChange}
              placeholder="Enter Phone Number"
              className="w-full rounded border p-2"
            />
          </div>
        )}

        {component.properties.actionType === "call-to-action" && (
          <div>
            <label className="mt-2 block text-sm font-semibold">
              Action Name:
            </label>
            <input
              type="text"
              name="callToAction"
              value={component.properties.callToAction || ""}
              onChange={handlePropertyChange}
              placeholder="Enter Action Name"
              className="w-full rounded border p-2"
            />
          </div>
        )}

        {component.properties.actionType === "quick-reply" && (
          <div>
            <label className="mt-2 block text-sm font-semibold">
              Postback Data:
            </label>
            <input
              type="text"
              name="postbackData"
              value={component.properties.postbackData || ""}
              onChange={(e) => handlePropertyChange(e)}
              placeholder="Enter custom postback data"
              className="w-full rounded border p-2"
            />
          </div>
        )}
      </div>
      {/* Image Component */}
      {component.type === "image" && (
        <div>
          <div className="mb-2">
            <label className="block text-sm font-semibold">Image Source:</label>
            <input
              type="text"
              name="src"
              value={component.properties.src || ""}
              onChange={handlePropertyChange}
              placeholder="Enter Image URL"
              className="w-full rounded border p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold">Upload Image:</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full rounded border p-2"
            />
          </div>
          {component.properties.src && (
            <div>
              <img
                src={component.properties.src}
                alt={component.properties.alt || "Uploaded Image"}
                style={{
                  width: component.properties.width || "100%",
                  maxWidth: "100%",
                  height: "auto",
                }}
                className="mt-2 rounded border"
              />
              <div className="mt-2">
                <label className="block text-sm font-semibold">Width:</label>
                <input
                  type="range"
                  min="50"
                  max="800"
                  value={parseInt(component.properties.width, 10) || 300}
                  onChange={handleResize}
                  className="w-full"
                />
                <input
                  type="number"
                  name="width"
                  value={component.properties.width || "300"}
                  onChange={(e) => handleResize(e)}
                  placeholder="Enter width in px"
                  className="w-full rounded border p-2"
                />
              </div>
            </div>
          )}
          <div className="mt-2">
            <label className="block text-sm font-semibold">Alt Text:</label>
            <input
              type="text"
              name="alt"
              value={component.properties.alt || ""}
              onChange={handlePropertyChange}
              placeholder="Enter Alt Text"
              className="w-full rounded border p-2"
            />
          </div>
        </div>
      )}
      {/* Quick Reply Component */}
      {component.type === "quick-reply" && (
        <div>
          <div className="mb-2">
            <label className="block text-sm font-semibold">
              Quick Reply Text:
            </label>
            <input
              type="text"
              name="reply"
              value={component.properties.reply || ""}
              onChange={handlePropertyChange}
              placeholder="Enter Quick Reply Text"
              className="w-full rounded border p-2"
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm font-semibold">
              Postback Data:
            </label>
            <input
              type="text"
              name="postbackData"
              value={component.properties.postbackData || ""}
              onChange={handlePropertyChange}
              placeholder="Enter Postback Data"
              className="w-full rounded border p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold">
              Link to Node ID:
            </label>
            <input
              type="text"
              name="nodeId"
              value={component.properties.nodeId || ""}
              onChange={handlePropertyChange}
              placeholder="Enter Node ID to Link"
              className="w-full rounded border p-2"
            />
          </div>
          <button
            onClick={() => navigateToNode(component.properties.nodeId || "")}
            className="mt-2 w-full rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
          >
            Go to Linked Node
          </button>
        </div>
      )}
      {/* Delete Button */}
      <button
        onClick={onDelete}
        className="absolute right-2 top-3 text-red-500 hover:text-red-700"
      >
        <FaTrash />
      </button>
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
            index={index} // Pass the index explicitly
            component={component}
            onUpdate={(updatedComponent) =>
              onUpdateComponent(index, updatedComponent)
            }
            onDelete={() => onDeleteComponent(index)}
            onSendMessage={(msg) => onSendMessage(msg)}
            navigateToNode={(nodeId) =>
              console.log(`Navigating to Node ID: ${nodeId}`)
            }
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
  const handleComponentSelect = (componentType) => {
    const selectedComponent = {
      type: componentType,
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
      className={`relative rounded-lg border bg-white  shadow-md transition-all ${
        selected ? "ring-1 ring-blue-500" : ""
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

      {/* Dropdown Menu for Adding Components */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1 text-gray-600 hover:bg-gray-100"
          >
            <FaEllipsisV />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => handleComponentSelect("textarea")}>
            ➕ Add Textarea
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleComponentSelect("text-input")}>
            ➕ Add Text Input
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleComponentSelect("button")}>
            ➕ Add Button
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleComponentSelect("image")}>
            ➕ Add Image
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleComponentSelect("quick-reply")}
          >
            ➕ Add Quick Reply
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={onDelete}
            className="text-red-600 hover:bg-red-100"
          >
            <FaTrash className="mr-2" /> Delete Node
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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
  const exportFlow = () => {
    const exportData = {}; // Final JSON object
    const processedNodes = new Set();

    // Find a node by ID
    const findNodeById = (id) => nodes.find((node) => node.id === id);

    // Recursive function to process nodes
    const processNode = (node, nodeKey) => {
      if (!node || processedNodes.has(node.id)) return; // Skip already processed nodes
      processedNodes.add(node.id);

      const key = `ins_${nodeKey}`;
      console.log(`Processing Node: ${key}`);

      const suggestions = node.data.components
        .filter((comp) => comp.type === "button")
        .map((button) => {
          const { actionType, postbackData, label, nodeId } = button.properties;

          if (actionType === "quick-reply" && postbackData) {
            const targetNode = findNodeById(nodeId);
            if (targetNode) {
              processNode(targetNode, postbackData); // Recursively process connected nodes
            }
            return {
              reply: {
                text: label || "Quick Reply",
                postbackData: postbackData, // Use the correct postbackData
              },
            };
          } else if (actionType === "url") {
            return {
              action: {
                text: label || "Open URL",
                openUrlAction: { url: button.properties.url || "" },
              },
            };
          }
          return null;
        })
        .filter(Boolean);

      exportData[key] = {
        contentMessage: {
          text: node.data.messages.join("\n") || "",
          suggestions,
        },
      };
    };

    // Start processing all nodes with valid customKeys
    nodes.forEach((node) => {
      if (node.data.customKey) processNode(node, node.data.customKey);
    });

    console.log("Final Export Data:", exportData);

    // Export the JSON file
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "flow_export.json";
    link.click();
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
      data: {
        header: `Node ${nodes.length + 1}`,
        customKey: `node_${nodes.length + 1}`,
        components: [],
        messages: [], // Initialize as empty array
      },
    };
    setNodes((nds) => nds.concat(newNode));
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
          className="mb-4 w-full rounded bg-[#9d9d9d] px-4 py-2 text-white hover:bg-[#008000]"
        >
          <FaPlus className="mr-2 inline" />
          Add Node
        </button>
        <button
          onClick={saveFlow}
          className="mb-4 w-full rounded bg-[#9d9d9d] px-4 py-2 text-white hover:bg-[#008000]"
        >
          <FaSave className="mr-2 inline" />
          Save Flow
        </button>
        <button
          onClick={loadFlow}
          className="mb-4 w-full rounded bg-[#9d9d9d]  px-4 py-2 text-white hover:bg-[#008000]"
        >
          <FaUpload className="mr-2 inline" />
          Load Flow
        </button>
        <button
          onClick={exportFlow}
          className="mb-4 w-full rounded bg-[#9d9d9d] px-4 py-2 text-white hover:bg-[#008000]"
        >
          Export Flow
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
            className="mb-4 w-full rounded bg-[#9d9d9d] px-4 py-2 text-white hover:bg-[#008000]"
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
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onConnect={(connection) => {
            const sourceNode = nodes.find((n) => n.id === connection.source);
            const targetNode = nodes.find((n) => n.id === connection.target);

            if (sourceNode && targetNode) {
              const quickReplyButton = sourceNode.data.components.find(
                (comp, index) =>
                  comp.type === "button" &&
                  comp.properties.actionType === "quick-reply" &&
                  `quick-reply-${index}` === connection.sourceHandle,
              );

              if (quickReplyButton) {
                // Assign the postbackData to the target node's customKey
                targetNode.data.customKey =
                  quickReplyButton.properties.postbackData;
                console.log(
                  `Assigned postbackData "${quickReplyButton.properties.postbackData}" to target node: ${targetNode.data.customKey}`,
                );
              } else {
                console.warn(
                  `No matching Quick Reply Button found for Handle: ${connection.sourceHandle}`,
                );
              }
            }
            setEdges((eds) => addEdge(connection, eds));
          }}
        >
          <MiniMap />
          <Controls />
          <Background variant={BackgroundVariant.Lines} gap={16} />
        </ReactFlow>
      </div>

      {/* Preview Button */}
      <button
        onClick={() => setIsPreviewVisible(!isPreviewVisible)}
        className="fixed bottom-4 right-4 rounded-full bg-[#9d9d9d] px-4 py-2 text-white shadow-lg"
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
