class CodeGenerator {
  constructor(nodes, edges, settings) {
    this.nodes = nodes;
    this.edges = edges;
    this.settings = settings;
    this.code = '';
    this.indentLevel = 0;
    this.hasAsyncOperations = false;
    this.variables = new Map();
    this.nodeOutputs = new Map();
    this.processedNodes = new Set();
  }

  generate() {
    this.code = '';
    if (this.settings.useStrict) {
      this.addLine('"use strict";');
      this.addLine();
    }
    this.generateImports();
    this.generateVariableDeclarations();
    this.generateMainFunction();
    return this.code;
  }

  generateImports() {
    this.addLine("// Imports would go here");
    this.addLine();
  }

  generateVariableDeclarations() {
    const declaredVariables = new Set();
    this.nodes.forEach(node => {
      if (node.type === 'Variable') {
        const { name, type, initialValue } = node.properties;
        if (name && type && !declaredVariables.has(name)) {
          let declaration = `${this.settings.useConst ? 'const' : 'let'} ${name}`;
          if (initialValue !== undefined && initialValue !== '') {
            declaration += ` = ${this.getTypedValue(type, initialValue)}`;
          }
          this.addLine(declaration);
          this.variables.set(name, type);
          declaredVariables.add(name);
        }
      }
    });
    if (declaredVariables.size > 0) {
      this.addLine();
    }
  }

  generateMainFunction() {
    this.hasAsyncOperations = this.nodes.some(node => node.type === 'HttpRequest' || node.type === 'WaitForSeconds');
    const asyncKeyword = this.hasAsyncOperations ? 'async ' : '';
    this.addLine(`${asyncKeyword}function main() {`);
    this.indentLevel++;

    const startNodes = this.nodes.filter(node => node.type === 'OnStart');
    startNodes.forEach(startNode => {
      this.processedNodes.clear();
      this.generateNodeCodeSequence(startNode);
    });

    this.indentLevel--;
    this.addLine("}");
    this.addLine();
    this.addLine("main();");
  }

  generateNodeCodeSequence(node) {
    if (this.processedNodes.has(node.id)) {
      return;
    }
    this.processedNodes.add(node.id);

    this.generateNodeCode(node);

    // Find and generate code for all connected nodes
    const connectedEdges = this.edges.filter(edge => edge.start.nodeId === node.id);
    connectedEdges.forEach(edge => {
      const nextNode = this.nodes.find(n => n.id === edge.end.nodeId);
      if (nextNode) {
        this.generateNodeCodeSequence(nextNode);
      }
    });
  }

  generateNodeCode(node) {
    if (this.settings.generateComments) {
      this.addLine(`// Processing ${node.type} node`);
    }

    switch (node.type) {
      case 'OnStart':
        // OnStart doesn't generate code, it's just a starting point
        break;
      case 'Log':
        this.handleLogNode(node);
        break;
      case 'Variable':
        this.handleVariableNode(node);
        break;
      case 'MathOperation':
        this.handleMathOperationNode(node);
        break;
      case 'Condition':
        this.addLine(`if (${node.properties.condition || 'true'}) {`);
        this.indentLevel++;
        // TODO: Generate code for true branch
        this.indentLevel--;
        this.addLine("} else {");
        this.indentLevel++;
        // TODO: Generate code for false branch
        this.indentLevel--;
        this.addLine("}");
        break;
      case 'WhileLoop':
        this.addLine(`while (${node.properties.condition || 'true'}) {`);
        this.indentLevel++;
        // TODO: Generate code for loop body
        this.indentLevel--;
        this.addLine("}");
        break;
      case 'ForLoop':
        this.addLine(`for (let i = 0; i < ${node.properties.iterations || 10}; i++) {`);
        this.indentLevel++;
        // TODO: Generate code for loop body
        this.indentLevel--;
        this.addLine("}");
        break;
      case 'HttpRequest':
        this.generateHttpRequestCode(node);
        break;
      case 'JSONParse':
        this.handleJSONParseNode(node);
        break;
      case 'JSONStringify':
        this.handleJSONStringifyNode(node);
        break;
      case 'Base64Encode':
        this.handleBase64EncodeNode(node);
        break;
      case 'Base64Decode':
        this.handleBase64DecodeNode(node);
        break;
      default:
        this.addLine(`// TODO: Implement ${node.type}`);
    }

    if (this.settings.generateComments) {
      this.addLine(`// Finished processing ${node.type} node`);
      this.addLine();
    }
  }

  findNextControlNode(node) {
    const controlEdge = this.edges.find(edge => 
      edge.start.nodeId === node.id && 
      edge.start.isInput === false && 
      edge.start.type === 'control'
    );
    if (controlEdge) {
      return this.nodes.find(n => n.id === controlEdge.end.nodeId);
    }
    return null;
  }

  handleLogNode(node) {
    const message = this.getNodeInputValue(node, 1);
    if (message !== undefined) {
      this.addLine(`console.${node.properties.logType || 'log'}(${message})`);
    } else if (node.properties.message) {
      this.addLine(`console.${node.properties.logType || 'log'}(${JSON.stringify(node.properties.message)})`);
    } else {
      this.addLine(`console.${node.properties.logType || 'log'}("Empty log message")`);
    }
  }

  handleVariableNode(node) {
    const { name } = node.properties;
    const inputValue = this.getNodeInputValue(node, 1);
    if (inputValue !== undefined && inputValue !== name) {
      this.addLine(`${name} = ${inputValue};`);
    }
    this.nodeOutputs.set(node.id, name);
  }

  handleMathOperationNode(node) {
    const { operation } = node.properties;
    const inputA = this.getNodeInputValue(node, 1);
    const inputB = this.getNodeInputValue(node, 2);
    
    if (inputA !== undefined && inputB !== undefined) {
      const result = `(${inputA} ${operation} ${inputB})`;
      this.nodeOutputs.set(node.id, result);
      
      // Find the connected Variable node and update it
      const outputEdge = this.edges.find(edge => edge.start.nodeId === node.id && edge.start.index === 1);
      if (outputEdge) {
        const targetNode = this.nodes.find(n => n.id === outputEdge.end.nodeId);
        if (targetNode && targetNode.type === 'Variable') {
          this.addLine(`${targetNode.properties.name} = ${result};`);
        }
      }
    }
  }

  getNodeInputValue(node, inputIndex) {
    const inputEdge = this.edges.find(edge => edge.end.nodeId === node.id && edge.end.index === inputIndex);
    if (inputEdge) {
      const sourceNode = this.nodes.find(n => n.id === inputEdge.start.nodeId);
      if (sourceNode) {
        if (sourceNode.type === 'Variable') {
          return sourceNode.properties.name;
        }
        return this.nodeOutputs.get(sourceNode.id) || sourceNode.properties.initialValue;
      }
    }
    return undefined;
  }

  generateHttpRequestCode(node) {
    const { url, method, headers, body } = node.properties;
    let headersObj;
    try {
      headersObj = JSON.parse(headers);
    } catch (e) {
      headersObj = {};
    }

    this.addLine(`try {`);
    this.indentLevel++;
    this.addLine(`const response = await fetch(${JSON.stringify(url)}, {`);
    this.indentLevel++;
    this.addLine(`method: ${JSON.stringify(method)},`);
    this.addLine(`headers: ${JSON.stringify(headersObj)},`);
    if (method !== 'GET' && body) {
      this.addLine(`body: ${JSON.stringify(body)},`);
    }
    this.indentLevel--;
    this.addLine(`});`);
    
    this.addLine(`const responseBody = await response.text();`);
    this.addLine(`const statusCode = response.status;`);
    this.addLine(`const responseHeaders = Object.fromEntries(response.headers.entries());`);
    
    // Store the outputs
    this.nodeOutputs.set(node.id, {
      'Response Body': 'responseBody',
      'Status Code': 'statusCode',
      'Headers': 'responseHeaders'
    });

    this.addLine(`console.log('Response body:', responseBody);`);
    this.addLine(`console.log('Status code:', statusCode);`);
    this.addLine(`console.log('Response headers:', responseHeaders);`);
    
    this.indentLevel--;
    this.addLine(`} catch (error) {`);
    this.indentLevel++;
    this.addLine(`console.error('HTTP Request failed:', error);`);
    this.indentLevel--;
    this.addLine(`}`);
  }

  async executeHttpRequest(node, debug) {
    const { url, method, headers, body } = node.properties;
    let headersObj;
    try {
      headersObj = JSON.parse(headers);
    } catch (e) {
      headersObj = {};
    }

    try {
      const response = await fetch(url, {
        method,
        headers: headersObj,
        body: method !== 'GET' ? body : undefined
      });
      const responseBody = await response.text();
      const statusCode = response.status;
      const responseHeaders = Object.fromEntries(response.headers.entries());

      if (debug) {
        console.log('HTTP Request successful');
        console.log('Response body:', responseBody);
        console.log('Status code:', statusCode);
        console.log('Response headers:', responseHeaders);
      }

      // Store the outputs
      this.nodeOutputs.set(node.id, {
        'Response Body': responseBody,
        'Status Code': statusCode,
        'Headers': responseHeaders
      });

    } catch (error) {
      if (debug) {
        console.error('HTTP Request failed');
        console.error('Error:', error);
      }
    }
  }

  getTypedValue(type, value) {
    switch (type) {
      case 'string':
        return `"${value}"`;
      case 'number':
        return Number(value);
      case 'boolean':
        return value === 'true';
      default:
        return value;
    }
  }

  getVariableOrLiteral(value) {
    if (this.variables.has(value)) {
      return value;
    }
    return JSON.stringify(value);
  }

  addLine(line = '') {
    this.code += '  '.repeat(this.indentLevel) + line + (this.settings.useSemicolons && line !== '' ? ';' : '') + '\n';
  }

  executeNode(node, debug = false) {
    if (debug) {
      console.log(`Executing node: ${node.type} (ID: ${node.id})`);
    }

    switch (node.type) {
      case 'OnStart':
        if (debug) console.log('OnStart node triggered');
        break;
      case 'OnUpdate':
        if (debug) console.log('OnUpdate node triggered');
        break;
      case 'OnKeyboardInput':
        if (debug) console.log('OnKeyboardInput node triggered');
        break;
      case 'OnMouseDown':
        if (debug) console.log('OnMouseDown node triggered');
        break;
      case 'WhileLoop':
        if (debug) console.log('Executing WhileLoop');
        break;
      case 'ForLoop':
        if (debug) console.log('Executing ForLoop');
        break;
      case 'WaitForSeconds':
        if (debug) console.log(`Waiting for ${node.properties.delay || 1} seconds`);
        break;
      case 'Log':
        console.log(node.properties.message);
        break;
      case 'MathOperation':
        if (debug) console.log('Performing MathOperation');
        break;
      case 'Condition':
        if (debug) console.log(`Evaluating condition: ${node.properties.condition || 'true'}`);
        break;
      case 'Variable':
        if (debug) console.log('Processing Variable node');
        break;
      case 'Function':
        if (debug) console.log('Executing Function node');
        break;
      case 'GetComponent':
        if (debug) console.log('Getting component');
        break;
      case 'SetPosition':
        if (debug) console.log('Setting position');
        break;
      case 'GetInput':
        if (debug) console.log('Getting input');
        break;
      case 'HttpRequest':
        if (debug) console.log('Sending HTTP request');
        this.executeHttpRequest(node, debug);
        break;
      case 'JSONParse':
        if (debug) console.log('Parsing JSON');
        this.executeJSONParse(node, debug);
        break;
      case 'JSONStringify':
        if (debug) console.log('Stringifying JSON');
        this.executeJSONStringify(node, debug);
        break;
      case 'Base64Encode':
        if (debug) console.log('Encoding to Base64');
        this.executeBase64Encode(node, debug);
        break;
      case 'Base64Decode':
        if (debug) console.log('Decoding from Base64');
        this.executeBase64Decode(node, debug);
        break;
      default:
        console.warn(`Unknown node type: ${node.type}`);
    }

    // Find and execute connected nodes
    const connectedEdges = this.edges.filter(edge => edge.start.nodeId === node.id);
    connectedEdges.forEach(edge => {
      const nextNode = this.nodes.find(n => n.id === edge.end.nodeId);
      if (nextNode) {
        this.executeNode(nextNode, debug);
      }
    });
  }

  runScript(debug = false) {
    if (debug) {
      console.log('--- Starting script execution (debug mode) ---');
    }
    const startNodes = this.nodes.filter(node => node.type === 'OnStart');
    startNodes.forEach(startNode => this.executeNode(startNode, debug));
    if (debug) {
      console.log('--- Script execution completed ---');
    }
  }

  handleJSONParseNode(node) {
    const input = this.getNodeInputValue(node, 1);
    if (input !== undefined) {
      const outputVar = this.getUniqueVariableName('parsedJSON');
      this.addLine(`let ${outputVar};`);
      this.addLine(`try {`);
      this.indentLevel++;
      this.addLine(`${outputVar} = JSON.parse(${input});`);
      this.indentLevel--;
      this.addLine(`} catch (error) {`);
      this.indentLevel++;
      this.addLine(`console.error('JSON Parse Error:', error);`);
      this.addLine(`${outputVar} = null;`);
      this.indentLevel--;
      this.addLine(`}`);
      this.nodeOutputs.set(node.id, outputVar);
    }
  }

  handleJSONStringifyNode(node) {
    const input = this.getNodeInputValue(node, 1);
    const space = node.properties.space || 0;
    if (input !== undefined) {
      const outputVar = this.getUniqueVariableName('stringifiedJSON');
      this.addLine(`let ${outputVar};`);
      this.addLine(`try {`);
      this.indentLevel++;
      this.addLine(`${outputVar} = JSON.stringify(${input}, null, ${space});`);
      this.indentLevel--;
      this.addLine(`} catch (error) {`);
      this.indentLevel++;
      this.addLine(`console.error('JSON Stringify Error:', error);`);
      this.addLine(`${outputVar} = '';`);
      this.indentLevel--;
      this.addLine(`}`);
      this.nodeOutputs.set(node.id, outputVar);
    }
  }

  handleBase64EncodeNode(node) {
    const input = this.getNodeInputValue(node, 1);
    if (input !== undefined) {
      const outputVar = this.getUniqueVariableName('base64Encoded');
      this.addLine(`let ${outputVar};`);
      this.addLine(`try {`);
      this.indentLevel++;
      this.addLine(`${outputVar} = btoa(${input});`);
      this.indentLevel--;
      this.addLine(`} catch (error) {`);
      this.indentLevel++;
      this.addLine(`console.error('Base64 Encode Error:', error);`);
      this.addLine(`${outputVar} = '';`);
      this.indentLevel--;
      this.addLine(`}`);
      this.nodeOutputs.set(node.id, outputVar);
    }
  }

  handleBase64DecodeNode(node) {
    const input = this.getNodeInputValue(node, 1);
    if (input !== undefined) {
      const outputVar = this.getUniqueVariableName('base64Decoded');
      this.addLine(`let ${outputVar};`);
      this.addLine(`try {`);
      this.indentLevel++;
      this.addLine(`${outputVar} = atob(${input});`);
      this.indentLevel--;
      this.addLine(`} catch (error) {`);
      this.indentLevel++;
      this.addLine(`console.error('Base64 Decode Error:', error);`);
      this.addLine(`${outputVar} = '';`);
      this.indentLevel--;
      this.addLine(`}`);
      this.nodeOutputs.set(node.id, outputVar);
    }
  }

  getUniqueVariableName(baseName) {
    let counter = 1;
    let name = baseName;
    while (this.variables.has(name)) {
      name = `${baseName}${counter}`;
      counter++;
    }
    this.variables.set(name, 'any');
    return name;
  }

  executeJSONParse(node, debug) {
    const input = this.getNodeInputValue(node, 1);
    if (input !== undefined) {
      try {
        const result = JSON.parse(input);
        this.nodeOutputs.set(node.id, result);
        if (debug) console.log('JSON Parse result:', result);
      } catch (error) {
        if (debug) console.error('JSON Parse Error:', error);
        this.nodeOutputs.set(node.id, null);
      }
    }
  }

  executeJSONStringify(node, debug) {
    const input = this.getNodeInputValue(node, 1);
    const space = node.properties.space || 0;
    if (input !== undefined) {
      try {
        const result = JSON.stringify(input, null, space);
        this.nodeOutputs.set(node.id, result);
        if (debug) console.log('JSON Stringify result:', result);
      } catch (error) {
        if (debug) console.error('JSON Stringify Error:', error);
        this.nodeOutputs.set(node.id, '');
      }
    }
  }

  executeBase64Encode(node, debug) {
    const input = this.getNodeInputValue(node, 1);
    if (input !== undefined) {
      try {
        const result = btoa(input);
        this.nodeOutputs.set(node.id, result);
        if (debug) console.log('Base64 Encode result:', result);
      } catch (error) {
        if (debug) console.error('Base64 Encode Error:', error);
        this.nodeOutputs.set(node.id, '');
      }
    }
  }

  executeBase64Decode(node, debug) {
    const input = this.getNodeInputValue(node, 1);
    if (input !== undefined) {
      try {
        const result = atob(input);
        this.nodeOutputs.set(node.id, result);
        if (debug) console.log('Base64 Decode result:', result);
      } catch (error) {
        if (debug) console.error('Base64 Decode Error:', error);
        this.nodeOutputs.set(node.id, '');
      }
    }
  }
}

export default CodeGenerator;
