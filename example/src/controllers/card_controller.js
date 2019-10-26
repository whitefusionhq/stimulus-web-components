import { Controller } from "stimulus"
import { stimulusWebComponent } from "../../../src/index.js"

const CardInterior = class extends Controller {
  static targets = [ "name", "age", "bio" ]

  connect() {
    this.parentController().interior = this
    this.parentController().render()
    this.parentController().runTests()
  }

  render(initialData) {
    this.nameTarget.textContent = initialData.name
    this.nameTarget.classList.add('blue')
    this.ageTarget.textContent = initialData.age
  }
}

export default class extends Controller {
  static webComponent = stimulusWebComponent({
    attributes: ["name", "age"],
    methods: ["highlight", "summary"],
    tagPrefix: 'example',
    shadowRootHTML: `
      <style>
        .highlight { background-color: #ffffcc; }
        .blue { color: blue; }
      </style>
      <div data-controller="card-interior">
        <p>Name: <strong data-target="card-interior.name"></strong></p>
        <p>Age: <strong data-target="card-interior.age"></strong></p>
        <p>Bio: <strong data-target="card-interior.bio"><slot name="bio"></slot></strong></p>
      </div>
    `
  })

  connect() {
    this.webComponentize()
    this.shadowRegister('card-interior', CardInterior)
  }

  render() {
    this.interior.render({name: this.name, age: this.age})
  }

  attributeChangedCallback() {
    this.render()
  }

  highlight() {
    this.interior.element.classList.add('highlight')
  }

  summary() {
    return `Name: ${this.name}\nAge: ${this.age}\nBio: ${this.slotElement('bio').textContent}`
  }

  // Tests

  runTests() {
    this.assertContains("Name", this.interior.nameTarget, this.name) 
    this.assertAttr("Name is blue", this.interior.nameTarget, 'class', 'blue')
    this.assertContains("Age", this.interior.ageTarget, this.age) 
    this.assertContains("Bio", this.slotElement('bio'), this.element.querySelector('*[slot="bio"]').innerHTML, true)
  }

  assertContains(description, target, text, html=false) {
    let notice = document.createElement("div")
    const content = html ? target.innerHTML : target.textContent
    if (content.includes(text)) {
      notice.innerHTML = `<span style='color:green'>${description} text test PASSED</span>`
    } else {
      notice.innerHTML = `<span style='color:red'>${description} text test FAILED</span>`
    }
    document.body.appendChild(notice)
  }

  assertAttr(description, target, attr, value) {
    let notice = document.createElement("div")
    if ((target.getAttribute(attr) || "").includes(value)) {
      notice.innerHTML = `<span style='color:green'>${description} ${attr} attribute test PASSED</span>`
    } else {
      notice.innerHTML = `<span style='color:red'>${description} ${attr} attribute test FAILED</span>`
    }
    document.body.appendChild(notice)
  }
}
