import React, { useCallback, useEffect, useState } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'quill/dist/quill.snow.css';
import '../TextEditor/style.css';
import { useParams, useLocation } from 'react-router-dom';
import Fab from '../FAB';
import { FcAbout, FcBusinessman, FcCamera, FcFullTrash } from 'react-icons/fc';
import { initSocket } from '../../socket';


const SAVE_INTERVAL_MS = 5000;

const modules = {
  toolbar: [
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    [{ header: 1 }, { header: 2 }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ script: 'sub' }, { script: 'super' }],
    [{ indent: '-1' }, { indent: '+1' }],
    [{ direction: 'rtl' }],
    [{ size: ['small', false, 'large', 'huge'] }],
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ color: [] }, { background: [] }],
    [{ font: [] }],
    [{ align: [] }],
    ['clean'],
  ],
};

export default function TextEditor() {
  const [socket, setSocket] = useState(null);
  const [quill, setQuill] = useState(null);
  const { id: documentId } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const documentName = queryParams.get('name');
  const [token, setToken] = useState('');
  const [connectedClients, setConnectedClients] = useState([]);

  useEffect(() => {
    const storedToken = localStorage.getItem('jwtToken');
    setToken(storedToken);

    // Initialize the socket using initSocket function
    const initSocketConnection = async () => {
      const s = await initSocket(); // Use the initSocket function from your socket.js
      setSocket(s);

      s.on('connected-clients', (clients) => {
        setConnectedClients(clients);
      });

      return s;
    };

    initSocketConnection();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (socket == null || quill == null) return;

    socket.once('load-document', (document) => {
      quill.setContents(document);
      quill.enable();
    });

    socket.emit('get-document', documentId, documentName);
  }, [socket, quill, documentId, documentName]);

  useEffect(() => {
    if (socket == null || quill == null) return;

    const interval = setInterval(() => {
      socket.emit('save-document', quill.getContents());
    }, SAVE_INTERVAL_MS);

    return () => {
      clearInterval(interval);
    };
  }, [socket, quill]);

  useEffect(() => {
    if (socket == null || quill == null) return;

    const handler = (delta) => {
      quill.updateContents(delta);
    };
    socket.on('receive-changes', handler);

    return () => {
      socket.off('receive-changes', handler);
    };
  }, [socket, quill]);

  useEffect(() => {
    if (socket == null || quill == null) return;

    const handler = (delta, oldDelta, source) => {
      if (source !== 'user') return;
      socket.emit('send-changes', delta);
    };
    quill.on('text-change', handler);

    return () => {
      quill.off('text-change', handler);
    };
  }, [socket, quill]);

  useEffect(() => {
    // Fetch the document content on page load/refresh
    fetch(`/documents/${documentId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.document) {
          quill.setContents(data.document.data); // Update your Quill editor with the fetched content
        }
      })
      .catch((error) => {
        console.error('Error fetching document:', error);
      });
  }, [documentId, quill]);

  const Abc = () => {
    window.print();
  };

  const def = () => {
    const printing = quill.getContents();
    console.log(printing);
  };

  const ghi = () => {
    const bucketName = localStorage.getItem('jwtToken');
    socket.emit('bucket-creation', bucketName);
  };

  const actions = [
    { label: 'About', icon: <FcAbout />, onClick: Abc },
    { label: 'Profile', icon: <FcBusinessman />, onClick: def },
    { label: 'Picture', icon: <FcCamera />, onClick: ghi },
    { label: 'Trash', icon: <FcFullTrash />, onClick: console.log },
  ];

  const wrapperRef = useCallback((wrapper) => {
    if (wrapper == null) return;

    wrapper.innerHTML = '';
    const editor = document.createElement('div');
    wrapper.append(editor);
    const q = new Quill(editor, { theme: 'snow', modules: modules });
    q.disable();
    q.setText('Loading...');

    // Generate a random color and set it as the cursor color
    const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
    q.format('color', randomColor);

    setQuill(q);
  }, []);

  return (
    <>
      <h2>Connected Clients:</h2>
      <ul>
        {connectedClients.map((clientName) => (
          <li key={clientName}>{clientName}</li>
        ))}
      </ul>
      <div className="container" ref={wrapperRef}></div>
      <Fab actions={actions} />
    </>
  );
}
