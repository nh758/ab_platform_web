var EventEmitter = require("events").EventEmitter;

class ClassUI extends EventEmitter {
   constructor() {
      super();
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
}

export default ClassUI;
