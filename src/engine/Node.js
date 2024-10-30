const PORT_CONSTANTS = {
	WIDTH: 6,
	HEIGHT: 10,
	OFFSET: 5,
	SCALE_MULTIPLIER: 1.5,
	VERTICAL_OFFSET: 2,
	BASE_Y: 35,
	SPACING: 14,
	TRIANGLE_WIDTH: 6,
	TRIANGLE_HEIGHT: 10
};

class Node {
	constructor(id, type, x, y, nodeTypes) {
	  this.id = id;
	  this.type = type;
	  this.x = x;
	  this.y = y;
	  this.properties = {};
	  
	  // Initialize properties with default values from nodeType
	  const nodeType = nodeTypes[type];
	  if (nodeType && nodeType.properties) {
		nodeType.properties.forEach(prop => {
		  this.properties[prop.name] = prop.default;
		});
	  }
	}
  
	static create(type, x, y, nodeTypes) {
	  return new Node(Date.now(), type, x, y, nodeTypes);
	}
  
	static fromJSON(nodeData, nodeTypes) {
	  const node = new Node(nodeData.id, nodeData.type, nodeData.x, nodeData.y, nodeTypes);
	  node.properties = { ...nodeData.properties };
	  return node;
	}
  
	static createFromExample(exampleNode, nodeTypes) {
	  // Special handling for Switch nodes with dynamic outputs
	  if (exampleNode.type === 'Switch' && exampleNode.properties.cases) {
		Node.updateSwitchNodeType(exampleNode, nodeTypes);
	  }
	  return Node.fromJSON(exampleNode, nodeTypes);
	}
  
	static updateSwitchNodeType(node, nodeTypes) {
	  const switchNode = nodeTypes['Switch'];
	  const baseOutputs = [...switchNode.outputs];
	  
	  node.properties.cases.forEach((caseItem, index) => {
		baseOutputs.splice(index, 0, {
		  type: 'control',
		  name: caseItem.output,
		  description: `Triggered when value matches ${caseItem.value}`
		});
	  });
	  
	  nodeTypes['Switch'] = {
		...switchNode,
		outputs: baseOutputs
	  };
	}
  
	updateProperty(property, value) {
	  this.properties[property] = value;
	  return this;
	}
  
	clone(offset = { x: 20, y: 20 }) {
	  const clonedNode = new Node(Date.now() + Math.random(), this.type, this.x + offset.x, this.y + offset.y);
	  clonedNode.properties = { ...this.properties };
	  return clonedNode;
	}
  
	isPointInside(x, y, dimensions) {
	  return (
		x >= this.x &&
		x <= this.x + dimensions.width &&
		y >= this.y &&
		y <= this.y + dimensions.height
	  );
	}
  
	getPortPosition(portIndex, isInput, dimensions) {
	  const portY = this.y + PORT_CONSTANTS.BASE_Y + (portIndex * PORT_CONSTANTS.SPACING);
	  const portYMiddle = portY + (PORT_CONSTANTS.TRIANGLE_HEIGHT / 2);
	  
	  const portX = isInput 
		? this.x - PORT_CONSTANTS.OFFSET - (PORT_CONSTANTS.TRIANGLE_WIDTH / 2)
		: this.x + dimensions.width + PORT_CONSTANTS.OFFSET + (PORT_CONSTANTS.TRIANGLE_WIDTH / 2);
	  
	  return {
		x: portX,
		y: portYMiddle,
		nodeId: this.id,
		isInput,
		index: portIndex
	  };
	}
  
	isPortClicked(x, y, portIndex, isInput, dimensions) {
	  const portX = isInput
		? this.x - PORT_CONSTANTS.OFFSET - PORT_CONSTANTS.WIDTH
		: this.x + dimensions.width + PORT_CONSTANTS.OFFSET;
	  
	  const portY = this.y + PORT_CONSTANTS.BASE_Y + (portIndex * PORT_CONSTANTS.SPACING);
  
	  return (
		x >= portX &&
		x <= portX + PORT_CONSTANTS.WIDTH * PORT_CONSTANTS.SCALE_MULTIPLIER &&
		y >= portY - PORT_CONSTANTS.VERTICAL_OFFSET &&
		y <= portY + PORT_CONSTANTS.HEIGHT + PORT_CONSTANTS.VERTICAL_OFFSET
	  );
	}
  
	findClickedPort(x, y, dimensions, nodeType) {
	  // Check input ports
	  for (let i = 0; i < nodeType.inputs.length; i++) {
		if (this.isPortClicked(x, y, i, true, dimensions)) {
		  return this.getPortPosition(i, true, dimensions);
		}
	  }
  
	  // Check output ports
	  for (let i = 0; i < nodeType.outputs.length; i++) {
		if (this.isPortClicked(x, y, i, false, dimensions)) {
		  return this.getPortPosition(i, false, dimensions);
		}
	  }
  
	  return null;
	}
  
	move(dx, dy) {
	  this.x += dx;
	  this.y += dy;
	  return this;
	}
  
	moveTo(x, y) {
	  this.x = x;
	  this.y = y;
	  return this;
	}
  
	toJSON() {
	  return {
		id: this.id,
		type: this.type,
		x: this.x,
		y: this.y,
		properties: { ...this.properties }
	  };
	}
  
	static createInstance(nodeData, nodeTypes) {
	  return Node.fromJSON(nodeData, nodeTypes);
	}
  }
  
  export default Node;