import ResourceTableToolbarMixin from './mixins/ResourceTableToolbarMixin';

// Track components that have already been processed to prevent duplicate mixin additions
const processedComponents = new WeakSet();

Nova.booting((app, store) => {
  app.component("ActionButton", require("./components/ActionButton.vue").default);
  app.component("ActionButtons", require("./components/ActionButtons.vue").default);
  app.component("IndexActions", require("./components/IndexActions.vue").default);
  
  const originalComponent = app.component.bind(app);
  
  app.component = function (name, component) {
    if (name === 'ResourceTableToolbar' && component && !processedComponents.has(component)) {
      processedComponents.add(component);
      if (!component.mixins) {
        component.mixins = [];
      }
      if (!component.mixins.includes(ResourceTableToolbarMixin)) {
        component.mixins.push(ResourceTableToolbarMixin);
      }
    }
    
    return originalComponent(name, component);
  };
  
  const pages = app.config.globalProperties.$inertia?.page?.components || {};
  
  Object.keys(pages).forEach(key => {
    const page = pages[key];
    if (page && typeof page.setup === 'function') {
      const originalSetup = page.setup;
      
      page.setup = (...args) => {
        const result = originalSetup(...args);
        
        if (typeof result === 'function') {
          return (...renderArgs) => {
            const vnode = result(...renderArgs);
            
            if (vnode?.children) {
              vnode.children.forEach(child => {
                if (child?.type?.name === 'ResourceIndex' || child?.type?.components?.ResourceTableToolbar) {
                  const toolbar = child.type.components?.ResourceTableToolbar;
                  if (toolbar && !processedComponents.has(toolbar)) {
                    processedComponents.add(toolbar);
                    if (!toolbar.mixins) {
                      toolbar.mixins = [];
                    }
                    if (!toolbar.mixins.includes(ResourceTableToolbarMixin)) {
                      toolbar.mixins.push(ResourceTableToolbarMixin);
                    }
                  }
                }
              });
            }
            
            return vnode;
          };
        }
        
        return result;
      };
    }
  });
});
