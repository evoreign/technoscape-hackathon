"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios'; // Import axios for API calls
import Header from '@/components/navbar-header';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function ChatroomPage({ params }) {
  const [messages, setMessages] = useState([]);
  const [translatedMessages, setTranslatedMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');  // Default to English
  const [overallSentiment, setOverallSentiment] = useState('');  // State for sentiment
  const transactionId = params.transactionId;
  const [summary, setSummary] = useState('');

  const apiKey = 'efc50c7e9amsh2fba9aea7f15f21p15c0dcjsn05ab783b6cba';
  const apiHost = 'deep-translate1.p.rapidapi.com';

  const sentimentApiKey = 'efc50c7e9amsh2fba9aea7f15f21p15c0dcjsn05ab783b6cba';
  const sentimentApiHost = 'twinword-sentiment-analysis.p.rapidapi.com';

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/chat/${transactionId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      const data = await response.json();
      setMessages(data);

      // Translate messages if a language other than English is selected
      if (selectedLanguage !== 'en') {
        const translated = await Promise.all(
          data.map((msg) => translateMessage(msg, 'en', selectedLanguage))
        );
        setTranslatedMessages(translated);
      } else {
        setTranslatedMessages(data);
      }

      // Perform sentiment analysis
      const combinedText = data.map(msg => msg.text).join('. ');
      const sentiment = await analyzeSentiment(data);
      setOverallSentiment(sentiment);

    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    let messageToSend = `Agent: ${newMessage}`;

    // Translate the message if a language is selected
    if (selectedLanguage && selectedLanguage !== 'en') {
      const translatedMessage = await translateMessage(newMessage, 'en', selectedLanguage);
      if (translatedMessage) {
        messageToSend = `Agent: ${translatedMessage}`;
      }
    }

    try {
      const response = await fetch('http://localhost:4000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId,
          message: messageToSend,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      setMessages(data);
      setNewMessage(''); // Clear input after sending

      // Translate messages if a language other than English is selected
      if (selectedLanguage !== 'en') {
        const translated = await Promise.all(
          data.map((msg) => translateMessage(msg, 'en', selectedLanguage))
        );
        setTranslatedMessages(translated);
      } else {
        setTranslatedMessages(data);
      }

      // Perform sentiment analysis
      const combinedText = data.map(msg => msg.text).join('. ');
      const sentiment = await analyzeSentiment(data);
      setOverallSentiment(sentiment);

    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  const handleSolveClick = async (transactionId) => {
    // Construct the URL with the transactionId
    const url = `http://localhost:4000/chat/${transactionId}`;

    try {
      // Make a DELETE request to the specified URL
      const response = await fetch(url, {
        method: 'DELETE',
      });

      // Check if the request was successful
      if (response.ok) {
        console.log('Delete operation was successful');
        // Handle success (e.g., update UI or state)
      } else {
        console.error('Delete operation failed', response.statusText);
        // Handle failure (e.g., show error message)
      }
    } catch (error) {
      console.error('Error making delete request', error);
      // Handle network errors or other exceptions
    }
  };

  const translateMessage = async (text, sourceLang, targetLang) => {
    try {
      const response = await axios.post(
        'https://deep-translate1.p.rapidapi.com/language/translate/v2',
        {
          q: text,
          source: sourceLang,
          target: targetLang,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-rapidapi-key': apiKey,
            'x-rapidapi-host': apiHost,
          },
        }
      );

      if (response.data && response.data.data) {
        return response.data.data.translations.translatedText;
      } else {
        throw new Error('Translation failed');
      }
    } catch (error) {
      console.error('Error translating message:', error);
      return null;
    }
  };

  const analyzeSentiment = async (text) => {
    try {
      const response = await axios.post(
        'https://twinword-sentiment-analysis.p.rapidapi.com/analyze/',
        new URLSearchParams({ text }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'x-rapidapi-key': sentimentApiKey,
            'x-rapidapi-host': sentimentApiHost,
          },
        }
      );
  
      if (response.data && response.data.type) {
        console.log(response.data);
        return response.data.type; // Return only the sentiment type ('positive', 'neutral', 'negative')
      } else {
        throw new Error('Sentiment analysis failed');
      }
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      return 'error'; // Default to 'error' if sentiment analysis fails
    }
  };

  const handleSummarize = async () => {
    const textToSummarize = messages.join(' '); // Combine all messages into a single string
    const apiUrl = 'https://article-extractor-and-summarizer.p.rapidapi.com/summarize-text';
    const payload = JSON.stringify({ lang: 'en', text: textToSummarize });
    
    const headers = {
      'x-rapidapi-key': 'efc50c7e9amsh2fba9aea7f15f21p15c0dcjsn05ab783b6cba', // Use your RapidAPI key here
      'x-rapidapi-host': 'article-extractor-and-summarizer.p.rapidapi.com',
      'Content-Type': 'application/json',
    };

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: headers,
        body: payload,
      });

      if (!response.ok) {
        throw new Error('Failed to summarize text');
      }

      const result = await response.json();
      setSummary(result.summary); // Assuming the summary is in the result.summary
    } catch (error) {
      console.error('Error summarizing messages:', error);
    }
  };


  useEffect(() => {
    fetchMessages(); // Fetch messages initially

    const intervalId = setInterval(fetchMessages, 20000); // Poll every 20 seconds

    return () => {
      clearInterval(intervalId); // Clean up interval on component unmount
    };
  }, [transactionId, selectedLanguage]); // Add selectedLanguage to dependencies

  return (
    <main className="flex flex-col items-center justify-center min-h-screen py-20">
      <Header />
      <h1 className="text-3xl font-bold">Transaction ID: {transactionId}</h1>
      <div className="mt-4 max-w-lg w-full bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-4 py-2 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold">Chat Messages</h2>
        <button
          type="button"
          className="border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors duration-150 ease-in-out rounded px-4 py-2"
          onClick={() => handleSolveClick(transactionId)}
        >
          Solve
        </button>
      </div>
        <div className="p-4">
          {loading ? (
            <p>Loading messages...</p>
          ) : (
            translatedMessages.map((msg, index) => (
              <div key={index} className="mb-2">
                <p className="text-gray-800">{msg}</p>
              </div>
            ))
          )}
        </div>
        <div className="mt-4 w-full max-w-lg">
        <Select
          value={selectedLanguage}
          onValueChange={setSelectedLanguage}
        >
          <SelectTrigger aria-label="Language Selector">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Select Language</SelectLabel>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="id">Indonesian</SelectItem>
              <SelectItem value="it">Italian</SelectItem>
              {/* Add more languages as needed */}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      </div>
      <div className="mt-4 w-full max-w-lg flex items-center justify-between">
        <p>Overall Sentiment: <strong>{overallSentiment}</strong></p>
        <button
          className="flex-shrink-0 bg-transparent border-2 border-teal-500 text-teal-500 hover:bg-teal-500 hover:text-white text-sm py-1 px-4 rounded"
          onClick={handleSummarize}
        >
          Summarize
        </button>
      </div>
      {summary && (
        <div className="mt-4 max-w-lg w-full bg-white shadow-md rounded-lg overflow-hidden p-4">
          <h2 className="text-lg font-semibold">Summary</h2>
          <p>{summary}</p>
        </div>
      )}
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
