export class ElementWrapper {
	constructor(type) {
		//this.root = document.createElement(type)
		this.type = type
		this.props = Object.create(null)
		this.children = []
	}
	setAttribute(name, value){
		//if (name.match(/^on([\s\S]+)$/))
		//	this.root.addEventListener(RegExp.$1.replace(/^[\s\S]/, (s)=> s.toLowerCase()), value)
		//if (name === "className")
		//	name = "class"
		//this.root.setAttribute(name,value)
		this.props[name] = value
	}
	appendChild(vchild){
		/*let range = document.createRange()
		if(this.root.children.length) {
			range.setStartAfter(this.root.lastChild)
			range.setEndAfter(this.root.lastChild)
		} else {
			range.setStart(this.root, 0)
			range.setEnd(this.root, 0)
		}
		vchild.mountTo(range)*/
		this.children.push(vchild)
	}
	addEventListener(){
		this.root.addEventListener(...arguments)
	}
	mountTo(range){
		this.range = range
		range.deleteContents()
		
		// 產生element
		let element = document.createElement(this.type)
		for(let name in this.props){
			let value = this.props[name]
			if (name.match(/^on([\s\S]+)$/))
				element.addEventListener(RegExp.$1.replace(/^[\s\S]/, (s)=> s.toLowerCase()), value)
			if (name === "className")
				name = "class"
			element.setAttribute(name, value)
		}

		// appendChild
		for(let child of this.children){
			let range = document.createRange()
			if(element.children.length) {
				range.setStartAfter(element.lastChild)
				range.setEndAfter(element.lastChild)
			} else {
				range.setStart(element, 0)
				range.setEnd(element, 0)
			}
			child.mountTo(range)
		}
		range.insertNode(element)
	}
	equal(element){
		if (typeof(element) !== typeof(this))
			return false
		if (this.type !== element.type)
			return false
			
		if (this.props.length !== element.props.length)
			return false
		for (let i in this.props) {
			if (this.props[i]!== element.props[i])
				return false
		}
		/*if (this.children.length !== element.children.length)
			return false
		for (let i in this.children) {
			if (!this.children[i].equal(element.children[i]))
				return false
		}*/
		return true
	}
}

class TextWarpper{
	constructor(content) {
		this.content = content
		this.children = []
	}
	mountTo(range){
		this.range = range
		let element = document.createTextNode(this.content)
		range.deleteContents()
		range.insertNode(element)
	}
	equal(element){
		return typeof(this) === typeof(element) && this.content === element.content
	}
}

export class Component{
	constructor(){
		this.children = []
		this.props = Object.create(null)
		this.type = this.constructor.name
	}
	// vdom bind to dom
	mountTo(range){
		this.range = range
		this.update()
	}
	update(){
		//let range = document.createRange()
		//range.setStart(this.range.endContainer, this.range.endOffset)
		//range.setEnd(this.range.endContainer, this.range.endOffset)
		//range.insertNode(document.createComment("placeholder"))
		//this.range.deleteContents()
		let replace = (od, nd) => {
			if (od.children.length !== nd.children.length) {
				nd.mountTo(od.range)
			}
			else if (!od.equal(nd)){
				if (od instanceof Component) {
					nd.mountTo(od.range)
				} else {
					for (let i in od.children) {
						replace(od.children[i], nd.children[i])
					}
				}
			}
			else {
				for (let i in od.children) {
					replace(od.children[i], nd.children[i])
				}
			}
		}
		let vdom = this.render()
		if (this.vdom){
			replace(this.vdom, vdom)	
		} else {
			vdom.mountTo(this.range)
		}
		this.vdom = vdom
	}
	setAttribute(name, value){
		if (name === "className")
			name = "class"
		this.props[name] = value
		this[name] = value
	}

	// vdom bind to vbind
	appendChild(vchild){
		this.children.push(vchild)
	}
	setState(state){
		const merge = (oldState, newState)=> {
			for(let p in newState) {
				if(typeof newState[p] === "object" && newState[p]!==null){
						
						if (typeof oldState[p] !== "object"){
							if (newState[p] instanceof Array)
								oldState[p] = []
							else
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
	equal(element){
		if (typeof(element) !== typeof(this))
			return false
		if (this.type !== element.type)
			return false
			
		if (this.props.length !== element.props.length)
			return false
		for (let i in this.props) {
			if (this.props[i] !== element.props[i])
				return false
		}
		return true
	}

}

export let ToyReact = {
	createElement(type, attributes, ...children){
		console.log("create", arguments)
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
				if(child === null || child === void 0)
					child = ""
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
		console.log(vdom)
	}
}
