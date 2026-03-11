const WebSocket = require('ws');
const http = require('http');

const PORT = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Kanban WebSocket Server');
});

const wss = new WebSocket.Server({ server });

const { randomUUID } = require('crypto');

function generateId() {
  return randomUUID();
}

let boardState = {
  // NOTE: Board state is in-memory only and will reset on server restart.
  columns: [
    {
      id: '1',
      title: 'To Do',
      cards: [
        { id: generateId(), title: 'Design wireframes', description: 'Create initial UI wireframes for the project' },
        { id: generateId(), title: 'Set up repository', description: 'Initialize git repository and CI/CD pipeline' },
      ],
    },
    {
      id: '2',
      title: 'In Progress',
      cards: [
        { id: generateId(), title: 'Build Kanban board', description: 'Implement WebSocket-based Kanban board in Angular' },
      ],
    },
    {
      id: '3',
      title: 'Done',
      cards: [
        { id: generateId(), title: 'Project kickoff', description: 'Initial project planning and team alignment' },
      ],
    },
  ],
};

function broadcast(data) {
  const message = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.send(JSON.stringify({ type: 'BOARD_STATE', payload: boardState }));

  ws.on('message', (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch {
      console.error('Invalid JSON received');
      return;
    }

    switch (msg.type) {
      case 'ADD_CARD': {
        const { columnId, title, description } = msg.payload;
        const column = boardState.columns.find((c) => c.id === columnId);
        if (column && title) {
          const card = { id: generateId(), title, description: description || '' };
          column.cards.push(card);
          broadcast({ type: 'BOARD_STATE', payload: boardState });
        }
        break;
      }

      case 'MOVE_CARD': {
        const { cardId, sourceColumnId, targetColumnId, targetIndex } = msg.payload;
        const sourceCol = boardState.columns.find((c) => c.id === sourceColumnId);
        const targetCol = boardState.columns.find((c) => c.id === targetColumnId);
        if (sourceCol && targetCol) {
          const cardIndex = sourceCol.cards.findIndex((c) => c.id === cardId);
          if (cardIndex !== -1) {
            const [card] = sourceCol.cards.splice(cardIndex, 1);
            const clampedIndex = Math.min(targetIndex, targetCol.cards.length);
            targetCol.cards.splice(clampedIndex, 0, card);
            broadcast({ type: 'BOARD_STATE', payload: boardState });
          }
        }
        break;
      }

      case 'DELETE_CARD': {
        const { cardId } = msg.payload;
        boardState.columns.forEach((col) => {
          col.cards = col.cards.filter((c) => c.id !== cardId);
        });
        broadcast({ type: 'BOARD_STATE', payload: boardState });
        break;
      }

      case 'UPDATE_CARD': {
        const { cardId, title, description } = msg.payload;
        for (const col of boardState.columns) {
          const card = col.cards.find((c) => c.id === cardId);
          if (card) {
            if (title !== undefined) card.title = title;
            if (description !== undefined) card.description = description;
            broadcast({ type: 'BOARD_STATE', payload: boardState });
            break;
          }
        }
        break;
      }

      case 'ADD_COLUMN': {
        const { title } = msg.payload;
        if (title) {
          boardState.columns.push({ id: generateId(), title, cards: [] });
          broadcast({ type: 'BOARD_STATE', payload: boardState });
        }
        break;
      }

      case 'DELETE_COLUMN': {
        const { columnId } = msg.payload;
        boardState.columns = boardState.columns.filter((c) => c.id !== columnId);
        broadcast({ type: 'BOARD_STATE', payload: boardState });
        break;
      }

      default:
        console.warn('Unknown message type:', msg.type);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Kanban WebSocket server listening on port ${PORT}`);
});
