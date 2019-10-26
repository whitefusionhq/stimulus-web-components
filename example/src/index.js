import { Application } from "stimulus"
import { definitionsFromContext } from "stimulus/webpack-helpers"
import { setupStimulusComponents } from "../../src/index.js"

const application = Application.start()
const context = require.context("./controllers", true, /\.js$/)
application.load(definitionsFromContext(context))
setupStimulusComponents(application)