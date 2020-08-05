export class ElementWrapper {
	constructor(type) {
		this.root = document.createElement(type)
	}
	setAttribute(name, value){
		if (name.match(/^on([\s\S]+)$/))
			this.root.addEventListener(RegExp.$1.replace(/^[\s\S]/, (s)=> s.toLowerCase()), value)
		if (name === "className")
			name = "class"
		this.root.setAttribute(name,value)
	}
	appendChild(vchild){
		let range = document.createRange()
		if(this.root.children.length) {
			range.setStartAfter(this.root.lastChild)
			range.setEndAfter(this.root.lastChild)
		} else {
			range.setStart(this.root, 0)
			range.setEnd(this.root, 0)
		}
		vchild.mountTo(range)
	}
	mountTo(range){
		range.deleteContents()
		range.insertNode(this.root)
	}
}

class TextWarpper{
	constructor(content) {
		this.root = document.createTextNode(content)
	}
	mountTo(range){
		range.deleteContents()
		range.insertNode(this.root)
	}
}
export class Component{
	constructor(){
		this.children = []
		this.props = Object.create(null)
	}
	mountTo(range){
		this.range = range
		this.update()
	}
	update(){
		let range = document.createRange()
		range.setStart(this.range.endContainer, this.range.endOffset)
		range.setEnd(this.range.endContainer, this.range.endOffset)
		range.insertNode(document.createComment("placeholder"))
		this.range.deleteContents()
		let vdom = this.render()
		vdom.mountTo(this.range)
	}
	setAttribute(name, value){
		if (name.match(/^on([\s\S]+)$/))
			this.root.addEventListener(RegExp.$1.replace(/^[\s\S]/, (s)=> s.toLowerCase()), value)
		if (name === "className")
			name = "class"
		this.props[name] = value
		this[name] = value
	}
	appendChild(vchild){
		this.children.push(vchild)
	}
	setState(state){
		const merge = (oldState, newState)=> {
			for(let p in newState) {
				if(typeof newState[p] === "object"){
					if (typeof oldState !== "object"){
						oldState[p] = {}
					}
					merge(oldState[p], newState[p])
				} else {
					oldState[p] = newState[p]
				}
			}
		}
		if (!this.state && state)
			this.state = {}
		merge(this.state, state)
		console.log(this.state, this.props)
		this.update()
	}
}

export let ToyReact = {
	createElement(type, attributes, ...children){
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
		let range = document.createRange()
		if(element.children.length) {
			range.setStartAfter(element.lastChild)
			range.setEndAfter(element.lastChild)
		} else {
			range.setStart(element, 0)
			range.setEnd(element, 0)
		}
		vdom.mountTo(range)
	}
}
