"use client";

import React, { useState } from "react";

const ChatbotPreview = ({ nodes, edges, onExitPreview }) => {
  const [conversation, setConversation] = useState([]);
  const [currentNode, setCurrentNode] = useState(null);

  // Start the simulation
  const startSimulation = () => {
    const startNode = nodes.find((node) =>
      edges.every((edge) => edge.target !== node.id),
    );

    if (startNode) {
      setCurrentNode(startNode);
      addMessageToConversation("bot", startNode.data.text || "Welcome!");
    } else {
      alert("No starting node found!");
    }
  };

  // Add a message to the conversation
  const addMessageToConversation = (sender, message, component = null) => {
    setConversation((prev) => [...prev, { sender, message, component }]);
  };

  // Navigate to the next node
  const goToNextNode = (postbackData) => {
    const outgoingEdge = edges.find(
      (edge) =>
        edge.source === currentNode.id && edge.sourceHandle === postbackData,
    );

    if (outgoingEdge) {
      const nextNode = nodes.find((node) => node.id === outgoingEdge.target);
      if (nextNode) {
        setCurrentNode(nextNode);
        addMessageToConversation("bot", nextNode.data.text || "Next message.");
      }
    } else {
      addMessageToConversation("bot", "No further steps available.");
    }
  };

  // Render the current node's components (buttons, images, etc.)
  const renderComponents = () => {
    if (!currentNode || !currentNode.data.components) return null;

    return currentNode.data.components.map((component, index) => {
      if (component.type === "button") {
        return (
          <button
            key={index}
            className="flex-1 rounded bg-blue-500 px-4 py-2 text-white"
            onClick={() => goToNextNode(component.properties.postbackData)}
          >
            {component.properties.label || "Button"}
          </button>
        );
      }

      if (component.type === "image") {
        return (
          <img
            key={index}
            src={component.properties.src || ""}
            alt={component.properties.alt || "Image"}
            className="my-2 rounded shadow"
            style={{
              width: component.properties.width || "100%",
              maxWidth: "300px",
            }}
          />
        );
      }

      return null; // Other component types can be added here
    });
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 rounded-lg bg-white p-4 shadow-lg">
      <h2 className="text-lg font-semibold">Chatbot Preview</h2>
      <div className="mb-2 h-64 overflow-y-auto border p-2">
        {conversation.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 ${
              msg.sender === "bot" ? "text-left" : "text-right"
            }`}
          >
            <div
              className={`inline-block rounded-lg px-3 py-2 ${
                msg.sender === "bot" ? "bg-gray-200" : "bg-blue-500 text-white"
              }`}
            >
              {msg.message}
              {msg.component}
            </div>
          </div>
        ))}
      </div>
      {currentNode ? (
        <div className="flex flex-wrap gap-2">{renderComponents()}</div>
      ) : (
        <button
          className="w-full rounded bg-green-500 px-4 py-2 text-white"
          onClick={startSimulation}
        >
          Start Preview
        </button>
      )}
      <button
        className="mt-4 w-full rounded bg-red-500 px-4 py-2 text-white"
        onClick={onExitPreview}
      >
        Exit Preview
      </button>
    </div>
  );
};

export default ChatbotPreview;
