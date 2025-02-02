import ClassUI from "./ClassUI.js";
import Bootstrap from "../init/Bootstrap.js";

class PortalAuthLoginForm extends ClassUI {
   constructor() {
      super();
   }

   ui() {
      var self = this;

      if (!this.AB) {
         // we need to init() before being able to translate our UI:
         return {
            id: "portal_auth_login_container",
         };
      }

      var L = this.AB.Label();

      return {
         id: "portal_auth_login_container",
         css: "portalLogin",
         cols: [
            {},
            {
               rows: [
                  {},
                  {
                     width: 360,
                     rows: [
                        {
                           css: "portalLoginForm",
                           padding: 30,
                           rows: [
                              {
                                 template:
                                    "<div style='text-align: center; font-size:160px; line-height: 160px;'><i style='background-color: #666; color: transparent; text-shadow: 0px 1px 1px rgba(255,255,255,0.5); -webkit-background-clip: text; -moz-background-clip: text; background-clip: text;' class='fa fa-user-circle-o'></i></div>",
                                 borderless: true,
                                 height: 190,
                                 type: "clean",
                              },
                              {
                                 id: "portal_auth_login_form",
                                 view: "form",
                                 type: "clean",
                                 css: { background: "transparent !important" },
                                 borderless: true,
                                 elementsConfig: {
                                    bottomPadding: 20,
                                    height: 52,
                                 },
                                 elements: [
                                    {
                                       id: "portal_auth_login_form_tenantList",
                                       view: "select",
                                       // label: "Tenant",
                                       name: "tenant",
                                       attributes: {
                                          "data-cy":
                                             "portal_auth_login_form_tenantList",
                                       },
                                       value: 1,
                                       options: [
                                          { id: 1, value: "Master" },
                                          { id: 2, value: "Release" },
                                       ],
                                    },
                                    {
                                       view: "text",
                                       placeholder: L("Email"),
                                       name: "email",
                                       id: "email",
                                       attributes: {
                                          "data-cy":
                                             "portal_auth_login_form_email",
                                       },
                                       // required: true,
                                       validate: webix.rules.isEmail,
                                       invalidMessage: L(
                                          "Please enter a valid email."
                                       ),
                                       validateEvent: "blur",
                                    },
                                    {
                                       view: "text",
                                       type: "password",
                                       placeholder: L("Password"),
                                       name: "password",
                                       attributes: {
                                          "data-cy":
                                             "portal_auth_login_form_password",
                                       },
                                       // required: true,
                                       validate: webix.rules.isNotEmpty,
                                       invalidMessage: L(
                                          "Please enter your password."
                                       ),
                                       validateEvent: "blur",
                                    },
                                    {
                                       margin: 10,
                                       paddingX: 2,
                                       borderless: true,
                                       cols: [
                                          {},
                                          {
                                             view: "button",
                                             label: L("Login"),
                                             type: "form",
                                             id: "portal_auth_login_form_submit",
                                             css: "webix_primary",
                                             width: 150,
                                             hotkey: "enter",
                                             click() {
                                                var form = $$(
                                                   "portal_auth_login_form"
                                                );
                                                if (form.validate()) {
                                                   $$(
                                                      "portal_auth_login_form_submit"
                                                   ).hide();
                                                   $$(
                                                      "portal_auth_login_form_submit_wait"
                                                   ).show();

                                                   var values =
                                                      form.getValues();
                                                   self.error(); // hids the error message

                                                   // this.AB.Network.post()
                                                   // can either be a Relay or Rest operation.
                                                   // we should get the response from the
                                                   // published JobRequest initialized in
                                                   // the .init() routine.
                                                   self.AB.Network.post(
                                                      {
                                                         url: "/auth/login",
                                                         data: values,
                                                      },
                                                      {
                                                         key: "portal_auth_login" /*, context:{} */,
                                                      }
                                                   ).catch((err) => {
                                                      $$(
                                                         "portal_auth_login_form_submit"
                                                      ).show();
                                                      $$(
                                                         "portal_auth_login_form_submit_wait"
                                                      ).hide();
                                                      console.log(err);
                                                   });
                                                }
                                             },
                                             on: {
                                                onAfterRender() {
                                                   ClassUI.CYPRESS_REF(this);
                                                },
                                             },
                                          },
                                          {
                                             view: "button",
                                             label: "<i class='fa fa-circle-o-notch fa-fw fa-spin'></i>",
                                             type: "form",
                                             id: "portal_auth_login_form_submit_wait",
                                             css: "webix_primary",
                                             width: 150,
                                             hidden: true,
                                          },
                                          {},
                                       ],
                                    },
                                    {
                                       margin: 10,
                                       paddingX: 2,
                                       borderless: true,
                                       cols: [
                                          {},
                                          {
                                             view: "button",
                                             label: L("Forgot password?"),
                                             css: "webix_transparent",
                                             click: () => {
                                                this.emit("request.reset");
                                                // $$("portal_auth_login").hide();
                                                // $$("password_reset_email").show();
                                             },
                                             width: 150,
                                          },
                                          {},
                                       ],
                                    },
                                    {
                                       id: "portal_auth_login_form_errormsg",
                                       view: "template",
                                       css: "webix_control",
                                       height: 32,
                                       on: {
                                          onAfterRender() {
                                             ClassUI.CYPRESS_REF(this);
                                          },
                                       },
                                    },
                                 ],
                              },
                           ],
                        },
                     ],
                  },
                  {},
               ],
            },
            {},
         ],
      };
   }

   error(message) {
      var $errMsg = $$("portal_auth_login_form_errormsg");
      if (message) {
         $errMsg.setHTML(
            `<div class='webix_invalid'><div class='webix_inp_bottom_label'><center>${message}</center></div></div>`
         );
         $errMsg.show();
      } else {
         $errMsg.hide();
      }
   }

   init(AB) {
      this.AB = AB;

      // now replace our initial placeholder with our viewable form
      webix.ui(this.ui(), $$("portal_auth_login_container"));

      var siteConfig = this.AB.Config.siteConfig();
      if (siteConfig) {
         // replace options in tenant list with siteConfig.tenants:
         var newOptions = [];
         (siteConfig.tenants || []).forEach((t) => {
            var opt = {
               id: t.uuid,
               value: t.title || t.key,
            };
            newOptions.push(opt);
         });

         $$("portal_auth_login_form_tenantList").define("options", newOptions);
         if (newOptions.length == 0) {
            console.warn("no tenants returned");
            $$("portal_auth_login_form_tenantList").hide();
         } else {
            $$("portal_auth_login_form_tenantList").show();
         }
      }

      var tID = this.AB.Tenant.id();
      if (tID) {
         $$("portal_auth_login_form_tenantList").define("value", tID);
      }

      this.error(); // hides the default error message.

      this.AB.Network.on("portal_auth_login", (context, err, response) => {
         // Listen for our login responses:
         // console.log("Network.on():", context, err, response);

         if (err) {
            // any http 400-500 response should show up here:
            if (err.code) {
               switch (err.code) {
                  case "EINVALIDLOGIN":
                     this.error(err.message);
                     break;

                  case "EFAILEDATTEMPTS":
                     this.error(err.message);
                     $$("portal_auth_login_form_submit").hide();
                     break;

                  default:
                     this.AB.error(err);
                     break;
               }
            }
            return;
         }

         if (
            response.user ||
            (response.status == "success" && response.data.user)
         ) {
            // reload the page to gather all the config info:
            window.location.reload(true);

            // Login was successful -> rerun BootStrap.init() to load the
            // config, definitions, plugins, etc for this user
            // Bootstrap.init(this.AB).catch((err) => {
            //    Bootstrap.alert({
            //       type: "alert-error",
            //       title: "Error initializing Portal:",
            //       text: err.toString(),
            //    });
            //    Bootstrap.error(err);
            // });
         } else {
            if (response.status == "error") {
               console.log("what to do with this error:");
               console.error(response);
            }
         }
      });

      return Promise.resolve();
   }

   show() {
      $$("portal_auth_login_container").show();
   }
}

export default new PortalAuthLoginForm();
