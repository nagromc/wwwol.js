/*jslint node: true*/

"use strict";

/**
 * A host is represented by a hardware address and a name.
 * @class
 */
var Host = function (hwaddr, name) {
    this.hwaddr = hwaddr;
    this.name = name;
};
