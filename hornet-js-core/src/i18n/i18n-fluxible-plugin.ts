"use strict";

import utils = require("hornet-js-utils");
var logger = utils.getLogger("hornet-js-core.i18n.i18n-fluxible-plugin");
var IntlMessageFormat = require("intl-messageformat");
/** Messages par défaut du framework hornet */
var hornetMessages:any = require("../i18n/hornet-messages-components");


/**
 * Retourne le(s) message(s) correspondant à la clé passée en paramètre contenu(s) dans this.messages ou dans les messages par défaut du framework.
 * Si la clé n'existe pas elle est retournée directement.
 * @param keysString clé recherchée
 * @returns {any} soit la chaîne de caractères trouvée, soit un objet contenant un ensemble de messages, soit la clé
 */
function i18n(keysString:string):any {
    return I18nFluxiblePlugin.getMessagesOrDefault(keysString, this.messages, hornetMessages);
}

function formatMsg(message, values):string {
    var msg = new IntlMessageFormat(message);
    return msg.format(values);
}

class I18nFluxiblePlugin {
    createPlugin() {

        logger.trace("Crée plugin Fluxible pour l'internationalisation");

        /*
         INFOS:
         ->> coté serveur le dehydrate se fait au niveau context plugin
         ->> coté client le rehydrate se fait au niveau APPLICATION
         */

        return {
            // CONFIGURATION DU PLUGIN (voir doc fluxible)
            // Required unique name property
            name: "InternationalisationPlugin",
            // Called after context creation to dynamically create a context plugin
            plugContext: function (options) {
                // `options` is the same as what is passed into `createContext(options)`
                var messages = options.messages;
                var locale = options.locale;
                // Returns a context plugin
                return {
                    // Method called to allow modification of the component context
                    plugComponentContext: function (componentContext) {
                        componentContext.locale = locale;
                        componentContext.i18n = I18nFluxiblePlugin.i18n(messages);
                    },
                    plugActionContext: function (actionContext) {
                        // accessible dans l'action context
                        actionContext.locale = locale;
                        actionContext.i18n = i18n.bind(actionContext);
                        actionContext.formatMsg = formatMsg;
                        actionContext.messages = messages;
                    },


                    // Allows context plugin settings to be persisted between server and client. Called on server
                    // to send data down to the client
                    dehydrate: function () {
                        logger.trace("dehydrate plugin Fluxible pour l'internationalisation");
                        return {
                            i18nMessages: messages,
                            locale: locale
                        };
                    },
                    // Called on client to rehydrate the context plugin settings
                    rehydrate: function (state) {
                        logger.trace("rehydrate plugin Fluxible pour l'internationalisation");
                        messages = state.i18nMessages;
                        locale = state.locale;
                    }
                };
            }

        };
    }

    /**
     * Renvoie la fonction récupérant les messages internationalisés dans 'messages' ou dans les messages par défaut du framework
     * @param messages messages internationalisés
     * @returns {function(string):any}
     */
    static i18n(messages:Object):(string)=>any {

        /**
         * Retourne le(s) message(s) correspondant à la clé passée en paramètre contenu(s) dans 'messages'
         * ou dans les messages par défaut du framework.
         * Si la clé n'existe pas elle est retournée directement.
         * @param keysString clé recherchée
         * @param messages objet contenant les messages à utiliser
         * @param defaultMessages objet contenant les messages par défaut à utiliser
         * @returns {any} soit la chaîne de caractères trouvée, soit un objet contenant un ensemble de messages, soit la clé
         */
        return function (keysString):any {
            return I18nFluxiblePlugin.getMessagesOrDefault(keysString, messages, hornetMessages);
        };
    }

    /**
     * Retourne le(s) message(s) correspondant à la clé passée en paramètre contenu(s) dans 'messages'.
     * Si la clé n'existe pas elle est retournée directement.
     * @param keysString clé recherchée
     * @param messages objet contenant les messages à utiliser
     * @returns {any} soit la chaîne de caractères trouvée, soit un objet contenant un ensemble de messages, soit la clé
     */
    static getMessages(keysString:string, messages:Object):any {
        logger.trace("I18N getMessages :", keysString);
        var currentMessages:any;
        if (keysString) {
            currentMessages = messages;

            var keyArray:string[] = keysString.split(".");

            keyArray.every(function (key, index, array) {
                // descend dans l'arborescence
                currentMessages = currentMessages[key];

                if (currentMessages === undefined) {
                    return false; // non définit
                } else {
                    /* On continue la descente dans l'arborescence */
                    return true;
                }
            });
        }
        return currentMessages !== undefined ? currentMessages : keysString;
    }

    /**
     * Retourne le(s) message(s) correspondant à la clé passée en paramètre contenu(s) dans 'messages' ou dans 'defaultMessages'.
     * Si la clé n'existe pas elle est retournée directement.
     * @param keysString clé recherchée
     * @param messages objet contenant les messages à utiliser
     * @param defaultMessages objet contenant les messages par défaut à utiliser
     * @returns {any} soit la chaîne de caractères trouvée, soit un objet contenant un ensemble de messages, soit la clé
     */
    static getMessagesOrDefault(keysString:string, messages:Object, defaultMessages:Object) {
        var result = I18nFluxiblePlugin.getMessages(keysString, messages);
        if (result === keysString) {
            result = I18nFluxiblePlugin.getMessages(keysString, defaultMessages);
            if (result === keysString && I18nFluxiblePlugin.isMessageKey(keysString)) {
                logger.warn("Message non défini pour la clé :", keysString);
            }
        }
        return result;
    }

    /**
     * Vérifie si la chaîne de caractères respecte le format commun pour une clé de message internationalisé :
     * caractères alphanumériques non accentués, tiret ou tiret bas, séparation par des points.
     * @param str chaîne de caractères à tester
     * @returns {boolean} true lorsque keyString respecte le format habituel
     */
    static isMessageKey(str:string):boolean {
        var res = false;
        if (str) {
            res = new RegExp("^\\w+([-_\\.]\\w+)*$").test(str);
        }
        return res;
    }

}

export = I18nFluxiblePlugin;
