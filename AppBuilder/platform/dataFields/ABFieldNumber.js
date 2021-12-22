const ABFieldNumberCore = require("../../core/dataFields/ABFieldNumberCore");

var INIT_EDITOR = false;
// {bool} INIT_EDITOR
// Transition code between previous Framework and current.
// we now need to wait until webix is declared or accessible globally.

module.exports = class ABFieldNumber extends ABFieldNumberCore {
   constructor(values, object) {
      if (!INIT_EDITOR) {
         // NOTE: if you need a unique [edit_type] by your returned config.editor above:
         webix.editors.number = webix.extend(
            {
               // TODO : Validate number only
            },
            webix.editors.text
         );
         INIT_EDITOR = true;
      }
      super(values, object);
   }
   /*
    * @function propertiesComponent
    *
    * return a UI Component that contains the property definitions for this Field.
    *
    * @param {App} App the UI App instance passed around the Components.
    * @param {stirng} idBase
    * @return {Component}
    */
   // static propertiesComponent(App, idBase) {
   //    return ABFieldNumberComponent.component(App, idBase);
   // }

   ///
   /// Working with Actual Object Values:
   ///

   /**
    * @method formComponent
    * returns a drag and droppable component that is used on the UI
    * interface builder to place form components related to this ABField.
    *
    * an ABField defines which form component is used to edit it's contents.
    * However, what is returned here, needs to be able to create an instance of
    * the component that will be stored with the ABViewForm.
    */
   // return the grid column header definition for this instance of ABFieldNumber
   columnHeader(options) {
      var config = super.columnHeader(options);

      config.editor = "number"; // [edit_type] simple inline editing.

      config.format = (d) => {
         var rowData = {};
         rowData[this.columnName] = d;

         return this.format(rowData);
      };

      return config;
   }

   /**
    * @method formComponent
    * returns a drag and droppable component that is used on the UI
    * interface builder to place form components related to this ABField.
    *
    * an ABField defines which form component is used to edit it's contents.
    * However, what is returned here, needs to be able to create an instance of
    * the component that will be stored with the ABViewForm.
    */
   formComponent() {
      return super.formComponent("numberbox");
   }

   detailComponent() {
      var detailComponentSetting = super.detailComponent();

      detailComponentSetting.common = () => {
         return {
            key: "detailtext",
         };
      };

      return detailComponentSetting;
   }
};
