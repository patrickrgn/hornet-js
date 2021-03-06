"use strict";

import React = require("react");

export interface SpinnerProps extends React.Props<any> {
    scheduleDelayInMs?: number;
    minimalShowTimeInMs?: number;
    loadingTitle?: string;
    loadingText?: string;
    imageLoadingUrl?: string;
}

