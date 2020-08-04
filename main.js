import {ToyReact, Component} from "./ToyReact.js"
class MyComponent extends Component{
	render(){
		return <div>
			<div>brother</div>
			{this.children}
		</div>
	}
}
// let a = <MyComponent name="a"/>

let b = <MyComponent name="a" id="ida">
		<span>child</span>
		{true}
	</MyComponent>

console.log(b)

ToyReact.render(
	b,
	document.body
)
