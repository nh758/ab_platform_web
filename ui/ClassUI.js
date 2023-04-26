import { EventEmitter } from "events";

class ClassUI extends EventEmitter {
   constructor(base, ids) {
      super();

      this.ids = {};
      // {hash}
      // An internal reference of webix.ids that we use to reference webix
      // components.

      // We can be called in several ways:
      // 1) super("base_id");
      //    in this case we create a default this.ids.component = base_id;
      //
      // 2) super({ id1:"id1", id2:"id2", ... })
      //    in this case we create a this.ids = base;
      //    we look for a this.ids.base || or this.ids.component and use that
      //    as our "base" reference.
      //
      // 3) super(base, ids);
      //
      if (base) {
         if ("string" == typeof base) {
            this.ids = {
               component: base,
            };
         } else {
            this.ids = base;
            base = this.ids.base ?? this.ids.component;
         }
      }

      // a shortcut way to enter the ids is to simply put the keys:
      // {
      //    form:"",
      //    form_button:"",
      //    ...
      // }
      // so we need to make sure the actual values are set according to
      // `{base}_{key}` format.
      //
      if (ids) {
         Object.keys(ids).forEach((k) => {
            if (ids[k]) {
               return (this.ids[k] = ids[k]);
            }
            this.ids[k] = `${base}_${k}`;
         });
      }

      // verify this.ids are properly set:
      Object.keys(this.ids).forEach((k) => {
         this.ids[k] = this.ids[k] || `${base}_${k}`;
      });

      // and make sure there is a .component set:
      this.ids.component = this.ids.component || base;
   }

   /**
    * @method CYPRESS_REF()
    * Attach a cypress "data-cy" attribute to the given element.  This is used
    * for writing E2E tests and how we directly identify a webix widget we are
    * referencing for our tests.
    * @param {webix.object|webix.node|html.element} el
    *        The element we are attempting to attach the data attribute to
    *        There are a number of ways we might be sending this element
    *        on a onAfterRender() callback on a Webix Object
    *        by gathering the nodes of a Webix object directly
    * @param {string} id
    *        [optional] the value of the data-cy attribute
    */
   static CYPRESS_REF(el, id) {
      if (!el) return;

      id = id || el.config?.id;

      // is this a webix object?
      if (el.getInputNode) {
         var node = el.getInputNode();
         if (node) {
            node.setAttribute("data-cy", id);
            return;
         }
      }

      // this element has a webix $view
      if (el.$view) {
         el.$view.setAttribute("data-cy", id);
         return;
      }

      // this is probably a straight up DOM element:
      el.setAttribute?.("data-cy", id);
   }

   /**
    * attach()
    * cause this UI object to attach itself to a given DIV.ID
    * of an existing HTML object.
    * @param {string} id
    *        the <DIV ID="id"> value of the HTML element to display this UI
    *        inside.
    * @return {Webix View}
    *        returns an instance of the Webix UI object generated by our
    *        .ui() description.
    */
   attach(id) {
      var ui = this.ui();
      if (ui && id) {
         ui.container = id;
      }

      this.el = webix.ui(ui);
      return this.el;
   }

   changePage(pageId) {
      this.emit("changePage", pageId);
   }

   hide() {
      if (this.ids?.component) {
         $$(this.ids.component).hide();
      }
   }

   label(key, ...params) {
      if (this.AB) {
         return this.AB.Multilingual.label(key, key, ...params);
      }
      console.error(".labels() called before .AB was set!");
      return key;
   }

   /**
    * ui()
    * return a Webix user interface definition for this UI component.
    * This should be just the json description, not an active instance.
    * @return {obj}
    */
   ui() {
      console.error(
         "ClassUI.ui(): it is expected that sub classes of ClassUI will implement their own ui() method."
      );
   }

   show() {
      if (this.ids?.component) {
         $$(this.ids.component)?.show();
      }
   }

   get WARNING_ICON() {
      return `<span class="webix_sidebar_dir_icon webix_icon fa fa-warning pulseLight smalltext"></span>`;
   }

   get WARNING_ICON_DARK() {
      return this.WARNING_ICON.replace("pulseLight", "pulseDark");
   }
}

export default ClassUI;
