import { mount } from 'svelte'

import './tokens.css'
import App from './shell/App.svelte'

const target = document.getElementById('app')
if (!target) throw new Error('#app not found')

export default mount(App, { target })
