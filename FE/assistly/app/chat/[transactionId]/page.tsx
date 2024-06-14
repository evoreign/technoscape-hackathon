"use client"
import React, { useEffect, useState } from 'react';
import Header from '@/components/navbar-header';

export default function ChatroomPage({ params }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const transactionId = params.transactionId;

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/chat/${transactionId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      const data = await response.json();
      if (JSON.stringify(messages) !== JSON.stringify(data)) { // Only update if data has changed
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    try {
      const response = await fetch('https://a081-182-253-54-191.ngrok-free.app/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId,
          message: `Customer: ${newMessage}`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      setMessages(data);
      setNewMessage(''); // Clear input after sending
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  useEffect(() => {
    fetchMessages(); // Fetch messages initially

    const intervalId = setInterval(fetchMessages, 5000); // Poll every 5 seconds

    return () => {
      clearInterval(intervalId); // Clean up interval on component unmount
    };
  }, [transactionId]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen py-20">
      <Header />
      <h1 className="text-3xl font-bold">Transaction ID: {transactionId}</h1>
      <div className="mt-4 max-w-lg w-full bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-4 py-2 border-b">
          <h2 className="text-lg font-semibold">Chat Messages</h2>
        </div>
        <div className="p-4">
          {loading ? (
            <p>Loading messages...</p>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className="mb-2">
                <p className="text-gray-800">{msg}</p>
              </div>
            ))
          )}
        </div>
      </div>
      <form className="mt-4 w-full max-w-lg" onSubmit={handleSubmit}>
        <div className="flex items-center border-b border-teal-500 py-2">
          <input
            className="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
            type="text"
            placeholder="Type your message here..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button
            className="flex-shrink-0 bg-teal-500 hover:bg-teal-700 border-teal-500 hover:border-teal-700 text-sm border-4 text-white py-1 px-2 rounded"
            type="submit"
          >
            Send
          </button>
        </div>
      </form>
    </main>
  );
}
