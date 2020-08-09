const nodeEqual = (vdom1, vdom2) => {
		if (vdom1.type !== vdom2.type)
			return false
		for (let name in vdom1.props) {
			/*if (typeof vdom1.props[name] === "function" && typeof vdom2.props[name] === "function" && vdom1.props[name].toString() === vdom2.props[name].toString())
				continue*/
			if (typeof vdom1.props[name] === "object" && typeof vdom2.props[name] === "object" && JSON.stringify(vdom1.props[name]) === JSON.stringify(vdom2.props[name]))
				continue
			if (vdom1.props[name] !== vdom2.props[name])
				return false
		}
		if (Object.keys(vdom1.props).length !== Object.keys(vdom2.props).length)
			return false
		return true
	}

export class ElementWrapper {

	constructor(type) {
		this.type = type
		this.props = Object.create(null)
		this.children = []
	}
	setAttribute(name, value){
		this.props[name] = value
	}
	appendChild(vchild){
		this.children.push(vchild)
	}
	addEventListener(){
		this.root.addEventListener(...arguments)
	}
	mountTo(range){
		this.range = range
		
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
		let v = null
		if (range.endOffset !== range.startOffset)
			v = range.startContainer.children[range.startOffset]
		range.insertNode(element)
		if (v)
			range.startContainer.removeChild(v)
	}
	
	
	get vdom(){ 
		return this
	}
}

class TextWarpper{
	constructor(content) {
		this.type = "#text"
		this.content = content
		this.props = {content: this.content}
		this.children = []
	}
	mountTo(range){
		this.range = range
		let element = document.createTextNode(this.content)
		range.deleteContents()
		range.insertNode(element)
	}
	get vdom(){ 
		return this
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
	get vdom(){
		if (!this._vdom)
			this._vdom = this.render().vdom
		return this._vdom
	}
	update(){
		let replace = (od, nd) => {
			if (!nodeEqual(od, nd)) {
				if (od instanceof Component && nd instanceof Component) {
					replace(od.vdom, nd.render().vdom)
					for (let i = 0; i < nd.children.length; i++) {
						if (replace(od.children[i], nd.children[i]))
							od.children[i] = nd.children[i]
					}

					
				}else {
					nd.mountTo(od.range)
					return true
				}
				return false
			}
			if (nd.children.length !== od.children.length){
				nd.mountTo(od.range)
				return true
			}
			const childNum = Math.max(nd.children.length, od.children.length)
			for (let i = 0; i < nd.children.length; i++) {
				if (replace(od.children[i], nd.children[i]))
					od.children[i] = nd.children[i]
			}
		}
		let vdom = this.render().vdom
		if (this._vdom){
			replace(this._vdom, vdom)	
		} else {
			vdom.mountTo(this.range)
			this._vdom = vdom
		}
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
	}
}
