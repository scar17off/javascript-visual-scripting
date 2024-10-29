const examples = {
  example1: {
    nodes: [
      { id: 1, type: 'OnStart', x: 100, y: 100, properties: {} },
      { id: 2, type: 'Log', x: 350, y: 100, properties: { message: 'Hello, World!', logType: 'log' } },
    ],
    edges: [
      { start: { nodeId: 1, isInput: false, index: 0 }, end: { nodeId: 2, isInput: true, index: 0 } },
    ]
  },
  example2: {
    nodes: [
      { id: 1, type: 'OnStart', x: 100, y: 100, properties: {} },
      { id: 2, type: 'Variable', x: 350, y: 50, properties: { name: 'a', type: 'number', initialValue: '5' } },
      { id: 3, type: 'Variable', x: 350, y: 200, properties: { name: 'b', type: 'number', initialValue: '3' } },
      { id: 4, type: 'MathOperation', x: 600, y: 125, properties: { operation: '+' } },
      { id: 5, type: 'Log', x: 850, y: 125, properties: { message: '', logType: 'log' } },
    ],
    edges: [
      { start: { nodeId: 1, isInput: false, index: 0 }, end: { nodeId: 2, isInput: true, index: 0 } },
      { start: { nodeId: 2, isInput: false, index: 0 }, end: { nodeId: 3, isInput: true, index: 0 } },
      { start: { nodeId: 2, isInput: false, index: 1 }, end: { nodeId: 4, isInput: true, index: 1 } },
      { start: { nodeId: 3, isInput: false, index: 1 }, end: { nodeId: 4, isInput: true, index: 2 } },
      { start: { nodeId: 3, isInput: false, index: 0 }, end: { nodeId: 4, isInput: true, index: 0 } },
      { start: { nodeId: 4, isInput: false, index: 0 }, end: { nodeId: 5, isInput: true, index: 0 } },
      { start: { nodeId: 4, isInput: false, index: 1 }, end: { nodeId: 5, isInput: true, index: 1 } },
    ]
  },
  example3: {
    // If node example
    nodes: [
      { id: 1, type: 'OnStart', x: 100, y: 100, properties: {} },
      { id: 2, type: 'Variable', x: 350, y: 50, properties: { name: 'a', type: 'number', initialValue: '5' } },
      { id: 3, type: 'Variable', x: 350, y: 200, properties: { name: 'b', type: 'number', initialValue: '3' } },
      { id: 4, type: 'If', x: 600, y: 100, properties: { operator: '==' } },
      { id: 5, type: 'Log', x: 850, y: 50, properties: { message: 'It is equal', logType: 'log' } },
      { id: 6, type: 'Log', x: 850, y: 200, properties: { message: 'It is not equal', logType: 'log' } },
    ],
    edges: [
      { start: { nodeId: 1, isInput: false, index: 0 }, end: { nodeId: 4, isInput: true, index: 0 } },
      { start: { nodeId: 2, isInput: false, index: 1 }, end: { nodeId: 4, isInput: true, index: 1 } },
      { start: { nodeId: 3, isInput: false, index: 1 }, end: { nodeId: 4, isInput: true, index: 2 } },
      { start: { nodeId: 4, isInput: false, index: 0 }, end: { nodeId: 5, isInput: true, index: 0 } },
      { start: { nodeId: 4, isInput: false, index: 1 }, end: { nodeId: 6, isInput: true, index: 0 } }
    ]
  }
};

export default examples;