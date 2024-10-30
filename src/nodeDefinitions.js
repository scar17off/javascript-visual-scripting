export const nodeTypes = {
  OnStart: {
    color: '#4CAF50',
    inputs: [],
    outputs: [{ 
      type: 'control', 
      name: 'Next',
      description: 'Triggered when the script begins execution'
    }],
    description: 'Triggered when the script starts'
  },
  Log: {
    color: '#FF5722',
    inputs: [
      { 
        type: 'control', 
        name: 'In',
        description: 'Triggers the log operation'
      },
      { 
        type: 'data', 
        name: 'Message',
        description: 'The message to be logged'
      }
    ],
    outputs: [{ 
      type: 'control', 
      name: 'Out',
      description: 'Triggered after the message is logged'
    }],
    description: 'Logs a message to the console',
    properties: [
      { name: 'message', type: 'string', default: '' },
      { name: 'logType', type: 'select', options: ['log', 'error', 'warn', 'info'], default: 'log' }
    ]
  },
  Variable: {
    color: '#795548',
    inputs: [
      { type: 'control', name: 'In' },
      { type: 'data', name: 'Set' }
    ],
    outputs: [
      { type: 'control', name: 'Out' },
      { type: 'data', name: 'Get' }
    ],
    description: 'Stores and retrieves a value',
    properties: [
      { name: 'name', type: 'string', default: 'myVariable' },
      { name: 'type', type: 'select', options: ['string', 'number', 'boolean', 'object', 'array'], default: 'string' },
      { name: 'initialValue', type: 'string', default: '' }
    ]
  },
  Function: {
    color: '#607D8B',
    inputs: [
      { type: 'control', name: 'In' },
      { 
        type: 'data', 
        name: 'param1',
        description: 'Parameter of type string'
      }
    ],
    outputs: [
      { type: 'control', name: 'Out' },
      { type: 'data', name: 'Return' }
    ],
    description: 'Defines a reusable function',
    properties: [
      { name: 'name', type: 'string', default: 'myFunction' },
      { 
        name: 'parameters', 
        type: 'array', 
        default: [
          { name: 'param1', type: 'string' }
        ],
        visible: true
      },
      {
        name: 'returnType',
        type: 'select',
        options: ['void', 'string', 'number', 'boolean', 'object', 'array'],
        default: 'void',
        visible: true
      }
    ]
  },
  MathOperation: {
    color: '#9C27B0',
    inputs: [
      { type: 'control', name: 'In' },
      { type: 'data', name: 'A' },
      { type: 'data', name: 'B' }
    ],
    outputs: [
      { type: 'control', name: 'Out' },
      { type: 'data', name: 'Result' }
    ],
    description: 'Performs a mathematical operation',
    properties: [
      { name: 'operation', type: 'select', options: ['+', '-', '*', '/', '%', '**'], default: '+' }
    ]
  },
  Condition: {
    color: '#00BCD4',
    inputs: [
      { type: 'control', name: 'In' },
      { type: 'data', name: 'Condition' }
    ],
    outputs: [
      { type: 'control', name: 'True' },
      { type: 'control', name: 'False' }
    ],
    description: 'Branches based on a condition',
    properties: [
      { name: 'condition', type: 'string', default: '' }
    ]
  },
  WhileLoop: {
    color: '#2196F3',
    inputs: [
      { type: 'control', name: 'In' },
      { type: 'data', name: 'Condition' }
    ],
    outputs: [
      { type: 'control', name: 'Loop' },
      { type: 'control', name: 'Out' }
    ],
    description: 'Repeats a set of instructions while a condition is true',
    properties: [
      { name: 'condition', type: 'string', default: 'true' }
    ]
  },
  ForLoop: {
    color: '#2196F3',
    inputs: [{ type: 'control', name: 'In' }],
    outputs: [
      { type: 'control', name: 'Loop' },
      { type: 'control', name: 'Out' }
    ],
    description: 'Repeats a set of instructions for a specified number of times',
    properties: [
      { name: 'start', type: 'number', default: 0 },
      { name: 'end', type: 'number', default: 10 },
      { name: 'step', type: 'number', default: 1 }
    ]
  },
  ArrayOperation: {
    color: '#FF9800',
    inputs: [
      { type: 'control', name: 'In' },
      { type: 'data', name: 'Array' }
    ],
    outputs: [
      { type: 'control', name: 'Out' },
      { type: 'data', name: 'Result' }
    ],
    description: 'Performs operations on arrays',
    properties: [
      { name: 'operation', type: 'select', options: ['push', 'pop', 'shift', 'unshift', 'slice', 'map', 'filter', 'reduce'], default: 'push' },
      { name: 'argument', type: 'string', default: '' }
    ]
  },
  ObjectOperation: {
    color: '#9E9E9E',
    inputs: [
      { type: 'control', name: 'In' },
      { type: 'data', name: 'Object' }
    ],
    outputs: [
      { type: 'control', name: 'Out' },
      { type: 'data', name: 'Result' }
    ],
    description: 'Performs operations on objects',
    properties: [
      { name: 'operation', type: 'select', options: ['get', 'set', 'delete', 'has'], default: 'get' },
      { name: 'key', type: 'string', default: '' },
      { name: 'value', type: 'string', default: '' }
    ]
  },
  HttpRequest: {
    color: '#E91E63',
    inputs: [{ type: 'control', name: 'In' }],
    outputs: [
      { type: 'control', name: 'Out' },
      { type: 'data', name: 'Response Body' },
      { type: 'data', name: 'Status Code' },
      { type: 'data', name: 'Headers' },
    ],
    description: 'Sends an HTTP request',
    properties: [
      { name: 'url', type: 'string', default: '' },
      { name: 'method', type: 'select', options: ['GET', 'POST', 'PUT', 'DELETE'], default: 'GET' },
      { name: 'headers', type: 'string', default: '{}' },
      { name: 'body', type: 'string', default: '' }
    ]
  },
  JSONParse: {
    color: '#4CAF50',
    inputs: [
      { type: 'control', name: 'In' },
      { type: 'data', name: 'JSON String' }
    ],
    outputs: [
      { type: 'control', name: 'Out' },
      { type: 'data', name: 'Parsed Object' }
    ],
    description: 'Parses a JSON string into an object',
    properties: []
  },
  JSONStringify: {
    color: '#4CAF50',
    inputs: [
      { type: 'control', name: 'In' },
      { type: 'data', name: 'Object' }
    ],
    outputs: [
      { type: 'control', name: 'Out' },
      { type: 'data', name: 'JSON String' }
    ],
    description: 'Converts an object to a JSON string',
    properties: [
      { name: 'space', type: 'number', default: 0 }
    ]
  },
  Base64Encode: {
    color: '#9C27B0',
    inputs: [
      { type: 'control', name: 'In' },
      { type: 'data', name: 'Input' }
    ],
    outputs: [
      { type: 'control', name: 'Out' },
      { type: 'data', name: 'Encoded' }
    ],
    description: 'Encodes a string to Base64',
    properties: []
  },
  Base64Decode: {
    color: '#9C27B0',
    inputs: [
      { type: 'control', name: 'In' },
      { type: 'data', name: 'Encoded' }
    ],
    outputs: [
      { type: 'control', name: 'Out' },
      { type: 'data', name: 'Decoded' }
    ],
    description: 'Decodes a Base64 string',
    properties: []
  },
  If: {
    color: '#00BCD4',
    inputs: [
      { type: 'control', name: 'In' },
      { type: 'data', name: 'A' },
      { type: 'data', name: 'B' }
    ],
    outputs: [
      { type: 'control', name: 'True' },
      { type: 'control', name: 'False' }
    ],
    description: 'Compares two values and branches based on the condition',
    properties: [
      { name: 'operator', type: 'select', options: ['==', '===', '!=', '!==', '>', '<', '>=', '<='], default: '==' }
    ]
  },
  Random: {
    color: '#9C27B0',
    inputs: [
      { type: 'control', name: 'In' }
    ],
    outputs: [
      { type: 'control', name: 'Out' },
      { type: 'data', name: 'Result' }
    ],
    description: 'Generates random values of different types',
    properties: [
      {
        name: 'type',
        type: 'select',
        options: ['number', 'string', 'boolean'],
        default: 'number',
        visible: true
      },
      {
        name: 'min',
        type: 'number',
        default: 1,
        visible: (props) => props.type === 'number'
      },
      {
        name: 'max',
        type: 'number',
        default: 100,
        visible: (props) => props.type === 'number'
      },
      {
        name: 'length',
        type: 'number',
        default: 10,
        visible: (props) => props.type === 'string'
      },
      {
        name: 'charset',
        type: 'string',
        default: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
        visible: (props) => props.type === 'string'
      },
      {
        name: 'probability',
        type: 'number',
        default: 50,
        visible: (props) => props.type === 'boolean'
      }
    ]
  },
  Switch: {
    color: '#FF9800',
    inputs: [
      { 
        type: 'control', 
        name: 'In',
        description: 'Triggers the switch evaluation'
      },
      { 
        type: 'data', 
        name: 'Value',
        description: 'The value to switch on'
      }
    ],
    outputs: [
      { 
        type: 'control', 
        name: 'Default',
        description: 'Triggered if no cases match'
      }
    ],
    description: 'Branches based on matching cases',
    properties: [
      { 
        name: 'cases', 
        type: 'array', 
        default: [
          { value: '', type: 'string', output: 'Case 1' }
        ],
        visible: true
      },
      {
        name: 'ignoreCase',
        type: 'boolean',
        default: false,
        visible: true
      }
    ]
  }
};

export const nodeGroups = {
  "Control Flow": ["OnStart", "If", "Condition", "WhileLoop", "ForLoop", "Switch"],
  "Data Manipulation": ["Variable", "MathOperation", "ArrayOperation", "ObjectOperation", "JSONParse", "JSONStringify", "Random"],
  "Functions": ["Function"],
  "Input/Output": ["Log", "HttpRequest"],
  "Encoding": ["Base64Encode", "Base64Decode"]
};