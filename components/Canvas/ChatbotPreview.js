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
      setConversation([{ sender: "bot", message: startNode.data.label }]);
    } else {
      alert("No start node found!");
    }
  };

  // Navigate to the next node based on conditions
  const goToNextNode = (condition) => {
    const outgoingEdge = edges.find(
      (edge) =>
        edge.source === currentNode.id &&
        (!edge.label || edge.label === condition),
    );

    if (outgoingEdge) {
      const nextNode = nodes.find((node) => node.id === outgoingEdge.target);
      if (nextNode) {
        setCurrentNode(nextNode);
        setConversation((prev) => [
          ...prev,
          { sender: "bot", message: nextNode.data.label },
        ]);
      }
    } else {
      setConversation((prev) => [
        ...prev,
        { sender: "bot", message: "No further steps available." },
      ]);
    }
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
            </div>
          </div>
        ))}
      </div>
      {currentNode ? (
        <div className="flex gap-2">
          {currentNode.data.components &&
          currentNode.data.components.length > 0 ? (
            currentNode.data.components.map((component, index) => (
              <button
                key={index}
                className="flex-1 rounded bg-blue-500 px-4 py-2 text-white"
                onClick={() => goToNextNode(component.properties.label)}
              >
                {component.properties.label || "Next"}
              </button>
            ))
          ) : (
            <button
              className="flex-1 rounded bg-blue-500 px-4 py-2 text-white"
              onClick={() => goToNextNode(null)}
            >
              Continue
            </button>
          )}
        </div>
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
