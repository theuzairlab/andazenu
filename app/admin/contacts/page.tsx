'use client';

import { useState, useEffect } from 'react';
import { Mail, CheckCircle, ArchiveIcon, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';

type Contact = {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: 'NEW' | 'REPLIED' | 'ARCHIVED';
  reply?: string;
  createdAt: string;
};

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'NEW' | 'REPLIED' | 'ARCHIVED'>('NEW');
  const [page, setPage] = useState(1);
  const [totalContacts, setTotalContacts] = useState(0);

  // Fetch contacts
  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/contact?status=${filter}&page=${page}&limit=10`);
      const data = await response.json();

      setContacts(data.contacts);
      setTotalContacts(data.total);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  // Fetch contacts when filter or page changes
  useEffect(() => {
    fetchContacts();
  }, [filter, page]);

  // Handle reply submission
  const handleReplySubmit = async () => {
    if (!selectedContact || !replyMessage.trim()) {
      toast.error('Please enter a reply message');
      return;
    }

    try {
      const response = await fetch(`/api/contact/${selectedContact.id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reply: replyMessage }),
      });

      if (response.ok) {
        toast.success('Reply sent successfully');
        // Update contact status and clear selected contact
        setSelectedContact(null);
        setReplyMessage('');
        // Refresh contacts
        fetchContacts();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to send reply');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('An error occurred while sending the reply');
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <Mail className="mr-3" /> Customer Messages
      </h1>

      {/* Filter Tabs */}
      <div className="flex mb-6 border-b">
        {(['NEW', 'REPLIED', 'ARCHIVED'] as const).map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 flex items-center ${
              filter === status ? 'border-b-2 border-black font-semibold' : 'text-gray-500'
            }`}
          >
            {status === 'NEW' && <RefreshCw className="mr-2 h-4 w-4" />}
            {status === 'REPLIED' && <CheckCircle className="mr-2 h-4 w-4" />}
            {status === 'ARCHIVED' && <ArchiveIcon className="mr-2 h-4 w-4" />}
            {status} Messages
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Contact List */}
        <div className="md:col-span-1 bg-white shadow rounded-lg overflow-hidden">
          {loading ? (
            <div className="text-center py-10">
              <RefreshCw className="mx-auto animate-spin h-8 w-8 text-gray-500" />
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-10 text-gray-500">No messages found</div>
          ) : (
            <div className="divide-y">
              {contacts.map(contact => (
                <button
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                    selectedContact?.id === contact.id ? 'bg-gray-100' : ''
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{contact.name}</h3>
                      <p className="text-sm text-gray-500 truncate max-w-[200px]">
                        {contact.email}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">{formatDate(contact.createdAt)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalContacts > 10 && (
            <div className="flex justify-between p-4 border-t">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-100 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={contacts.length < 10}
                className="px-4 py-2 bg-gray-100 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Contact Details and Reply */}
        <div className="md:col-span-2 bg-white shadow rounded-lg p-6">
          {selectedContact ? (
            <div>
              <div className="border-b pb-4 mb-4">
                <h2 className="text-xl font-bold">{selectedContact.name}</h2>
                <p className="text-gray-600">{selectedContact.email}</p>
                <p className="text-gray-600">{selectedContact.phone}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Received: {formatDate(selectedContact.createdAt)}
                </p>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-2">Message:</h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded">{selectedContact.message}</p>
              </div>

              {selectedContact.reply && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Your Reply:</h3>
                  <p className="text-gray-700 bg-green-50 p-4 rounded">{selectedContact.reply}</p>
                </div>
              )}

              {selectedContact.status !== 'REPLIED' && (
                <div>
                  <h3 className="font-semibold mb-2">Reply to Message:</h3>
                  <textarea
                    value={replyMessage}
                    onChange={e => setReplyMessage(e.target.value)}
                    rows={5}
                    className="w-full border rounded p-3 mb-4"
                    placeholder="Write your reply here..."
                  ></textarea>
                  <button
                    onClick={handleReplySubmit}
                    disabled={!replyMessage.trim()}
                    className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
                  >
                    Send Reply
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-10">Select a message to view details</div>
          )}
        </div>
      </div>
    </div>
  );
}
