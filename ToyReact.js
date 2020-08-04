export class ElementWrapper {
	constructor(type) {
		this.root = document.createElement(type)
	}
	setAttribute(name, value){
		this.root.setAttribute(name,value)
	}
	appendChild(vchild){
		vchild.mountTo(this.root)
	}
	mountTo(parent){
		parent.appendChild(this.root)
	}
}

class TextWarpper{
	constructor(content) {
		this.root = document.createTextNode(content)
	}
	mountTo(parent){
		parent.appendChild(this.root)
	}
}
export class Component{
	constructor(){
		this.children = []
	}
	mountTo(parent){
		let vdom = this.render()
		vdom.mountTo(parent)
	}
	setAttribute(name, value){
		this[name] = value
	}
	appendChild(vchild){
		this.children.push(vchild)
	}
}

export let ToyReact = {
	createElement(type, attributes, ...children){
		console.log(arguments)
		let element 
		if (typeof type === "string")
			element = new ElementWrapper(type)
		else {
			element = new type
		}
		for (let name in attributes) {
			element.setAttribute(name, attributes[name])
		}
		let insertChilren= (children) => {
			for(let child of children){
				if (typeof child === "object" && child instanceof Array)
					insertChilren(child)
				else {
					if (!(child instanceof Component) && !(child instanceof TextWarpper) && !(child instanceof ElementWrapper)) {
						child = new TextWarpper(String(child))
					}
					element.appendChild(child)
				}
			}
		}
		insertChilren(children)
		return element
	},
	render(vdom, element){
		vdom.mountTo(element)
	}
}
