class CodeGenerator {
  constructor(nodes, edges, settings) {
    this.nodes = nodes;
    this.edges = edges;
    this.settings = settings || {
      useStrict: true,
      useSemicolons: true,
      useConst: false,
      generateComments: true,
    };
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
      this.addLine('"use strict"');
      this.addLine();
    }
    this.generateImports();
    this.generateMainFunction();
    return this.code.trim(); // Trim to remove any trailing newlines
  }

  generateImports() {
    this.addLine("// Imports would go here");
    this.addLine();
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
    this.addLine('}');
    this.addLine();
    this.addLine('main()');
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
      case 'If':
        this.handleIfNode(node);
        break;
      case 'Random':
        const randomType = node.properties.type || 'number';
        const resultVar = this.getUniqueVariableName('randomResult');
        
        switch (randomType) {
          case 'number':
            const min = parseFloat(node.properties.min) || 1;
            const max = parseFloat(node.properties.max) || 100;
            this.addLine(`const ${resultVar} = Math.floor(Math.random() * (${max} - ${min} + 1)) + ${min};`);
            break;
            
          case 'string':
            const length = parseInt(node.properties.length) || 10;
            const charset = node.properties.charset || 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            this.addLine(`let ${resultVar} = '';`);
            this.addLine(`for (let i = 0; i < ${length}; i++) {`);
            this.indentLevel++;
            this.addLine(`${resultVar} += ${JSON.stringify(charset)}[Math.floor(Math.random() * ${charset.length})];`);
            this.indentLevel--;
            this.addLine(`}`);
            break;
            
          case 'boolean':
            const probability = parseFloat(node.properties.probability) || 50;
            this.addLine(`const ${resultVar} = Math.random() * 100 < ${probability};`);
            break;
          default:
            this.addLine(`// Unknown random type: ${node.properties.type}`);
        }
        
        this.nodeOutputs.set(node.id, resultVar);
        break;
      case 'Switch':
        const switchValue = this.getNodeInputValue(node, 1);
        if (switchValue === undefined) {
          this.addLine('// Warning: Switch node is missing input value');
          return;
        }

        const ignoreCase = node.properties.ignoreCase;
        const cases = node.properties.cases || [];
        
        if (ignoreCase) {
          this.addLine(`switch (${switchValue}.toString().toLowerCase()) {`);
        } else {
          this.addLine(`switch (${switchValue}) {`);
        }
        this.indentLevel++;

        // Generate case statements
        cases.forEach((caseObj, index) => {
          // Convert the case value based on its type
          let caseValue;
          switch (caseObj.type) {
            case 'number':
              caseValue = Number(caseObj.value);
              break;
            case 'boolean':
              caseValue = caseObj.value === 'true';
              break;
            default: // string
              caseValue = ignoreCase ? caseObj.value.toLowerCase() : caseObj.value;
              caseValue = JSON.stringify(caseValue);
          }

          this.addLine(`case ${caseValue}:`);
          this.indentLevel++;
          
          // Find and generate code for the case branch
          const caseEdge = this.edges.find(edge => 
            edge.start.nodeId === node.id && 
            edge.start.index === index + 1 && // +1 because index 0 is the default output
            !edge.start.isInput
          );
          
          if (caseEdge) {
            const nextNode = this.nodes.find(n => n.id === caseEdge.end.nodeId);
            if (nextNode) {
              this.generateNodeCodeSequence(nextNode);
            }
          }
          
          this.addLine('break;');
          this.indentLevel--;
        });

        // Default case
        this.addLine('default:');
        this.indentLevel++;
        
        // Find and generate code for the default branch
        const defaultEdge = this.edges.find(edge => 
          edge.start.nodeId === node.id && 
          edge.start.index === 0 && 
          !edge.start.isInput
        );
        
        if (defaultEdge) {
          const defaultNode = this.nodes.find(n => n.id === defaultEdge.end.nodeId);
          if (defaultNode) {
            this.generateNodeCodeSequence(defaultNode);
          }
        }
        
        this.addLine('break;');
        this.indentLevel--;
        
        this.indentLevel--;
        this.addLine('}');
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
    const { name, type, initialValue } = node.properties;
    const inputValue = this.getNodeInputValue(node, 1);
    
    if (!this.variables.has(name)) {
      // First time this variable is used - declare and initialize it
      let declaration = `${this.settings.useConst ? 'const' : 'let'} ${name}`;
      if (inputValue !== undefined) {
        declaration += ` = ${inputValue}`;
      } else if (initialValue !== undefined && initialValue !== '') {
        declaration += ` = ${this.getTypedValue(type, initialValue)}`;
      }
      this.addLine(declaration);
      this.variables.set(name, type);
    } else if (inputValue !== undefined && inputValue !== name) {
      // Variable already declared, just update its value
      this.addLine(`${name} = ${inputValue}`);
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
    if (line === '') {
      this.code += '\n';
    } else {
      const indentation = '  '.repeat(this.indentLevel);
      const semicolon = this.settings.useSemicolons && this.shouldAddSemicolon(line) ? ';' : '';
      const cleanLine = line.replace(/;$/, '');
      this.code += `${indentation}${cleanLine}${semicolon}\n`;
    }
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

  shouldAddSemicolon(line) {
    // Don't add semicolons after these statements
    const noSemicolonPatterns = [
      /^function/,
      /^class/,
      /^if/,
      /^for/,
      /^while/,
      /^switch/,
      /^try/,
      /^catch/,
      /^finally/,
      /^case\s/,  // Added to prevent semicolons after case statements
      /^default:/, // Added to prevent semicolons after default:
      /\{$/,
      /\}$/,
      /\};$/,     // Added to prevent double semicolons
      /;$/,       // Added to prevent double semicolons
      // Also don't add semicolons after comments
      /^\/\//,
      /^\/\*/
    ];
    return !noSemicolonPatterns.some(pattern => pattern.test(line.trim()));
  }

  handleIfNode(node) {
    const inputA = this.getNodeInputValue(node, 1);
    const inputB = this.getNodeInputValue(node, 2);
    const operator = node.properties.operator || '==';

    if (inputA === undefined || inputB === undefined) {
      this.addLine('// Warning: If node is missing input values');
      return;
    }

    this.addLine(`if (${inputA} ${operator} ${inputB}) {`);
    this.indentLevel++;

    // Find and generate code for the 'True' branch
    const trueEdge = this.edges.find(edge => 
      edge.start.nodeId === node.id && 
      edge.start.isInput === false && 
      edge.start.index === 0
    );
    if (trueEdge) {
      const trueNode = this.nodes.find(n => n.id === trueEdge.end.nodeId);
      if (trueNode) {
        this.generateNodeCodeSequence(trueNode);
      }
    }

    this.indentLevel--;
    this.addLine("} else {");
    this.indentLevel++;

    // Find and generate code for the 'False' branch
    const falseEdge = this.edges.find(edge => 
      edge.start.nodeId === node.id && 
      edge.start.isInput === false && 
      edge.start.index === 1
    );
    if (falseEdge) {
      const falseNode = this.nodes.find(n => n.id === falseEdge.end.nodeId);
      if (falseNode) {
        this.generateNodeCodeSequence(falseNode);
      }
    }

    this.indentLevel--;
    this.addLine("}");
  }
}

export default CodeGenerator;