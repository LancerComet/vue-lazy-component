/**
 *  Vue-Lazy-Component is an awesome directive for lazy load components or elements.
 *
 *  This is the scrolling version, based on:
 *  ![Vue-Lazy-Component](https://github.com/Coffcer/vue-lazy-component)
 *  Author: Coffcer
 *
 *  By LancerComet at 0:48, 2016.09.10.
 *  # Carry Your World #
 *
 *  Something new:
 *  ---
 *   + Initialize the vue component when scrolling & resizing browser window if the component is visible.
 *
 */

// Module Configuration.
const directive = 'lazy-comp'
const checkDelta = -200
const lazyNodes = []

// These are the functions that from Vue.
// Will be valued in next step.
var FragmentFactory
var createAnchor
var replace

const viewportHeight = window.innerHeight

export default {
  install: function (Vue, options) {
    FragmentFactory = Vue.FragmentFactory
    createAnchor = Vue.util.createAnchor
    replace = Vue.util.replace

    // Setup Directives.
    Vue.directive(directive, {
      terminal: true,

      bind: function () {
        const el = this.el
        this.inited = false

        // This node is designed for detect the component's position.
        // Sometime the component would be set to "display = none" and the "getTop()" will be unusable.
        // This node will be inserted to the parent node of this component.
        const linker = document.createElement('div')
        el.parentNode.appendChild(linker)
        this.linker = linker

        const scrollTop = getScrollTop()
        console.log(scrollTop + viewportHeight - getTop(linker))

        if (scrollTop + viewportHeight - getTop(linker) > checkDelta) {
          this.anchor = createAnchor('v-if')
          replace(el, this.anchor)
          this.insert()
          this.updateRef()
          return
        }

        this.anchor = createAnchor('v-if')
        replace(el, this.anchor)

        lazyNodes.push(this)
        Vue.nextTick(() => lazyExec(this))
      },

      insert () {
        if (!this.factory) {
          this.factory = new FragmentFactory(this.vm, this.el)
        }
        this.frag = this.factory.create(this._host, this._scope, this._frag)
        this.frag.before(this.anchor)
      },

      updateRef () {
        var ref = this.descriptor.ref
        if (!ref) { return }

        var hash = (this.vm || this._scope).$refs
        var refs = hash[ref]
        var key = this._frag.scope.$key

        if (!refs) { return }

        if (Array.isArray(refs)) {
          refs.push(findVmFromFrag(this._frag))
        } else {
          refs[key] = findVmFromFrag(this._frag)
        }
      }

    })

    // Setup scrolling events.
    setEvents()
  }
}

// Set scrolling events.
function setEvents () {
  // Execute when scrolling.
  var events = ['resize', 'scroll']
  events.forEach(function (event) { window.addEventListener(event, lazyComponent) })
}

// Main function of LazyComponent.
function lazyComponent () {
  // Get all nodes that are needed to be lazyed.
  for (let i = 0, length = lazyNodes.length; i < length; i++) {
    const node = lazyNodes[i]
    lazyExec(node)
  }
}

// LazyComponent dom controller.
function lazyExec (node) {
  // @ node: HTML Element Object.
  if (node.inited) { return }

  // Size.
  const scrollTop = getScrollTop()

  // Check and see the position of this node.
  // Attach image link or not.
  if (scrollTop + viewportHeight - getTop(node.linker) > checkDelta) {
    node.insert()
    node.updateRef()
    node.linker.parentNode.removeChild(node.linker)
    node.inited = true
  }
}

// Get an element's absolute offset top position.
function getTop (element) {
  var offset = element.offsetTop
  if (element.offsetParent !== null) { offset += getTop(element.offsetParent) }
  return offset
}

function findVmFromFrag (frag) {
  let node = frag.node
  if (frag.end) {
    while (!node.__vue__ && node !== frag.end && node.nextSibling) {
      node = node.nextSibling
    }
  }
  return node.__vue__
}

function getScrollTop () {
  return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop
}