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
  },
  example4: {
    nodes: [
      { id: 1, type: 'OnStart', x: 100, y: 100, properties: {} },
      { id: 2, type: 'Random', x: 350, y: 100, properties: { min: '1', max: '100', type: 'number', probability: '50', charset: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', length: '10' } },
      { id: 3, type: 'Variable', x: 600, y: 100, properties: { name: 'randomNum', type: 'number', initialValue: '0' } },
      { id: 4, type: 'Log', x: 850, y: 100, properties: { message: '', logType: 'log' } },
    ],
    edges: [
      { start: { nodeId: 1, isInput: false, index: 0 }, end: { nodeId: 2, isInput: true, index: 0 } },
      { start: { nodeId: 2, isInput: false, index: 0 }, end: { nodeId: 3, isInput: true, index: 0 } },
      { start: { nodeId: 3, isInput: false, index: 1 }, end: { nodeId: 4, isInput: true, index: 0 } },
    ]
  },
  example5: {
    nodes: [
      { id: 1, type: 'OnStart', x: 100, y: 100, properties: {} },
      { id: 2, type: 'Variable', x: 350, y: 100, properties: { name: 'a', type: 'number', initialValue: '5' } },
      {
        id: 4, type: 'Switch', x: 600, y: 100, properties: {
          cases: [
            { value: '5', output: 'Case 1' },
            { value: '3', output: 'Case 2' }
          ], ignoreCase: false
        }
      },
      { id: 5, type: 'Log', x: 850, y: 25, properties: { message: 'Value is 5', logType: 'log' } },
      { id: 6, type: 'Log', x: 850, y: 100, properties: { message: 'Value is 3', logType: 'log' } },
      { id: 7, type: 'Log', x: 850, y: 175, properties: { message: 'No match', logType: 'log' } }
    ],
    edges: [
      { start: { nodeId: 1, isInput: false, index: 0 }, end: { nodeId: 2, isInput: true, index: 0 } },
      { start: { nodeId: 2, isInput: false, index: 0 }, end: { nodeId: 4, isInput: true, index: 0 } },
      { start: { nodeId: 2, isInput: false, index: 1 }, end: { nodeId: 4, isInput: true, index: 1 } },
      { start: { nodeId: 4, isInput: false, index: 0 }, end: { nodeId: 5, isInput: true, index: 0 } },
      { start: { nodeId: 4, isInput: false, index: 1 }, end: { nodeId: 6, isInput: true, index: 0 } },
      { start: { nodeId: 4, isInput: false, index: 2 }, end: { nodeId: 7, isInput: true, index: 0 } }
    ]
  }
};

export default examples;