"use strict";
import utils = require("hornet-js-utils");
var logger = utils.getLogger("hornet-js-core.session.session");

var sessionManager = null;

class Session {
    private sid:string;
    private data:any = {};
    private creationTime:Date;
    private lastAccessedTime:Date;
    private maxInactiveInterval;

    constructor(sid:string, maxInactiveInterval, data?) {
        this.sid = sid;
        this.maxInactiveInterval = maxInactiveInterval;
        this.creationTime = this.lastAccessedTime = new Date();

        if (typeof data === "object" && data !== null) {
            this.data = data;
        }
        if (utils.isServer && !sessionManager) sessionManager = require("src/session/session-manager");
    }

    getId() {
        return this.sid;
    }

    getData() {
        return this.data;
    }

    invalidate(fn:Function) {
        if (utils.isServer) {
            sessionManager.invalidate(this, fn);
        } else {
            logger.warn("Session.invalidate() called within the browser ... discarding");
        }
    }

    getAttribute(key:string):any {
        return this.data[key];
    }

    setAttribute(key:string, value:any) {
        this.data[key] = value;
    }

    removeAttribute(key:string) {
        delete this.data[key];
    }

    touch() {
        this.lastAccessedTime = new Date();
    }

    getCreationTime() {
        return this.creationTime;
    }

    getLastAccessTime() {
        return this.lastAccessedTime;
    }

    getMaxInactiveInterval() {
        return this.maxInactiveInterval;
    }
}

export = Session;
