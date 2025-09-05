export default {
  mounted() {
    // Prevent recursive calls by checking if we're already in the mounted process
    if (this._resourceToolbarMixinMounted) {
      return;
    }
    this._resourceToolbarMixinMounted = true;
    
    // Call parent mounted hooks if they exist, but skip this mixin
    if (this.$options.mixins) {
      this.$options.mixins.forEach(mixin => {
        if (mixin.mounted && mixin !== this.$options) {
          mixin.mounted.call(this);
        }
      });
    }
    
    this.injectIndexActions();
  },

  methods: {
    injectIndexActions() {
      if (this.$el && this.resourceName) {
        const toolbarItems = this.$el.querySelector('.h-9.ml-auto.flex.items-center');
        
        if (toolbarItems && !toolbarItems.querySelector('index-actions')) {
          const indexActionsContainer = document.createElement('div');
          const actionSelector = toolbarItems.querySelector('[dusk="action-selector-button"]')?.parentElement;
          
          if (actionSelector) {
            toolbarItems.insertBefore(indexActionsContainer, actionSelector);
          } else {
            toolbarItems.insertBefore(indexActionsContainer, toolbarItems.firstChild);
          }
          
          // Create the IndexActions component instance
          try {
            // Get the app instance from the current component context
            const app = this.$root.$.appContext?.app || this.$root.$options._base;
            
            // Try to get the IndexActions component from registered components
            let IndexActions = app.component('IndexActions');
            
            // If not found in app components, try importing directly
            if (!IndexActions) {
              IndexActions = require('../components/IndexActions.vue').default;
            }
            
            if (IndexActions) {
              // Vue 3 approach for Nova 5
              const { createApp, h } = window.Vue || app;
              const resourceName = this.resourceName;
              
              // Register required components in the new app instance
              const ActionButtons = require('../components/ActionButtons.vue').default;
              const ActionButton = require('../components/ActionButton.vue').default;
              
              const componentApp = createApp({
                render() {
                  return h(IndexActions, {
                    resourceName: resourceName
                  });
                }
              });
              
              // Register components that IndexActions needs
              componentApp.component('ActionButtons', ActionButtons);
              componentApp.component('ActionButton', ActionButton);
              componentApp.component('ActionDropdown', app.component('ActionDropdown'));
              
              // Register specific Nova components that actions need
              const componentsToRegister = [
                'Icon',
                'ActionDropdown',
                'ConfirmActionModal',
                'Modal',
                'ModalContent', 
                'ModalHeader',
                'ModalFooter',
                'DefaultField',
                'FieldWrapper',
                // Form field components
                'FormDateField',
                'FormTextField',
                'FormTextareaField',
                'FormSelectField',
                'FormBooleanField',
                'FormNumberField',
                'FormPasswordField',
                'FormColorField',
                'FormCurrencyField',
                'FormEmailField',
                'FormFileField',
                'FormHiddenField',
                'FormKeyValueField',
                'FormMarkdownField',
                'FormMultiSelectField',
                'FormPanel',
                'FormSlugField',
                'FormStatusField',
                'FormTagField',
                'FormUrlField',
                // Common components
                'Button',
                'Badge',
                'Heading',
                'Link',
                'LoadingView',
                'Card',
                'Dropdown',
                'DropdownTrigger',
                'DropdownMenu',
                'DropdownMenuItem',
                'ScrollWrap'
              ];
              
              componentsToRegister.forEach(name => {
                try {
                  const component = app.component(name);
                  if (component && typeof component === 'object') {
                    componentApp.component(name, component);
                  }
                } catch (e) {
                  // Skip components that cause errors
                  console.warn(`Could not register component ${name}:`, e.message);
                }
              });
              
              // Copy global properties from the parent app
              const globalProps = this.$root.$.appContext.app.config.globalProperties;
              Object.keys(globalProps).forEach(key => {
                componentApp.config.globalProperties[key] = globalProps[key];
              });
              
              // Ensure translation function is available
              if (!componentApp.config.globalProperties.__) {
                componentApp.config.globalProperties.__ = (key, replace) => {
                  return globalProps.__ ? globalProps.__(key, replace) : key;
                };
              }
              
              // Copy Nova object and other essentials
              componentApp.config.globalProperties.Nova = globalProps.Nova || window.Nova;
              
              // Use the same plugins as the parent app
              if (this.$root.$.appContext.app._context.provides) {
                Object.keys(this.$root.$.appContext.app._context.provides).forEach(key => {
                  componentApp.provide(key, this.$root.$.appContext.app._context.provides[key]);
                });
              }
              
              // Provide the store and other required context
              componentApp.provide('store', this.$store);
              
              componentApp.mount(indexActionsContainer);
            }
          } catch (error) {
            console.error('Failed to inject IndexActions:', error);
          }
        }
      }
    }
  }
};