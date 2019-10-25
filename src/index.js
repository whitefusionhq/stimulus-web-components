import { Application } from "stimulus"

export const setupStimulusComponents = application => {
  application.router.modules.forEach(module => {
    if (module.controllerConstructor.webComponent) {
      window.customElements.define(`stimulus-${module.identifier}`, module.controllerConstructor.webComponent)
      module.controllerConstructor.prototype.webComponentize = function() {
        this.element.connectStimulusController(this)
      }
    }
  })
}

export const stimulusWebComponent = props => {
  if (!props) {
    var props = {}
  }
  if (!props.attributes) {
    props.attributes = []
  }
  if (!props.methods) {
    props.methods = []
  }
  if (!props.shadowRootHTML) {
    props.shadowRootHTML = ""
  }
  return class extends StimulusWebComponentWrapper {
    static get observedAttributes() {
      return props.attributes
    }
    static get controllerMethods() {
      return props.methods
    }
    static get shadowRootHTML() {
      return props.shadowRootHTML
    }
  }
}

export class StimulusWebComponentWrapper extends HTMLElement {
  constructor() {
    super()

    if (this.constructor.shadowRootHTML) {
      const shadowRoot = this.attachShadow({mode: 'open'})
      shadowRoot.innerHTML = this.constructor.shadowRootHTML
    }
  }

  connectedCallback() {
    this.classList.add('stimulus-web-component')
    if (this.constructor.observedAttributes) {
      this.constructor.observedAttributes.forEach(attributeName => {
        Object.defineProperty(this, attributeName, {
          get: () => { return this.getAttribute(attributeName) },
          set: (value) => { this.setAttribute(attributeName, value) }
        })
      })
    }
    this.dataset.controller = this.stimulusControllerIdentifier()
  }

  stimulusControllerIdentifier() {
    const contIdent = this.nodeName.toLowerCase().replace('stimulus-','')
    return contIdent 
  }

  connectStimulusController(controller) {
    this.stimulusController = controller 
    if (this.constructor.shadowRootHTML) {
      this.stimulusController.shadowApp = Application.start(this.shadowRoot.children[0])
    }
    this.constructor.observedAttributes.forEach(attributeName => {
      Object.defineProperty(this.stimulusController, attributeName, {
        get: () => { return this[attributeName] },
        set: (value) => { this[attributeName] = value }
      }) 
    })
    this.constructor.controllerMethods.forEach(methodName => {
      this[methodName] = this.stimulusController[methodName].bind(this.stimulusController)
    })
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (this.stimulusController) {
      this.stimulusController.attributeChangedCallback(name, oldValue, newValue)
    }
  }
}

