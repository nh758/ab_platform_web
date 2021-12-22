// const ABComponent = require("./ABComponent");
import ClassUI from "../../ui/ClassUI";
const ABViewForm = require("../platform/views/ABViewForm");

var L = null;

export default class RowUpdater extends ClassUI {
   constructor(idBase, AB) {
      super({
         form: `${idBase}_rowUpdaterForm`,
         addNew: `${idBase}_rowUpdaterAddNew`,
         field: `${idBase}_rowUpdaterField`,
      });

      this.idBase = idBase;

      this._Object = null;
      // {ABObject}
      // The ABObject we are building a form for.

      this._mockFormWidget = null;
      // {ABViewForm}
      // When building our form components to display, they need a
      // ABViewForm to be associated with.

      this.AB = AB;

      if (!L) {
         L = (...params) => {
            return this.AB.Multilingual.label(...params);
         };
      }
   }

   /**
    * @method uiItem()
    * Return the webix description of a new field/value row.
    * @return {json}
    */
   uiItem() {
      var self = this;
      return {
         view: "layout",
         isolate: true,
         cols: [
            {
               // Label
               view: "label",
               width: 40,
               label: L("Set"),
            },
            {
               // Field list
               view: "combo",
               id: this.ids.field,
               options: this.getFieldList(true),
               on: {
                  onChange: function (columnId) {
                     let $viewCond = this.getParentView();
                     self.selectField(columnId, $viewCond);
                  },
               },
            },
            {
               // Label
               view: "label",
               width: 40,
               label: L("To"),
            },
            // Field value
            {},
            {
               // "Remove" button
               view: "button",
               css: "webix_danger",
               icon: "fa fa-trash",
               type: "icon",
               autowidth: true,
               click: function () {
                  let $viewCond = this.getParentView();
                  self.removeItem($viewCond);
               },
            },
         ],
      };
   }

   /**
    * @method ui()
    * return the webix description of our Entry form.
    * @return {json}
    */
   ui() {
      // webix UI definition:
      return {
         rows: [
            {
               view: "form",
               id: this.ids.form,
               hidden: true,
               borderless: true,
               elements: [],
            },
            {
               view: "button",
               id: this.ids.addNew,
               css: "webix_primary",
               icon: "fa fa-plus",
               type: "iconButton",
               label: L("Add field to edit"),
               click: () => {
                  this.addItem();
               },
            },
         ],
      };
   }

   init(/* AB */) {
      return Promise.resolve();
   }

   /**
    * @method addItem()
    * Add another field/value entry item to our form.
    * @param {integer} index
    *        which position in the list of form elements do we want to
    *        insert the new row.
    * @return {string} the webix .id of the new row we just added.
    */
   addItem(index) {
      let $form = $$(this.ids.form);

      let remainFields = this.getFieldList(true);
      if (remainFields.length < 1) return;

      let ui = this.uiItem();

      let viewId = $form.addView(ui, index);

      this.toggleForm();

      return viewId;
   }

   /**
    * @method getFieldList()
    * Return an array of options in a webix.list format that represents the
    * possible fields that can be selected on the current ABObject.
    * @param {bool} excludeSelected
    *        should we exclude from the list the fields that are ALREADY
    *        displayed on the form?
    * @return {array} [ { id, value }, ... ]
    *         id: ABField.id
    *         value: ABField.label
    */
   getFieldList(excludeSelected) {
      let options = (this._Object.fields() || []).map((f) => {
         return {
            id: f.id,
            value: f.label,
         };
      });

      if (excludeSelected) {
         let $form = $$(this.ids.form);

         $form.getChildViews().forEach(($viewCond) => {
            // Ignore "Add new" button
            if (!$viewCond || !$viewCond.$$) return;

            let $fieldElem = $viewCond.$$(this.ids.field);
            if (!$fieldElem) return;

            let fieldId = $fieldElem.getValue();
            if (!fieldId) return;

            options = options.filter((opt) => opt.id != fieldId);
         });
      }
      return options;
   }

   /**
    * @method getValue
    * Return an array of field:value results that have been entered on this
    * form.
    * @return {Array}
    *         [
    *            {
    *               fieldId: {UUID}
    *               value: {Object}
    *            },
    *            ...
    *         ]
    */
   getValue() {
      let result = [];

      let $form = $$(this.ids.form);
      if ($form) {
         $form.getChildViews().forEach(($viewCond) => {
            // Ignore "Add new" button
            if (!$viewCond || !$viewCond.$$) return;

            let $fieldElem = $viewCond.$$(this.ids.field);
            if (!$fieldElem) return;

            let fieldId = $fieldElem.getValue();
            if (!fieldId) return;

            let $valueElem = $viewCond.getChildViews()[3];
            if (!$valueElem) return;

            let fieldInfo = this._Object.fieldByID(fieldId);

            let val;
            if (fieldInfo.key == "date" || fieldInfo.key == "datetime") {
               let currDateCheckbox = $valueElem.getChildViews()[0];
               if (currDateCheckbox.getValue() == true) {
                  val = "ab-current-date";
               } else {
                  let datePicker = $valueElem.getChildViews()[1];
                  val = fieldInfo.getValue(datePicker);
               }
            } else {
               // Get value from data field manager
               val = fieldInfo.getValue($valueElem);
            }

            // Add to output
            result.push({
               fieldId: fieldId,
               value: val,
            });
         });
      }

      return result;
   }

   /**
    * @method objectLoad
    * Load the Object we are currently working with.
    * @param {ABObject} object
    */
   objectLoad(object) {
      this._Object = object;

      this._mockApp = this.AB.applicationNew({});
      this._mockFormWidget = new ABViewForm(
         {
            settings: {
               showLabel: false,
               labelWidth: 0,
            },
         },
         this._mockApp // just need any ABApplication here
      );
      this._mockFormWidget.objectLoad(object);

      this.setValue(null); // clear
   }

   /**
    * @method removeItem
    * Remove the current form row.
    * @param {webix.view} $viewCond
    *        This is the webix.view that contains the whole value row
    *        we are removing.
    */
   removeItem($viewCond) {
      let $form = $$(this.ids.form);
      $form.removeView($viewCond);
      this.toggleForm();
   }

   /**
    * @method selectField
    * Update the value display when a field is selected. Changing to a
    * different field will change the types of values that can be entered.
    * @param {string} columnId
    *        The field.uuid of the object that was selected.
    * @param {webix.view} $viewCond
    *        The webix.view that contains the value expression of the field
    *        that was selected.
    */
   selectField(columnId, $viewCond) {
      let field = this._Object.fieldByID(columnId);
      if (!field) {
         this.AB.notify.builder(
            new Error(`could not find field for id[${columnId}]`),
            {
               context: "RowUpdater.selectField() could not find a field",
               fieldID: columnId,
            }
         );
         return;
      }
      let fieldComponent = field.formComponent(),
         formFieldWidget = fieldComponent.newInstance(
            this._mockApp,
            this._mockFormWidget
         ),
         formFieldComponent = formFieldWidget.component(
            this.AB._App,
            this.idBase
         ),
         inputView = formFieldComponent.ui;

      // WORKAROUND: add '[Current User]' option to the user data field
      switch (field.key) {
         case "user":
            inputView.options = inputView.options || [];
            inputView.options.unshift({
               id: "ab-current-user",
               value: L("[Current User]"),
            });
            break;
         case "date":
         case "datetime":
            inputView = {
               view: "layout",
               rows: [
                  {
                     view: "checkbox",
                     labelWidth: 0,
                     labelRight: L("Current Date/Time"),
                     on: {
                        onChange: function (newVal) {
                           let layout = this.getParentView();
                           if (!layout) return;

                           let datePicker = layout.getChildViews()[1];
                           if (!datePicker) return;

                           newVal ? datePicker.hide() : datePicker.show();
                        },
                     },
                  },
                  inputView,
               ],
            };
            break;
      }

      // Change component to display value
      $viewCond.removeView($viewCond.getChildViews()[3]);
      $viewCond.addView(inputView, 3);

      formFieldComponent.init();

      // Show custom display of data field
      if (field.customDisplay)
         field.customDisplay(
            {},
            this.AB._App,
            $viewCond.getChildViews()[3].$view
         );

      // _logic.refreshFieldList();
      // $$(this).adjust();
      $$($viewCond).adjust();
      $viewCond.getFormView().adjust();
   }

   /**
    * @method setValue
    * Given the previous settings, redraw the form with the field/value
    * entries.
    * @param {array} settings
    *        [
    *           {
    *              fieldId: {UUID}
    *              value: {Object|String}
    *           }, ...
    *        ]
    */
   setValue(settings) {
      let $form = $$(this.ids.form);
      if (!$form) return;

      // Redraw form with no elements
      webix.ui([], $form);

      settings = settings || [];
      if (settings.length < 1) return;

      settings.forEach((item) => {
         let $viewItem = $$(this.addItem());

         $viewItem.$$(this.ids.field).setValue(item.fieldId);

         let $valueElem = $viewItem.getChildViews()[3];
         if (!$valueElem) return;

         let fieldInfo = this._Object.fieldByID(item.fieldId);
         if (!fieldInfo) return;

         // Set value
         let rowData = {};
         rowData[fieldInfo.columnName] = item.value;
         fieldInfo.setValue($valueElem, rowData);
      });

      this.toggleForm();
   }

   /**
    * @method toggleForm
    * decide if the form with the field/value elements should be displayed.
    */
   toggleForm() {
      let $form = $$(this.ids.form);
      if ($form) {
         let childViews = $form.getChildViews();
         if (childViews && childViews.length) {
            $form.show();
         } else {
            $form.hide();
         }
      }
   }
}
