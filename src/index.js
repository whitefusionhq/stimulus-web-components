import { Application } from "stimulus"

export const setupStimulusComponents = application => {
  application.router.modules.forEach(module => {
    if (module.controllerConstructor.webComponent) {
      window.customElements.define(`${module.controllerConstructor.webComponent.tagPrefix}-${module.identifier}`, module.controllerConstructor.webComponent)
      module.controllerConstructor.prototype.webComponentize = function() {
        this.element.connectStimulusController(this)
      }
      module.controllerConstructor.prototype.shadowRegister = function(identifier, module) {
        module.prototype.parentController = function() {
          return this.element.parentNode.host.stimulusController
        }
        this.shadowApp.register(identifier, module)
      }
      module.controllerConstructor.prototype.slotElement = function(slotName) {
        return this.element.querySelector(`*[slot="${slotName}"]`)
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
    props.shadowRootHTML = ''
  }
  if (!props.tagPrefix) {
    props.tagPrefix = 'stimulus'
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
    static get tagPrefix() {
      return props.tagPrefix
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
    const contIdent = this.nodeName.toLowerCase().replace(`${this.constructor.tagPrefix}-`,'')
    return contIdent 
  }

  connectStimulusController(controller) {
    // runs when the controller calls webComponetize()
    this.stimulusController = controller 
    if (this.constructor.shadowRootHTML) {
      for (let childNode of this.shadowRoot.children) {
        if (!['style','script'].includes(childNode.tagName.toLowerCase())) {
          this.stimulusController.shadowApp = Application.start(childNode)
          break
        }
      }
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

